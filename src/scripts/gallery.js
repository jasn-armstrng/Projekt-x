// src/scripts/gallery.js
document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('gallery-container');
    const paginationControls = document.getElementById('pagination-controls');
    let currentPage = 1;
    const limit = 20; // Or whatever your API default is

    async function fetchAndDisplayImages(page = 1) {
        try {
            const response = await fetch(`http://localhost:3000/api/galleryImages?page=<span class="math-inline">\{page\}&limit\=</span>${limit}`);
            if (!response.ok) {
                galleryContainer.innerHTML = '<p>Error loading gallery images.</p>';
                console.error('Failed to fetch gallery images:', response.statusText);
                return;
            }
            const data = await response.json();

            galleryContainer.innerHTML = ''; // Clear previous images

            if (data.images && data.images.length > 0) {
                data.images.forEach(image => {
                    const imgElement = document.createElement('img');
                    // Assuming gallery_path is the direct URL path like /gallery_images/image_123.svg
                    imgElement.src = `http://localhost:3000${image.gallery_path}`;
                    imgElement.alt = `Artwork ${image.filename}`;
                    imgElement.style.width = '200px'; // Add some basic styling
                    imgElement.style.height = 'auto';
                    imgElement.style.margin = '10px';
                    imgElement.style.border = '1px solid #ccc';
                    galleryContainer.appendChild(imgElement);
                });
            } else {
                galleryContainer.innerHTML = '<p>No images in the gallery yet. Be the first to submit!</p>';
            }

            renderPagination(data.totalPages, data.currentPage);

        } catch (error) {
            galleryContainer.innerHTML = '<p>Error loading gallery images.</p>';
            console.error('Error fetching gallery images:', error);
        }
    }

    function renderPagination(totalPages, currentPage) {
        paginationControls.innerHTML = '';
        if (totalPages <= 1) return;

        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.addEventListener('click', () => fetchAndDisplayImages(currentPage - 1));
            paginationControls.appendChild(prevButton);
        }

        const pageInfo = document.createElement('span');
        pageInfo.textContent = ` Page ${currentPage} of ${totalPages} `;
        paginationControls.appendChild(pageInfo);


        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => fetchAndDisplayImages(currentPage + 1));
            paginationControls.appendChild(nextButton);
        }
    }

    fetchAndDisplayImages(currentPage);
});
