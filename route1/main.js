/* Route 1 */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778
};

// Karte
let map = L.map("map").setView([ibk.lat, ibk.lng], 9);

// thematische Layer
let overlays = {
    schutzgebiete: L.featureGroup().addTo(map),
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
    "BasemapAT grau": L.tileLayer.provider("BasemapAT.grau"),
    }, {
    "Schutzgebiete": overlays.schutzgebiete,
}).addTo(map);

//Schutzgebiete
async function loadSchutzgebiete(url) {
    console.log(url);
    //console.log(url;)
    let response = await fetch(url);
    let jsondata = await response.json();
    console.log(jsondata);
    //console.log(jsondata);
    L.geoJSON(jsondata, {
        attribution: "Datenquelle: <a href='https://www.data.gv.at/suche/?organisation=land-tirol' >Land Tirol</a>",
        style: function (feature) {
            console.log(feature);
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
loadSchutzgebiete("Schutzgebiete.geojson");

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);


//Leaflet Locate Control
L.control.locate({
    strings: {
    title: "eigenen Standort anzeigen"
},
drawCircle: false,
}).addTo(map);


// leaflet plugin elevation
var controlElevation = L.control.elevation({
    theme: "hike",
    time:false,
    elevationDiv: "#profile",
    height: 300,
 //slope: true,
}).addTo(map);
controlElevation.load("Salfeinsee.gpx")

//Minimap
var wmts = new L.TileLayer("https://wmts.kartetirol.at/gdi_summer/{z}/{x}/{y}.png", {minZoom: 0, maxZoom: 13});
var miniMap = new L.Control.MiniMap(wmts, {
    toggleDisplay: true,
    minimized: true,
}).addTo(map);

//Fullscreen
map.addControl(new L.Control.Fullscreen());