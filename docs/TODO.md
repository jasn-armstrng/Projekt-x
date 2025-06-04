### Digital canvas for the Sarajevo Street Art Festival

#### Introduction
'Sup Sarajevo,

The city is now a **DIGITAL CANVAS**. No hassle with the authorities or resident permission, **PAINT THE CITY WALLS, FLOORS, TRAMS...** from your screens - no cops, no cleanup, **SOME RULES APPLY** so we have no drama.

Your city breathes art - the walls, the streets, the food, the people - they all have a vibe that inspires, fuels, and colours life in Sarajevo. It's something **I**'ve felt from day 1.

For one week, leading up to the **SARAJEVO STREET ART FESTIVAL**, photograph and unleash your creativity here. Save your creations - share them with #sarajevostreetart, and add them to the public **GALLERY**. During festival week the gallery is going all across the city on **digital screens and billboards**, lighting up Sarajevo.

This is my respect to this city, to all you who make it what it is - express yourself and leave no surface behind.

What are you waiting for?

#### Main Features
1. A drawing canvas
2. Upload art to socials
3. Upload art to gallery
4. Download art to local drive
5. City-wide art display
6. Donate to local art/culture initiative - *Optional*

#### Pages
1. Introduction/home: `/`
2. Drawing page: `/paint.html`
3. Gallery: `/gallery.html`
4. Terms and conditions: `/terms.html`
5. About/Contact: `/about.html`
6. Donate - `TBD`

#### TODO
**Core feature implementations**
 - [X] Home/Intro page ====================== May 22nd
 - [X] About/Contact page =================== May 27th
 - [X] Terms and Conditions page ============ May 27th
 - [X] Gallery page ========================= May 27th - 28th May
    - [X] Gallery architecture design
    - [X] Database installation
    - [X] Gallery API design
    - [X] Gallery API (POST/GET) implementation
    - [ ] Gallery page styling ============== May 29th
 - [X] Drawing page ========================= May 25th
   - [X] Create "Upload image button" ======= May 28th
   - [ ] Create "Download image button" ===== May 29th
   - [ ] Style buttons ====================== May 29th
 - [X] Custom pen - Wavy/Calligraphic ======= May 26th
 - [X] Upload art to gallery ================ May 29th
 - [X] Backend Routing ====================== May 28th
 - [ ] Frontend Routing ===================== May 29th
 - [X] Generate QR code for home page ======= May 29th

 **Optional features**
 - [ ] Upload art to socials ================ TBD
 - [ ] Donate page ========================== TBD

**Demo**
   - [X] Prepare presentation =============== May 30th
   - [X] Demo
   - [X] Prepare testing feedback doc ======= May 30th

**Action items from feedback**
 - [ ] Design a Tutorial overlay to:
    - [ ] Emphasise uploading an image to the drawing canvas
    - [ ] Show that the canvas can be resized
    - [ ] Give brief description of the tools in toolbar
    - [ ] Emphasise user exploration of the drawing tools
 - [ ] Create option to pick from a gallery of preset backgrounds. =================== June 5th

**Backup**
 - [X] Upload project to github ============= May 29th

**Documentation**
 - [X] Application architecture (Ongoing)
 - [X] User story (Ongoing)
 - [ ] Roadmap to festival

#### Application architecture
```mermaid
graph TD
    User["User (Artist)"]
    Admin["Administrator"]
    QR["QR Code"]

    subgraph ClientSide["Client-Side (User's Browser)"]
        direction TB
        WebApp["Projekt-X Web App<br/>(HTML, CSS, TS/JS, Vite, js-draw)"]
        WebApp_Home["Home Page (index.html)"]
        WebApp_Paint["Paint Page (paint.html)<br/>(Drawing Canvas)"]
        WebApp_Gallery["Gallery Page (gallery.html)"]
        WebApp_Info["Info Pages (about.html, terms.html)"]

        WebApp --> WebApp_Home
        WebApp --> WebApp_Paint
        WebApp --> WebApp_Gallery
        WebApp --> WebApp_Info
    end

    subgraph ServerSide["Server-Side (Host Environment)"]
        direction TB
        BackendApp["Backend Application<br/>(Node.js, Express.js)"]
        APIServer["API Server (/api/*)<br/>(Image Upload, Gallery, Moderation)"]
        AdminUI["Admin UI (/admin)<br/>(EJS Templates, Basic Auth)"]
        StaticServing["Static File Serving<br/>(Approved: /gallery_images, Staging: /data/staging)"]

        Database["SQLite Database<br/>(gallery.db - gallery_images table)"]
        ImageStorage["File System (Server)<br/>(SVG Images: data/staging, data/approved, data/rejected)"]

        BackendApp --> APIServer
        BackendApp --> AdminUI
        BackendApp --> StaticServing
        APIServer --> Database
        APIServer --> ImageStorage
        AdminUI --> Database
        AdminUI --> ImageStorage
        StaticServing --> ImageStorage
    end

    %% User and Admin Interactions
    QR --> User
    User --> WebApp
    WebApp_Paint --> APIServer
    WebApp_Gallery --> APIServer
    WebApp_Gallery --> StaticServing

    Admin --> AdminUI
    AdminUI --> APIServer
    AdminUI --> StaticServing

    %% Styling
    classDef client fill:#f9f,stroke:#333,stroke-width:2px
    classDef server fill:#ccf,stroke:#333,stroke-width:2px
    classDef db fill:#ff9,stroke:#333,stroke-width:2px
    classDef fs fill:#9cf,stroke:#333,stroke-width:2px
    classDef actor fill:#fff,stroke:#000,stroke-width:2px

    class User,Admin actor
    class ClientSide client
    class ServerSide server
    class Database db
    class ImageStorage fs
```

#### User story


#### Roadmap to festival


#### Commands
 - Start backend: `node server/server.js`
 - Start frontend: `npm run dev:frontend -- --host`



 Design a Tutorial overlay to:
  - Emphasise uploading an image to the drawing canvas
  - Show that the canvas can be resized
  - Give brief description of the tools in toolbar
  - Emphasise user exploration of the drawing tools
