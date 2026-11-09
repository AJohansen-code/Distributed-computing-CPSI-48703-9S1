import { VantageAPI } from './api.js';

let mapInstance;
let markersLayer;

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initFilterControls();
    initUploadModal();
    initSpotModal();
    loadSpots("All", 15);
});

function initMap() {
    mapInstance = L.map('map').setView([34.7465, -92.2896], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);
}

function initFilterControls() {
    const filterButtons = document.querySelectorAll('.filter-btn');
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
            loadSpots(category, radiusSelect.value);
        });
    });

    radiusSelect.addEventListener('change', () => {
        const activeBtn = document.querySelector('.filter-btn.active');
        const category = activeBtn ? activeBtn.getAttribute('data-category') : "All";
        loadSpots(category, radiusSelect.value);
    });
}

async function loadSpots(category, radius) {
    const listEl = document.getElementById('spots-list');
    const countBadge = document.getElementById('results-count');

    // 1. Loading State
    listEl.innerHTML = `
        <div class="skeleton-card" aria-hidden="true"></div>
        <div class="skeleton-card" aria-hidden="true"></div>
        <div class="skeleton-card" aria-hidden="true"></div>
    `;

    try {
        const response = await VantageAPI.getRankedSpots(category, radius);
        const spots = response.data;
        markersLayer.clearLayers();

        // 2. Empty State
        if (!spots || spots.length === 0) {
            countBadge.textContent = "0 found";
            listEl.innerHTML = `<p class="empty-state">No locations found for this selection.</p>`;
            return;
        }

        countBadge.textContent = `${spots.length} found`;
        listEl.innerHTML = "";

        spots.forEach(spot => {
            // Render card
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
                mapInstance.flyTo([spot.lat, spot.lng], 14);
                displaySpotDetails(spot.id);
            };

            card.addEventListener('click', openDetails);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openDetails();
                }
            });

            listEl.appendChild(card);

            // Add Leaflet Pin
            const marker = L.marker([spot.lat, spot.lng]).addTo(markersLayer);
            marker.bindPopup(`<b>${spot.name}</b><br>${spot.category}`);
            marker.on('click', () => displaySpotDetails(spot.id));
        });

    } catch (err) {
        // 3. Error State
        listEl.innerHTML = `<p class="error-state">Failed to load spots. Please retry.</p>`;
    }
}

async function displaySpotDetails(spotId) {
    const modal = document.getElementById('spot-modal');
    try {
        const res = await VantageAPI.getSpotDetails(spotId);
        const spot = res.data;

        document.getElementById('modal-title').textContent = spot.name;
        document.getElementById('modal-category').textContent = spot.category;
        document.getElementById('modal-desc').textContent = spot.description;
        document.getElementById('modal-img').src = spot.thumbnail;
        document.getElementById('modal-img').alt = spot.name;
        document.getElementById('modal-rating').textContent = `Rating: ⭐ ${spot.rating}`;
        document.getElementById('modal-photos').textContent = `${spot.photoCount} Community Photos`;

        modal.classList.remove('hidden');
        document.getElementById('close-modal-btn').focus();
    } catch (err) {
        console.error(err);
    }
}

function initSpotModal() {
    const modal = document.getElementById('spot-modal');
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        modal.classList.add('hidden');
    });
}

function initUploadModal() {
    const uploadDialog = document.getElementById('upload-dialog');
    const openBtn = document.getElementById('open-upload-btn');
    const closeBtn = document.getElementById('close-upload-btn');
    const cancelBtn = document.getElementById('cancel-upload-btn');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('modal-file-input');
    const chosenName = document.getElementById('file-chosen-name');
    const form = document.getElementById('active-upload-form');

    const openModal = () => {
        uploadDialog.classList.remove('hidden');
        closeBtn.focus();
    };

    const closeModal = () => {
        uploadDialog.classList.add('hidden');
        form.reset();
        chosenName.textContent = "";
        openBtn.focus();
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            chosenName.textContent = `Selected: ${fileInput.files[0].name}`;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        try {
            await VantageAPI.uploadPhoto(formData);
            alert("Upload completed successfully!");
            closeModal();
        } catch (err) {
            alert("Upload failed. Check gateway connection.");
        }
    });
}