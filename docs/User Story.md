
## User Story Document: Projekt-X

**1. Introduction**

This document outlines the user stories for Projekt-X, a digital street art platform for Sarajevo. These stories represent the perspectives of the different users interacting with the system and their goals.

**2. Actors**

* **Artist/User:** An individual who visits the Projekt-X website to create, view, or learn about the project. This includes participants of the Sarajevo Street Art Festival.
* **Administrator:** A person responsible for managing the content on the platform, specifically moderating user-submitted artwork.

**3. User Stories**

**Epic: Information and Engagement**

* **As an Artist/User, I want to** understand the vision and purpose of Projekt-X, **so that I** can feel connected to its mission.
* **As an Artist/User, I want to** be greeted with an exciting message about the digital canvas initiative in Sarajevo, **so that I** am encouraged to participate.
* **As an Artist/User, I want to** know that the project is linked to the Sarajevo Street Art Festival, **so that I** understand its context and timing.
* **As an Artist/User, I want to** be able to easily find contact information or a way to get in touch, **so that I** can ask questions or provide feedback.
* **As an Artist/User, I want to** read the terms and conditions, **so that I** understand the rules for using the platform and what content is acceptable.
* **As an Artist/User, I want to** be assured that my personal data is not being collected, **so that I** can use the platform with peace of mind regarding my privacy.

**Epic: Art Creation and Submission**

* **As an Artist/User, I want to** access a digital drawing canvas, **so that I** can create my own artwork.
    * *(Based on `paint.html` and `js-draw` integration)*
* **As an Artist/User, I want to** use different pen tools (e.g., wavy/calligraphic, as mentioned in `TODO.md`), **so that I** can create expressive and unique art.
* **As an Artist/User, I want to** be able to upload a photograph to the canvas (implied by "photograph and unleash your creativity" in `index.html` and "Create 'Upload image button'" in `TODO.md`), **so that I** can use it as a base or inspiration for my digital art.
* **As an Artist/User, I want to** save my artwork to the public gallery, **so that I** can share it with the city and potentially have it displayed on public screens.
* **As an Artist/User, I want to** be informed that my submitted art will be reviewed before appearing in the public gallery, **so that I** understand there might be a delay and why.
* **As an Artist/User, I want to** be able to download my created art to my local drive (feature listed as "Create 'Download image button'" in `TODO.md`), **so that I** can keep a personal copy.
* **As an Artist/User, I want to** share my creations with the hashtag #sarajevostreetart, **so that I** can participate in the broader social media campaign.
* *(Future Feature)* **As an Artist/User, I want to** directly upload my art to social media platforms (feature listed as "Upload art to socials ================ TBD" in `TODO.md`), **so that I** can easily share it with my network.

**Epic: Gallery Interaction**

* **As an Artist/User, I want to** view a gallery of approved digital artworks, **so that I** can see what others have created and get inspired.
* **As an Artist/User, I want to** navigate through multiple pages of gallery images if there are many, **so that I** can browse all submissions conveniently.
* **As an Artist/User, I want to** know that the gallery content is moderated, **so that I** can expect a safe and respectful viewing experience.

**Epic: Administration and Moderation**

* **As an Administrator, I want to** log in securely to an admin interface, **so that** only authorized personnel can manage content.
* **As an Administrator, I want to** see a list of all images submitted by users that are pending review, **so that I** can process them in a timely manner.
* **As an Administrator, I want to** be able to preview each submitted image from its staging path, **so that I** can assess its content before making a decision.
* **As an Administrator, I want to** approve appropriate artwork, **so that it** becomes visible in the public gallery and its database record is updated.
* **As an Administrator, I want to** reject inappropriate artwork (e.g., violating community guidelines like hate speech, pornography), **so that it** is not displayed publicly and its database record is updated.
* **As an Administrator, I want** approved images to be moved to a designated 'approved' folder and rejected images to a 'rejected' folder, **so that** files are organized according to their status.

**Epic: Community Support (Future)**

* *(Future Feature)* **As an Artist/User, I want to** have the option to donate to a local art/culture initiative (feature listed as "Donate to local art/culture initiative - *Optional*" and "Donate page ========================== TBD" in `TODO.md`), **so that I** can support the local arts scene.
