## System Architecture Design Document: Projekt-X

**1. Introduction and Overview**

Projekt-X is a digital platform designed to celebrate Sarajevo's artistic soul, enabling users to create and share digital street art. It serves as a digital canvas for one week leading up to the Sarajevo Street Art Festival, with the intention of showcasing user-generated art on digital screens and billboards across the city. The project, initiated by Jason Armstrong/Jaseen, aims to provide a stage for every voice to be heard and to illuminate Sarajevo with digital art. Key functionalities include a drawing interface, image uploading to a moderated public gallery, and an administrative backend for content moderation.

**2. Architectural Style**

The system employs a **Client-Server architecture**.
* The **frontend** is a Single Page Application (SPA) or a collection of static pages enhanced with JavaScript, built using Vite.
* The **backend** is a monolithic Node.js application using the Express.js framework.

**3. Components**

The system is comprised of the following major components:

**3.1. Frontend (Client-Side)**

* **Technologies:**
    * HTML5
    * CSS (custom stylesheets for home, about, terms, gallery, paint)
    * TypeScript/JavaScript
    * Vite (build tool and dev server)
    * `js-draw` (JavaScript library for the drawing canvas)
* **Key Pages/Modules:**
    * **Home (`index.html`):** Introduces the project and provides navigation.
    * **About/Contact (`about.html`):** Provides project vision and a contact form.
    * **Terms (`terms.html`):** Outlines usage terms and community guidelines.
    * **Paint (`paint.html`):** Contains the drawing editor for users to create art.
    * **Gallery (`gallery.html`):** Displays approved artwork with pagination.
* **Functionality:**
    * Renders user interfaces.
    * Provides drawing capabilities on a digital canvas.
    * Allows users to submit their creations to the gallery.
    * Fetches and displays images from the public gallery.
    * Handles client-side routing (frontend routing marked as TODO for May 29th in `TODO.md`).
* **Development Server Command:** `npm run dev:frontend -- --host`

**3.2. Backend (Server-Side)**

* **Technologies:**
    * Node.js
    * Express.js (web application framework)
    * `cors` (for enabling Cross-Origin Resource Sharing)
    * `ejs` (templating engine for the admin page)
* **Modules:**
    * **API Server (`server.js`, `routes/images.js`):** Handles API requests for image upload, gallery retrieval, and image moderation.
    * **Admin Interface (`server.js`):** A simple web interface for administrators to review and moderate submitted images.
* **Functionality:**
    * Receives image data (SVGs) from the client.
    * Stores uploaded images in a staging area for review.
    * Updates image status and location in the database based on moderation actions.
    * Serves approved gallery images statically.
    * Provides an authenticated endpoint for administrators to view pending images and approve/reject them.
    * Manages file system operations for storing images in `staging`, `approved`, and `rejected` directories.
* **Development Server Command:** `node server/server.js`
* **Port:** `3000` (default)

**3.3. Database (Data Persistence)**

* **Technology:** SQLite
* **Database File:** `server/data/gallery.db`
* **Schema:** A single table `gallery_images` is used with the following columns:
    * `id`: INTEGER PRIMARY KEY AUTOINCREMENT
    * `filename`: TEXT UNIQUE NOT NULL
    * `staged_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
    * `approved_at`: DATETIME NULL
    * `status`: TEXT DEFAULT 'pending' (values: 'pending', 'approved', 'rejected')
    * `staging_path`: TEXT (e.g., `data/staging/image.svg`)
    * `gallery_path`: TEXT NULL (e.g., `/gallery_images/image.svg`)
* **Purpose:** Stores metadata about submitted images, including their moderation status and file paths.

**3.4. File Storage**

* **Location:** `server/data/` directory on the backend server.
* **Directories:**
    * `staging/`: Stores uploaded images awaiting moderation.
    * `approved/`: Stores images that have been approved and are publicly visible in the gallery.
    * `rejected/`: Stores images that have been rejected by moderators.
* **Purpose:** Persistently store the actual SVG image files.

**4. Data Flow**

**4.1. Image Submission Process:**
1.  The user creates an SVG image using the `js-draw` editor on the `paint.html` page.
2.  The user clicks "Save to Gallery".
3.  The frontend sends the SVG data via a `POST` request to the `/api/uploadImage` endpoint on the backend.
4.  The backend saves the SVG file to the `server/data/staging/` directory with a unique filename.
5.  The backend inserts a new record into the `gallery_images` table with `status = 'pending'` and the `staging_path`.
6.  The backend responds to the client with a success or failure message.

**4.2. Image Moderation Process:**
1.  An administrator navigates to the `/admin` page on the backend server and authenticates using Basic Authentication.
2.  The admin page fetches and displays images with `status = 'pending'` from the `gallery_images` table, allowing preview of images from the `staging_path`.
3.  The administrator can 'approve' or 'reject' an image.
4.  This action sends a `POST` request to the `/api/moderateImage` endpoint with the `imageId` and `action`.
5.  **If approved:**
    * The backend moves the image file from `server/data/staging/` to `server/data/approved/`.
    * The `gallery_images` table record is updated: `status` to 'approved', `approved_at` to current timestamp, and `gallery_path` to the public URL of the approved image (e.g., `/gallery_images/filename.svg`).
6.  **If rejected:**
    * The backend moves the image file from `server/data/staging/` to `server/data/rejected/`.
    * The `gallery_images` table record is updated: `status` to 'rejected'.

**4.3. Gallery Display Process:**
1.  A user navigates to the `gallery.html` page.
2.  The frontend JavaScript (`gallery.js`) sends a `GET` request to the `/api/galleryImages` endpoint, potentially with pagination parameters (`page`, `limit`).
3.  The backend queries the `gallery_images` table for records with `status = 'approved'`, ordered by `approved_at` DESC, and applies pagination.
4.  The backend responds with a JSON object containing the list of approved image details (including `gallery_path`) and pagination information.
5.  The frontend dynamically renders the gallery, displaying the images using their `gallery_path` which are served statically by the backend via the `/gallery_images/` route.

**5. Key System Interfaces**

* **User Interface (Web):** HTML pages (`index.html`, `about.html`, `terms.html`, `paint.html`, `gallery.html`) rendered in the user's browser.
* **REST API:**
    * `POST /api/uploadImage`: For users to submit their artwork.
    * `GET /api/galleryImages`: For clients to fetch approved gallery images.
    * `POST /api/moderateImage`: For administrators to approve or reject submissions.
* **Admin Interface (Web):** The `/admin` page for content moderation, rendered using EJS.

**6. Deployment (Development Environment)**

* **Frontend:** Served by Vite's development server.
* **Backend:** Runs as a Node.js process.
* **Static Assets:** Approved gallery images are served statically by the Express backend from the `server/data/approved/` directory via the `/gallery_images/` route. Staged images are served to authenticated admins from `server/data/staging/` via the `/data/staging/` route.

**7. Security Considerations**

* **Admin Authentication:** The `/admin` page and related image moderation functionalities are protected by Basic HTTP Authentication. The credentials are `admin:password`.
* **Content Moderation:** All user-submitted images undergo a manual review process by an administrator before being made public in the gallery. This is to prevent prohibited content (hate speech, pornography, illegal content, etc.) from being displayed.
* **Data Privacy:** The platform states that it does not collect any personal data from users.
* **Input Validation:** The backend checks for the presence of SVG data on upload. Further validation (e.g., SVG sanitization) is not explicitly mentioned but would be a good practice.
