/////// Fond de carte
const plan = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
});

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Esri World Imagery'
});

const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd',
    maxZoom: 20
});

// Centre/ Zoom / Couche de base
const map = L.map('map', {
    center: [45.75, 4.85],
    zoom: 12,
    layers: [plan] 
});

/////// Les données
const layers = {
    "Bornes de Compost": L.layerGroup().addTo(map),
    "Sites de Traitement": L.layerGroup().addTo(map)
};

// Collecteurs des bornes
function getColor(collecteur) {
    switch (collecteur) {
        case 'SITA': return "#1c7a43"; // Vert
        case 'GPE': return "#856e14"; // Jaune
        case 'COL NO': return "#834611"; // Orange
        case 'COL SUD': return "#236693"; // Bleu
        case 'GUERIN': return "#e74c3c"; // Rouge
        case 'NICOLLIN': return "#089e80"; // Turquoise
    }
}

// Borne compost
fetch('data/bornecompost.json').then(r => r.json()).then(data => {
    L.geoJSON(data, {
        pointToLayer: (don_json, ll) => {
            const coul = getColor(don_json.properties.collecteur);
            return L.circleMarker(ll, { 
                radius: 4, 
                fillColor: coul, 
                color: "#fff", 
                weight: 0.5, 
                fillOpacity: 0.9 
            });
        },
        onEachFeature: (don_json, l) => {
            const coul = getColor(don_json.properties.collecteur);
            l.bindPopup(`
            <div style="border-top: 4px solid ${coul}; padding-top: 5px;"> 
                <b style="color:${coul}">Collecteur : ${don_json.properties.collecteur}</b><br>
                <small>${don_json.properties.adresse}</small> 
            </div>
        `);
        }
    }).addTo(layers["Bornes de Compost"]);
});

// Sites de traitements
fetch('data/traitement.json').then(r => r.json()).then(data => {
    L.geoJSON(data, {
        style: { color: "#E91E63", weight: 3, fillOpacity: 0.4 },
    }).addTo(layers["Sites de Traitement"]);
});

// OBJET UNIQUE POUR LE MENU
const baseMaps = {
    "OpenStreetMap": plan,
    "Vue Satellite": satellite,
    "Mode Sombre": dark
};

L.control.layers(baseMaps, layers, { collapsed: false }).addTo(map);

/////// Echelles
L.control.scale({
    metric: true,
    imperial: false
}).addTo(map);

/////// Légendes
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info-legend');
    const collecteurs = ['SITA', 'GPE', 'COL NO', 'COL SUD', 'GUERIN', 'NICOLLIN'];
    div.innerHTML = '<h4>Collecteurs</h4>';
    collecteurs.forEach(coll => {
        div.innerHTML += `
            <div class="legend-item">
                <i style="background: ${getColor(coll)}"></i> 
                ${coll}
            </div>
        `;
    });
    return div;
};
legend.addTo(map);