// server/routes/images.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../db'); // Your SQLite connection

const stagingDir = path.join(__dirname, '..', 'data', 'staging');
const rejectedDir = path.join(__dirname, '..', 'data', 'rejected');
const approvedDir = path.join(__dirname, '..', 'data', 'approved'); // server-side storage
// const vitePublicGalleryDir = path.join(__dirname, '..', '..', 'public', 'gallery_assets'); // if moving to Vite's public

// POST /api/uploadImage
router.post('/uploadImage', (req, res) => {
    const { svgData } = req.body;

    if (!svgData) {
        return res.status(400).json({ message: 'No SVG data received.' });
    }

    const timestamp = Date.now();
    const filename = `image_${timestamp}.svg`;
    const stagingPath = path.join(stagingDir, filename);
    const relativeStagingPath = path.join('data', 'staging', filename); // Path relative to server root for DB

    fs.writeFile(stagingPath, svgData, (err) => {
        if (err) {
            console.error('Error saving SVG to staging:', err);
            return res.status(500).json({ message: 'Failed to save image for review.' });
        }

        const stmt = db.prepare(`INSERT INTO gallery_images (filename, staging_path, status) VALUES (?, ?, 'pending')`);
        stmt.run(filename, relativeStagingPath, function(err) {
            if (err) {
                console.error('Error saving image record to DB:', err);
                // Optionally, try to delete the staged file if DB insert fails
                fs.unlink(stagingPath, () => {});
                return res.status(500).json({ message: 'Failed to record image submission.' });
            }
            res.status(201).json({ message: 'Image submitted for review!', submissionId: this.lastID });
        });
        stmt.finalize();
    });
});

// GET /api/galleryImages
router.get('/galleryImages', (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const stmt = db.prepare(`
        SELECT id, filename, gallery_path, approved_at
        FROM gallery_images
        WHERE status = 'approved'
        ORDER BY approved_at DESC
        LIMIT ? OFFSET ?
    `);
    stmt.all(limit, offset, (err, rows) => {
        if (err) {
            console.error('Error fetching gallery images:', err);
            return res.status(500).json({ message: 'Failed to retrieve gallery images.' });
        }
        // Get total count for pagination
        const countStmt = db.prepare("SELECT COUNT(*) as count FROM gallery_images WHERE status = 'approved'");
        countStmt.get((err, countRow) => {
            if(err) { /* handle error */ }
            res.json({
                images: rows,
                totalPages: Math.ceil((countRow ? countRow.count : 0) / limit),
                currentPage: page
            });
        });
        countStmt.finalize();
    });
    stmt.finalize();
});

// POST /api/moderateImage (for admin use)
router.post('/moderateImage', (req, res) => {
    // Implement basic auth check here again or via middleware for admin routes
    const { imageId, action } = req.body; // action: 'approve' or 'reject'

    if (!imageId || !action) {
        return res.status(400).json({ message: 'Missing imageId or action.' });
    }

    const selectStmt = db.prepare("SELECT * FROM gallery_images WHERE id = ? AND status = 'pending'");
    selectStmt.get(imageId, (err, imageRecord) => {
        if (err || !imageRecord) {
            return res.status(404).json({ message: 'Image not found or not pending.' });
        }

        const oldPath = path.join(__dirname, '..', imageRecord.staging_path); // staging_path is relative from server.js

        if (action === 'approve') {
            const newFilename = imageRecord.filename; // Keep the same filename
            const newGalleryPathDisk = path.join(approvedDir, newFilename);
            // const newGalleryPathPublicVite = path.join(vitePublicGalleryDir, newFilename); // If using Vite's public
            const newGalleryUrlPath = `/gallery_images/${newFilename}`; // URL path

            fs.rename(oldPath, newGalleryPathDisk, (err) => { // Or newGalleryPathPublicVite
                if (err) {
                    console.error('Error moving image to gallery:', err);
                    return res.status(500).json({ message: 'Failed to approve image (file move).' });
                }
                const updateStmt = db.prepare("UPDATE gallery_images SET status = 'approved', approved_at = CURRENT_TIMESTAMP, gallery_path = ? WHERE id = ?");
                updateStmt.run(newGalleryUrlPath, imageId, (err) => {
                    if (err) return res.status(500).json({ message: 'Failed to update image status (db).' });
                    res.json({ message: `Image ${imageId} approved.` });
                });
                updateStmt.finalize();
            });

        } else if (action === 'reject') {
            const rejectedPath = path.join(rejectedDir, imageRecord.filename);
            fs.rename(oldPath, rejectedPath, (err) => {
                if (err) {
                    console.error('Error moving image to rejected:', err);
                    return res.status(500).json({ message: 'Failed to reject image (file move).' });
                }
                const updateStmt = db.prepare("UPDATE gallery_images SET status = 'rejected' WHERE id = ?");
                updateStmt.run(imageId, (err) => {
                    if (err) return res.status(500).json({ message: 'Failed to update image status (db).' });
                    res.json({ message: `Image ${imageId} rejected.` });
                });
                updateStmt.finalize();
            });
        } else {
            return res.status(400).json({ message: 'Invalid action.' });
        }
    });
    selectStmt.finalize();
});

module.exports = router;
