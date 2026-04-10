var gpxtrack = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n' +
'<gpx xmlns="https://www.topografix.com/GPX/1/1" creator="peter-thomson.com" version="1.1" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.topografix.com/GPX/1/1 https://www.topografix.com/GPX/1/1/gpx.xsd">\n' +
'<trk><name>28-MAR-18 04:04:44 PM</name>\n' +
'<trkseg>\n';

var markers = new Array();
var mid = 0;
var nextpoint = 0;
var nextlatlng = '';
var newpoint = '';

// Define tile layers
var outdoors = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var hikebike = L.tileLayer('https://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Initialize the map
var map = L.map('map', {
    center: [51.505, -0.09],
    zoom: 13,
    layers: [outdoors]
});

// Add layer control
var baseMaps = {
    "Outdoors": outdoors,
    "Hikebike": hikebike,
    "Satellite": satellite
};
L.control.layers(baseMaps).addTo(map);

// Create marker group and polyline
var markerGroup = L.featureGroup().addTo(map);
var polyline = L.polyline([], {color: 'red'}).addTo(map);

function onMapClick(e) {
    var newMarker = new L.marker(e.latlng, {
        draggable: 'true',
    }).addTo(markerGroup);
    console.log(newMarker._leaflet_id);
    newMarker
        .on('dragstart', dragStartHandler)
        .on('click', dragStartHandler)
        .on('drag', dragHandler)
        .on('dragend', dragEndHandler);
    polyline.addLatLng(L.latLng(e.latlng));
    map.setView((e.latlng));
    displaylatlong();
}

map.on('contextmenu', onMapClick);

function dragStartHandler(e) {
    var latlngs = polyline.getLatLngs(),
        latlng = this.getLatLng();
    console.log('thislatlng= ' + latlng);
    for (var i = 0; i < latlngs.length; i++) {
        if (latlng.equals(latlngs[i])) {
            this.polylineLatlng = i;
            nextpoint = i - 1;
            if (nextpoint < 0) {
                nextpoint = 0;
            }
            nextlatlng = latlngs[nextpoint];
            console.log('nextlatlng= ' + nextlatlng);
            bounds = L.latLngBounds(latlng, nextlatlng);
            newpoint = bounds.getCenter();
            console.log('centre= ' + newpoint);
        }
    }
}

function dragHandler(e) {
    var latlngs = polyline.getLatLngs(),
        latlng = this.getLatLng();
    markerid = this._leaflet_id;
    latlngs.splice(this.polylineLatlng, 1, latlng);
    polyline.setLatLngs(latlngs);
    
    if (this.polylineLatlng > -1) {
        this.bindPopup("<button onclick=\"deletepoint('" + this.polylineLatlng + "','" + markerid + "')\">Delete point " + this.polylineLatlng + " " + markerid + "</button><button onclick=\"insertpoint('" + this.polylineLatlng + "','" + markerid + "')\">Insert point</button>");
        this.openPopup();
    }
}

function dragEndHandler(e) {
    delete this.polylineLatlng;
    displaylatlong();
}

function deletepoint(mypoint, myid) {
    console.log('in deletepoint' + mypoint + '  ' + myid);
    markerGroup.removeLayer(myid);
    var latlngs = polyline.getLatLngs();
    latlngs.splice(mypoint, 1);
    polyline.setLatLngs(latlngs);
    displaylatlong();
    map.closePopup();
    redrawmarkers();
}

function insertpoint(mypoint, myid) {
    console.log('in insertpoint' + mypoint + '  ' + myid);
    var latlngs = polyline.getLatLngs();
    latlngs.splice(mypoint, 0, newpoint);
    
    var newMarker = new L.marker(newpoint, {
        draggable: 'true'
    }).addTo(markerGroup);
    console.log(newMarker._leaflet_id);
    newMarker
        .on('dragstart', dragStartHandler)
        .on('click', dragStartHandler)
        .on('drag', dragHandler)
        .on('dragend', dragEndHandler);
    polyline.setLatLngs(latlngs);
    displaylatlong();
    map.closePopup();
}

function redrawmarkers() {
    markerGroup.clearLayers();
    var latlngs = polyline.getLatLngs();
    for (var i = 0; i < latlngs.length; i++) {
        var newMarker = new L.marker(latlngs[i], {
            draggable: 'true'
        }).addTo(markerGroup);
        console.log(newMarker._leaflet_id);
        newMarker
            .on('dragstart', dragStartHandler)
            .on('click', dragStartHandler)
            .on('drag', dragHandler)
            .on('dragend', dragEndHandler);
    }
}

function displaylatlong() {
    var div = document.getElementById('track');
    var trackd = document.getElementById('trackdistance');
    var timestamp = new Date().toLocaleString('en-GB');
    gpxtrack = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n' +
    '<gpx xmlns="https://www.topografix.com/GPX/1/1" creator="peter-thomson.com" version="1.1" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.topografix.com/GPX/1/1 https://www.topografix.com/GPX/1/1/gpx.xsd">\n' +
    '<trk><name>' + timestamp + '</name>\n' +
    '<trkseg>\n';
    
    div.innerHTML = gpxtrack;
    var latlngs = polyline.getLatLngs();
    trkdistance = 0;
    var lastpoint = latlngs[0];
    for (var i = 0; i < latlngs.length; i++) {
        trkdistance += latlngs[i].distanceTo(lastpoint);
        var lastpoint = latlngs[i];
        div.innerHTML += '<trkpt lat="' + latlngs[i].lat + '" lon="' + latlngs[i].lng + '"></trkpt>\n';
        gpxtrack += '<trkpt lat="' + latlngs[i].lat + '" lon="' + latlngs[i].lng + '"></trkpt>\n';
    }
    trkdistance = trkdistance / 1000;
    miles = trkdistance * 0.6213712;
    div.innerHTML += '</trkseg>\n</trk>\n</gpx>\n';
    gpxtrack += '</trkseg>\n</trk>\n</gpx>\n';
    trackd.innerHTML = 'distance = ' + trkdistance.toFixed(2).toString() + 'km  distance = ' + miles.toFixed(2).toString() + ' miles (note distance is horizontal)';
}

var download = function (content, fileName, mimeType) {
    var a = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(new Blob([content], {
            type: mimeType
        }), fileName);
    } else if (URL && 'download' in a) {
        a.href = URL.createObjectURL(new Blob([content], {
            type: mimeType
        }));
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        location.href = 'data:application/octet-stream,' + encodeURIComponent(content);
    }
};
