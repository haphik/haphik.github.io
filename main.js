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
    wind: L.featureGroup(),
    routen: L.featureGroup().addTo(map),
    schutzgebiete: L.featureGroup()
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
}, {
    "Windvorhersage": overlays.wind,
    "Routen": overlays.routen,
    "Schutzgebiete": overlays.schutzgebiete,
}).addTo(map);


// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Minimap
var wmts = new L.TileLayer("https://wmts.kartetirol.at/gdi_summer/{z}/{x}/{y}.png", { minZoom: 0, maxZoom: 13 });
var miniMap = new L.Control.MiniMap(wmts, {
    toggleDisplay: true,
    minimized: false,
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
        lat: 47.188247,
        lng: 11.24499,
        zoom: 13,
        title: "Wanderung Salfeinsee",
        link: "../route1/index.html",
        length: "16.1 km",
        duration: "6:50 h",
        difficulty: "mittelschwer",
    },
    {
        lat: 47.2888359,
        lng: 11.35341561,
        zoom: 13,
        title: "Wanderung Achselkopf & Höttinger Alm",
        link: "../route2/index.html",
        length: "15,7 km",
        duration: "4 h",
        difficulty: "schwer",
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
            <h2><a href="${route.link}" target="_blank">${route.title}</a></h2>
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


//Windlayer 

async function loadWindLayer() {
    try {
        const response = await fetch('https://geographie.uibk.ac.at/data/ecmwf/data/wind-10u-10v-europe.json');
        const data = await response.json();

        let forecastDate = new Date(data[0].header.refTime);
        forecastDate.setHours(forecastDate.getHours() + data[0].header.forecastTime);

        

        const velocityLayer = L.velocityLayer({
            displayValues: true,
            displayOptions: {
                velocityType: "Wind",
                position: "bottomleft",
                speedUnit: "k/h",
                emptyString: "Keine Winddaten verfügbar",
                angleConvention: "meteo",
                showCardinal: true,
                directionString: "Richtung",
                speedString: "Geschwindigkeit (km/h)"
            },
            data: data,
            minVelocity: 0,
            maxVelocity: 10,
            velocityScale: 0.005,
            colorScale: [
                "#3288bd", "#66c2a5", "#abdda4", "#e6f598",
                "#fee08b", "#fdae61", "#f46d43", "#d53e4f"
            ],
            opacity: 0.97
        }).addTo(overlays.wind);

    } catch (error) {
        console.error("Fehler beim Laden der Winddaten:", error);
        alert("Winddaten konnten nicht geladen werden.");
    }
}

loadWindLayer();

//Schutzgebiete
async function loadSchutzgebiete(url) {
    //console.log(url;)
    let response = await fetch(url);
    let jsondata = await response.json();
    //console.log(jsondata);
    L.geoJSON(jsondata, {
        attribution: "Datenquelle: <a href='https://www.data.gv.at/suche/?organisation=land-tirol' >Land Tirol</a>",
        style: function (feature) {
            //console.log(feature);
            return {
                color: "#F012BE",
                weight: 1,
                opacity: 0.4,
                fillOpacity: 0.1,
            };
        }
    }).addTo(overlays.schutzgebiete);
}
//GeoJSON laden und visualisieren
loadSchutzgebiete("Schutzgebiete.geojson")

//GPX-Route laden
new L.GPX("Salfeinsee.gpx", {
    async: true,
    marker_options: {
        startIconUrl: null,
        endIconUrl: null,
        shadowUrl: null
    },
    polyline_options: {
        color: "darkgreen",
        wight: 5
    }
}).on('loaded', function (e) {
    map.fitBounds(e.target.getBounds());
}).addTo(overlays.routen);

new L.GPX("AchselbodenundHoettingerAlm.gpx", {
    async: true,
    marker_options: {
        startIconUrl: null,
        endIconUrl: null,
        shadowUrl: null
    },
    polyline_options: {
        color: "darkblue",
        wight: 5
    }
}).on('loaded', function (e) {
    map.fitBounds(e.target.getBounds());
}).addTo(overlays.routen);

//KI_BEGIN
map.fitBounds(overlays.routen.getBounds());
//KI_END

//Geo Search
const searchControl = new GeoSearch.GeoSearchControl({
    provider: new GeoSearch.OpenStreetMapProvider(),
    style: "bar",
    searchLabel: "Adresse suchen"
});
map.addControl(searchControl);


