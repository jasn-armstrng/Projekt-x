// server/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'gallery.db');

// New SQLite DB instance
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database');
    db.run(`CREATE TABLE IF NOT EXISTS gallery_images(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT UNIQUE NOT NULL,
      staged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME NULL,
      status TEXT DEFAULT 'pending', -- pending, approved, rejected
      staging_path TEXT,            -- e.g., data/staging/image.svg
      gallery_path TEXT NULL        -- e.g., /gallery_images/image.svg
    )`, (err) => {
      if (err) {
        console.error('Error creating table', err.message);
      }
    });
  }
});

module.exports = db;
