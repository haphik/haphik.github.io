/* Startseite */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte
let map = L.map("map").setView([ibk.lat, ibk.lng], 9);

// thematische Layer
let overlays = {
    temperature: L.featureGroup(),
    wind: L.featureGroup(),
    snow: L.featureGroup(),
    routen: L.featureGroup().addTo(map),  
    forecast: L.featureGroup().addTo(map)
}



// Hintergrundkarten
let eGrundkarteTirol = {
    sommer: L.tileLayer("https://wmts.kartetirol.at/gdi_summer/{z}/{x}/{y}.png", {
        attribution: `Datenquelle: <a href="https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol">eGrundkarte Tirol</a>`
    }),
    nomenklatur: L.tileLayer("https://wmts.kartetirol.at/gdi_nomenklatur/{z}/{x}/{y}.png", {
        attribution: `Datenquelle: <a href="https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol">eGrundkarte Tirol</a>`,
        pane: "overlayPane",
    })
}

// / Layer control mit eGrundkarte Tirol und Standardlayern
L.control.layers({
    "eGrundkarte Tirol Sommer": L.layerGroup([
        eGrundkarteTirol.sommer,
        eGrundkarteTirol.nomenklatur
    ]).addTo(map),

    "OpenStreetMap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "EsriWorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "BasemapAt.grau": L.tileLayer.provider("BasemapAT.grau"),
},{
    "Temperatur": overlays.temperature,
    "Wind": overlays.wind,
    "Schnee": overlays.snow,
    "Vorhersage": overlays.forecast,
    "Routen": overlays.routen,
}).addTo(map);


// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Minimap
var wmts = new L.TileLayer("https://wmts.kartetirol.at/gdi_summer/{z}/{x}/{y}.png", {minZoom: 0, maxZoom: 13});
var miniMap = new L.Control.MiniMap(wmts, {
    toggleDisplay: true,
    minimized: true,
}).addTo(map);

//Fullscreen
map.addControl(new L.Control.Fullscreen());



//PopUp

const ROUTE = [
    {
        lat: 47.200712, 
        lng: 11.242886,
        zoom: 13,
        title: "Wanderung Salfeinsee",
        length: "16.1 km",
        duration: "6:50 h",
        difficulty: "mittelschwer",
    },
    {
        lat: 47.200,
        lng: 14.203333,
        zoom: 13,
        title: "XX",
        length: "XXX km",
        duration: "X h",
        difficulty: "xxx",
    },]

   for (let i = 0; i < ROUTE.length; i++) {
    console.log(ROUTE[i]);

    //Marker zeichnen
    let marker = L.marker([ROUTE[i].lat, ROUTE[i].lng]).addTo(overlays.routen);

    //Popup definieren
    marker.bindPopup(`
        <h2>${ROUTE[i].title}</h2>
        <ul>
            <li><strong>Länge:</strong> ${ROUTE[i].length}</li>
            <li><strong>Dauer:</strong> ${ROUTE[i].duration}</li>
            <li><strong>Schwierigkeit:</strong> ${ROUTE[i].difficulty}</li>
        </ul>
    `);
    
};


  // Rainviewer initialisieren
    
    L.control.rainviewer({ 
        position: 'bottomleft',
        nextButtonText: '>',
        playStopButtonText: '▶/⏸',
        prevButtonText: '<',
        positionSliderLabelText: "Zeit:",
        opacitySliderLabelText: "Deckkraft:",
        animationInterval: 300,
        opacity: 0.5
    }).addTo(map);

    