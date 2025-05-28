// server/server.js
const express = require('express'); // A minimal and flexible Node.js web appliation framework that provides a robust set of features for web and mobile applications.
const path = require('path'); // To work with directories and file paths on the machine
const cors = require('cors'); // Provides a Connect/Express middleware that can be used to enable CORS (Cross-origin resource sharing) with various options
const fs = require('fs'); // To work with the file system on machine
const db = require('./db'); // This is for the SQLite setup

const app = express(); // Create a new framework instance
const PORT = process.env.PORT || 3000; // Backend server port

// Middleware
app.use(cors()); // Allow request from frontend (Vite dev server)
app.use(express.json({ limit: '10mb' })); // To parse JSON request bodies, incerease limit for SVG data
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data from POST requests and make it available in req.body (extended: true allows rich objects and arrays)

// Static serving of approved gallery images (if you move them to a public subfolder)
app.use('/gallery_images', express.static(path.join(__dirname, 'data', 'approved')));
// Or if you put them directly into Vite's public folder after approval:
// app.use('/gallery_images', express.static(path.join(__dirname, '.', 'public', 'gallery_assets')));

// Ensure upload directories exist
const stagingDir = path.join(__dirname, 'data', 'staging');
const rejectedDir = path.join(__dirname, 'data', 'rejected');
const approvedDir = path.join(__dirname, 'data', 'approved'); // Or the Vite public subfolder

if(!fs.existsSync(stagingDir)) fs.mkdirSync(stagingDir, { recursive: true }); // Create the staging directory if it doesn't exist (recursive: true creates parent directories too)
if(!fs.existsSync(rejectedDir)) fs.mkdirSync(rejectedDir, { recursive: true });
if(!fs.existsSync(approvedDir)) fs.mkdirSync(approvedDir, { recursive: true });

// API Routes
const imageRoutes = require('./routes/images');
app.use('/api', imageRoutes);

// Simple Admin Page (example using EJS, or just static HTML)
app.set('view engine', 'ejs'); // Set EJS (Embedded JS) as the templating engine to render dynamic HTML pages
app.set('views', path.join(__dirname, 'views'));

app.get('/admin', (req, res) => {
  // Basic password protection (replace with stronger for production)
  const auth = { login: 'admin', password: 'password' }; // Keep this out of client-side code. This is server-side so it's ok, but we can do better.

  // This line handles HTTP Basic Authentication where the browser sends credentials in the header like "Basic YWRtaW46cGFzc3dvcmQ=". It splits on the space to get just the base64 part, with fallbacks to empty string if the header is missing or malformed.
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''; // Extract the base64-encoded credentials from the Authorization header (format: "Basic <base64string>")
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':'); // Decode the base64 credentials and split on ':' to get username and password separately

  if (login && password && login === auth.login && password === auth.password) {
    // Fetch pending images to pass to the admin template
    const stmt = db.prepare("SELECT id, filename, staging_path FROM gallery_images WHERE status = 'pending' ORDER BY staged_at DESC");
    const pendingImages = stmt.all();
    return res.render('admin', { pendingImages });
  }

  // The following two lines tell the client (e.g., a web browser) that access to the requested resource is denied because authentication is needed, and it specifies that "Basic" authentication should be used for the designated "realm". Browsers will typically then show a pop-up dialog asking for a username and password.
  // ...
  // Sets the WWW-Authenticate header to indicate 'Basic' authentication is required for the "401" realm.
  res.set('WWW-Authenticate', 'Basic realm="401"');
  // Sends a 401 (Unauthorized) HTTP status code and the message 'Authentication required.' to the client.
  res.status(401).send('Authentication required.');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
