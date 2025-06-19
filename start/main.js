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

//Popup und Wettervorhersage
//Routenmarker
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
    }
    ];

//Wettervorhersage
async function showForecastForRoute(route, marker) {
    let url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${route.lat}&lon=${route.lng}`;
    try {
        let response = await fetch(url);
        let jsondata = await response.json();

        let details = jsondata.properties.timeseries[0].data.instant.details;
        let timestamp = new Date(jsondata.properties.meta.updated_at);
        let temperature = details.air_temperature;

        let markup = `
            <h2>${route.title}</h2>
            <ul>
                <li><strong>Länge:</strong> ${route.length}</li>
                <li><strong>Dauer:</strong> ${route.duration}</li>
                <li><strong>Schwierigkeit:</strong> ${route.difficulty}</li>
            </ul>
            <h4>Wettervorhersage</h4>
            <p>aktuelle Temperatur: ${temperature.toFixed(1)} °C</p>
            <p class="weather-meta">Stand: ${timestamp.toLocaleString()}</p>
            <div class="weather-icons">
        `;

        for (let i = 0; i <= 12; i += 3) {
            let forecast = jsondata.properties.timeseries[i];
            if (!forecast?.data?.next_1_hours?.summary) continue;

            let symbol = forecast.data.next_1_hours.summary.symbol_code;
            let time = new Date(forecast.time);
            let hour = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            markup += `
                <div class="weather-icon">
                    <img src="https://api.met.no/images/weathericons/svg/${symbol}.svg" width="32" title="${hour}">
                    <br><span>${hour}</span>
                </div>
            `;
        }

        markup += `</div>`;
        marker.bindPopup(markup);

    } catch (err) {
        console.error("Fehler bei Wetterdaten:", err);
        marker.bindPopup(`
            <h2>${route.title}</h2>
            <p style="color:red;">⚠ Wetterdaten nicht verfügbar</p>
        `);
    }
}

// Marker + Popup erstellen
for (let route of ROUTE) {
    let marker = L.marker([route.lat, route.lng]).addTo(overlays.routen);
    showForecastForRoute(route, marker);
}
            


  