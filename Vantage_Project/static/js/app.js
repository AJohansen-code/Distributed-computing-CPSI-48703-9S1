import { VantageAPI } from './api.js';

let mapInstance;
let markersLayer;
let currentRequestId = 0;

const MAP_CENTER = [34.7465, -92.2896];

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initFilterControls();
    initUploadCard();
    initSpotModal();

    const activeFilterBtn = document.querySelector('.filter-pill.active');
    const initialCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-category') : 'All';
    const radiusSelect = document.getElementById('radius-select');
    const initialRadius = radiusSelect ? parseInt(radiusSelect.value, 10) : 5000;

    loadSpots(initialCategory, initialRadius)
});

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

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
            filterButtons.forEach((b) => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            const category = btn.getAttribute('data-category');
            const radiusMeters = radiusSelect ? parseInt(radiusSelect.value, 10) : 5000;
            loadSpots(category, radiusMeters);
        });
    });

    if (radiusSelect) {
        radiusSelect.addEventListener('change', () => {
            const activeBtn = document.querySelector('.filter-pill.active');
            const category = activeBtn ? activeBtn.getAttribute('data-category') : 'All';
            loadSpots(category, parseInt(radiusSelect.value, 10));
    });
  }
}

async function loadSpots(category, radiusMeters) {
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
    if (countBadge) countBadge.textContent = "Loading...";

    try {
        const response = await VantageAPI.getRankedSpots(
            MAP_CENTER[0],
            MAP_CENTER[1],
            radiusMeters,
            category
        );

        if (requestId !== currentRequestId) return;

        // Support both direct array and nested object contract
        let spots = [];
        if (Array.isArray(response.data)) {
            spots = response.data;
        } else if (response.data && Array.isArray(response.data.spots)) {
            spots = response.data.spots;
        }

        if (markersLayer) markersLayer.clearLayers();

        if (spots.length === 0) {
            if (countBadge) countBadge.textContent = "0 found";
            if (listEl) {
                listEl.innerHTML = `<p class="empty-state">No locations found within ${(radiusMeters / 1000).toFixed(1)} km.</p>`;
            }
            return;
        }

        if (countBadge) countBadge.textContent = `${spots.length} found`;
        if (listEl) listEl.innerHTML = "";

        spots.forEach(spot => {
            const lat = spot.latitude ?? spot.lat ;
            const lng = spot.longitude ?? spot.lng;
            const photos = spot.photo_count ?? spot.photoCount ?? 0;

            const card = document.createElement('article');
            card.className = "spot-card";
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View details for ${spot.name}`);
            card.innerHTML = `
                <img src="${spot.thumbnail}" alt="${spot.name}" onerror="this.onerror=null; this.src='/static/images/Arkansas.1.png';">
                <div class="spot-card-info">
                    <h3><span class="rank-tag">#${spot.rank}</span>${spot.name}</h3>
                    <p>${spot.category} • ⭐ ${spot.rating} (${photos} photos)</p>
                </div>
            `;


            const openDetails = () => {
               if (mapInstance) mapInstance.flyTo([lat, lng], 15);
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
        if (markersLayer) {
            const marker = L.marker([lat, lng]).addTo(markersLayer);
            marker.bindPopup(`<b>${spot.name}</b><br>${spot.category}`);
            marker.on('click', () => displaySpotDetails(spot.id));
          }
        });
 // 3. Error State
    } catch (err) {
        console.error("loadSpots Error", err);
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
        if (photoEl) photoEl.textContent = `${spot.photo_count ?? spot.photoCount} Community Photos`;

        modal.classList.remove('hidden');
        const closeBtn = document.getElementById('close-modal');
        if (closeBtn) closeBtn.focus();
    } catch (err) {
        console.error("Error loading spot details:", err);
    }
}

function initSpotModal() {
    const modal = document.getElementById('spot-modal');
    const closeBtn = document.getElementById('close-modal');
    if (modal && closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
}

function initUploadCard() {
    const fileInput = document.getElementById('file-input');
    const fileChosenPreview = document.getElementById('file-chosen-name');

    if (fileInput && fileChosenPreview) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                fileChosenPreview.textContent = `Selected: ${fileInput.files[0].name}`;
            }
        });
    }
}