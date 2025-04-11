
// Predefined cafe location
const cafeLocation = {
    lat: 36.555947,
    lng: 53.080017,
    address: "ساری ، میدان منبع آب، کافه ویکند"
};

// Cache DOM elements
const mapContainer = document.getElementById('map-container');
const mapElement = document.getElementById('map');
const phoneText = document.getElementById('phone-text');

// نمایش مُدال تماس
function showContactModal() {
    const modal = document.getElementById('contact-modal');
    modal.style.display = 'flex';
    phoneText.textContent = 'تماس با ما';
}

// بستن مُدال تماس
function hideContactModal() {
    document.getElementById('contact-modal').style.display = 'none';
}

// بستن مُدال با کلیک خارج از محتوا
document.getElementById('contact-modal').addEventListener('click', function (e) {
    if (e.target === this) {
        hideContactModal();
    }
});

// Show map immediately with basic info
function showMap() {
    // Show container immediately
    mapContainer.style.display = 'flex';

    // Load basic map content first
    mapElement.innerHTML = `
            <div class="location-info">
                <h3><i class="fas fa-map-marker-alt"></i> ${cafeLocation.address}</h3>
                <p><i class="fas fa-clock"></i> ساعت کار: ۸ صبح تا ۱۲ شب</p>
                <p id="distance-info">در حال دریافت موقعیت شما...</p>
            </div>
            <div class="map-iframe-container">
                <iframe
                    src="https://maps.google.com/maps?q=${cafeLocation.lat},${cafeLocation.lng}&z=16&output=embed"
                    frameborder="0"
                    allowfullscreen>
                </iframe>
            </div>
            <a href="https://maps.google.com/maps?q=${cafeLocation.lat},${cafeLocation.lng}"
                target="_blank"
                class="open-maps-btn">
                <i class="fas fa-external-link-alt"></i> باز کردن در Google Maps
            </a>
            `;

    // Get user location in background
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                updateDistance(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                document.getElementById('distance-info').textContent =
                    'امکان دسترسی به موقعیت شما وجود ندارد';
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
        );
    }
}

// Update distance after getting user location
function updateDistance(userLat, userLng) {
    const distance = calculateDistance(
        cafeLocation.lat, cafeLocation.lng,
        userLat, userLng
    );
    document.getElementById('distance-info').innerHTML = `
            <h4><i class="fas fa-user"></i> موقعیت شما:</h4>
            <p>فاصله تا کافه: ${distance} کیلومتر</p>
            `;
}

// Hide map
function hideMap() {
    mapContainer.style.display = 'none';
}

// Calculate distance between two points (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

// Initialize event listeners
document.getElementById('location-btn').addEventListener('click', showMap);