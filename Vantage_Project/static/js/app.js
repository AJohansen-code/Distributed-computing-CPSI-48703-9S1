import { VantageAPI } from './api.js';

let mapInstance;
let markersLayer;
let currentRequestId = 0;

const MAP_CENTER = [34.7465, -92.2896];

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initFilterControls();
    initUploadModal();
    initSpotModal();

    const activeFilterBtn = document.querySelector('.filter-pill.active');
    const initialCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-category') : 'All';
    const radiusSelect = document.getElementById('radius-select');
    const initialRadius = radiusSelect ? parseInt(radiusSelect.value, 10) : 3000;

    loadSpots(initialCategory, initialRadius)
});

function initMap() {
    mapInstance = L.map('map').setView(MAP_CENTER, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);
}

function initFilterControls() {
    const filterButtons = document.querySelectorAll('.filter-pill');
    const radiusSelect = document.getElementById('radius-select');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            const category = btn.getAttribute('data-category');
            const radiusMeters = radiusSelect ? parseInt(radiusSelect.value, 10) : 3000;
            loadSpots(category, radiusSelect.value);
        });
    });

    if (radiusSelect) {
        radiusSelect.addEventListener('change', () => {
            const activeBtn = document.querySelector('.filter-pill.active');
            const category = activeBtn ? activeBtn.getAttribute('data-category') : 'All';
            loadSpots(category, parseInt(radiusSelect.vaule, 10)); 
    });
  }
}

async function loadSpots(category, radius) {
    const listEl = document.getElementById('spots-list');
    const countBadge = document.getElementById('results-count');

    const requestId = ++currentRequestId;

    // 1. Loading State
    if (listEl) {
       listEl.innerHTML = `
         <div class="skeleton-card" aria-hidden="true"></div>
         <div class="skeleton-card" aria-hidden="true"></div>
         <div class="skeleton-card" aria-hidden="true"></div>
    `;
    }
    if (countBadge) countBadge.textContent = "Loading...";4

    try {
        const response = await VantageAPI.getRankedSpots(
            MAP_CENTER[0],
            MAP_CENTER[1],
            radiusMeters,
            category
        );

        if (requestId != currentRequestId) {
            return;
        }

        const spots = response.data.spots || [];
        markersLayer.clearLayers();

        // 2. Empty State
        if (!spots || spots.length === 0) {
            if (countBadge) countBadge.textContent = "0 found";
            if (listEl) {
            listEl.innerHTML = `<p class="empty-state">No locations found within ${(radiusMeters / 1000).toFixed(1)} km.</p>`;
            }
            return;
        }

        if (countBadge) countBadge.textContent = `${spots.length} found`;
        if (listEl) listEl.innerHTML = "";

        spots.forEach(spot => {
            const lat = spot.latitude;
            const lng = spot.longitude;4

            const card = document.createElement('article');
            card.className = "spot-card";
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View details for ${spot.name}`);
            card.innerHTML = `
                <img src="${spot.thumbnail}" alt="${spot.name}">
                <div class="spot-card-info">
                    <h3><span class="rank-tag">#${spot.rank}</span>${spot.name}</h3>
                    <p>${spot.category} • ⭐ ${spot.rating} (${spot.photoCount} photos)</p>
                </div>
            `;

            const openDetails = () => {
                mapInstance.flyTo([lat, lng], 15);
                displaySpotDetails(spot.id);
            };

            card.addEventListener('click', openDetails);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openDetails();
                }
            });

            if (listEl) listEl.appendChild(card);

            // Add Leaflet Pin
            const marker = L.marker([lat, lng]).addTo(markersLayer);
            marker.bindPopup(`<b>${spot.name}</b><br>${spot.category}`);
            marker.on('click', () => displaySpotDetails(spot.id));
        });
 // 3. Error State
    } catch (err) {
        if (requestId === currentRequestId) {
            if (countBadge) countBadge.textContent = "Error";
            if (listEl) {
                 listEl.innerHTML = `<p class="error-state">Failed to load spots. Please retry.</p>`;
            }
        }
    }
}

async function displaySpotDetails(spotId) {
    const modal = document.getElementById('spot-modal');
    if (!modal) return;

    try {
        const res = await VantageAPI.getSpotDetails(spotId);
        const spot = res.data;

        const titleEl = document.getElementById('modal-title');
        const catEl = document.getElementById('modal-category');
        const descEl = document.getElementById('modal-description');
        const imgEl = document.getElementById('modal-image');
        const ratingEl = document.getElementById('modal-rating');
        const photoEl = document.getElementById('modal-photo');

        if (titleEl) titleEl.textContent = spot.name;
        if (catEl) catEl.textContent = spot.category;
        if (descEl) descEl.textContent = spot.description;
        if (imgEl) {
            imgEl.src = spot.thumbnail;
            imgEl.alt = spot.name;
        }
        if (ratingEl) ratingEl.textContent = `Rating: ⭐ ${spot.rating}`;
        if (photoEl) photoEl.textContent = `${spot.photo_count} Photos`;

        modal.classList.remove('hidden');
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) closeBtn.focus();
    } catch (err) {
        console.error("Error loading spot details:", err);
    }
}

function initSpotModal() {
    const modal = document.getElementById('spot-modal');
    const closeBtn = document.getElementById('close-modal')
    if (modal && closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
  }
}

function initUploadModal() {
    const form = document.getElementById('active-upload-form');
    const fileInput = document.getElementById('modal-file-input');
    const fileChosenPreview = document.getElementById('file-chosen-name');

    if (fileInput && fileChosenPreview) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileChosenPreview.textContent = `Selected: ${fileInput.files[0].name}`;
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            try {
                await VantageAPI.uploadPhoto(formData);
                alert("Photo uploaded successfully!");
                form.reset();
                if (fileChosenPreview) fileChosenPreview.textContent = "";
            } catch (err) {
                alert("Upload failed. Check gateway connection.");
            }
        });
    }
}