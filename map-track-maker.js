
var gpxtrack = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<gpx xmlns="https://www.topografix.com/GPX/1/1"  creator="peter-thomson.com" version="1.1" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.topografix.com/GPX/1/1 https://www.topografix.com/GPX/1/1/gpx.xsd">
<trk><name>28-MAR-18 04:04:44 PM</name>
<trkseg>
';
/*
Then we are defining and initialising the global variables that we will need.
/*
var markers = new Array();
var mid = 0;
var nextpoint = 0;
var nextlatlng = '';
var newpoint = '';
/*
We are defining three tile layers as variables that give us three different maps.
*/
var outdoors = L.tileLayer('https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=af071baf070341ad86b5100adeec252b', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})
var hikebike = L.tileLayer('https://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
/*
Then we create the map and give it a starting position, zoom, and the outdoors map.
*/
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

var markerGroup = L.featureGroup();
var polyline = L.polyline([]);
var map = L.map('map', {
    center: [51.505, -0.09],
    zoom: 13,
    layers: [outdoors, markerGroup, polyline]
});
markerGroup.addTo(map);
polyline.addTo(map);
/*
The next line enables right clicking on the map.
*/
map.on('contextmenu', onMapClick);
//https://stackoverflow.com/questions/33513404/leaflet-how-to-match-marker-and-polyline-on-drag-and-drop#33520112
/*
When we drag a marker we need its starting position - in order to identify its matching point on the polyline.
*/
function dragStartHandler(e) {
    // Get the polyline's latlngs
    var latlngs = polyline.getLatLngs(),
        // Get the marker's start latlng
        latlng = this.getLatLng();
    console.log('thislatlng= ' + latlng)
    // Iterate the polyline's latlngs
    for (var i = 0; i < latlngs.length; i++) {
        // Compare each to the marker's latlng
        if (latlng.equals(latlngs[i])) {
            // If equals store key in marker instance
            this.polylineLatlng = i;
/*
At the same time that we identify the marker being dragged, we identify the adjacent marker and calculate the mid point between this point and the previous point. This is the point we will use if the user wants to insert a new point into the polyline.
*/
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
/*
As the marker is being dragged we collect the marker's current location and update the location of this point in the polyline array, and update the line to show its new position.
We are also collecting Leaflet's internal reference to identify this marker so that we can add it to the buttons in the popup. ( This is by far the easiest method - but don't try writing to this variable! )
*/
function dragHandler(e) {
// Get the polyline's latlngs
var latlngs = polyline.getLatLngs(),
// Get the marker's current latlng
latlng = this.getLatLng();
markerid = this._leaflet_id;
//markerid = this.options._leaflet_id;
// Replace the old latlng with the new
latlngs.splice(this.polylineLatlng, 1, latlng);
// Update the polyline with the new latlngs
polyline.setLatLngs(latlngs);
/*
On this dragged marker we create a popup that creates two buttons. One gives the option to delete the marker and node in the polyline, the other to insert a new marker and node in the polyline.
*/
if (this.polylineLatlng > -1) {
this.bindPopup("<button onclick="deletepoint('" + this.polylineLatlng + "','" + markerid + "')">Delete point" + this.polylineLatlng + " " + markerid + "</button><button onclick="insertpoint('" + this.polylineLatlng + "','" + markerid + "')">Insert point" + this.polylineLatlng + " " + markerid + "</button> ").openPopup();
}
}
/*
When the marker drag ends we close the temporary value of this.polylineLatlng and update the display of marked points in our GPX display.
*/
function dragEndHandler(e) {
    // Delete key from marker instance
    delete this.polylineLatlng;
    displaylatlong();
}
/*
When the user clicks the delete point button it calls the function deletepoint(mypoint, myid) and supplies the value of this.polylineLatlng that was inserted into the button, and the id of the marker.
We remove the marker identified by myid
We get the array of points in the polyline, and then delete the point with the same latlng as mypoint 
latlngs.splice(mypoint, 1) deletes one point from this array.
We then need to redraw our markers and polyline ready for the user to continue.
*/
function deletepoint(mypoint, myid) {
    console.log('in deletepoint' + mypoint + '  ' + myid)
    markerGroup.removeLayer(myid);
    var latlngs = polyline.getLatLngs();
    latlngs.splice(mypoint, 1);
    polyline.setLatLngs(latlngs);
    displaylatlong();
    map.closePopup();
    redrawmarkers();
}
/*
When the user clicks the button to insert a point, this function insertpoint(mypoint, myid) is  called with the value of this.polylineLatlng that was inserted into the button, and the id of the marker.
This time no points are deleted from the array, and one point newpoint is added adjacent to the existing point.  latlngs.splice(mypoint, 0, newpoint) This newpoint could be passed from the button, but in this example we are using a global variable as we calculated this in the function dragStartHandler(e)
*/
function insertpoint(mypoint, myid) {
    console.log('in insertpoint' + mypoint + '  ' + myid)
        //markerGroup.removeLayer(myid);
    var latlngs = polyline.getLatLngs();
    latlngs.splice(mypoint, 0, newpoint);
/*
Next we need to create a new draggable marker at this inserted point, redraw the polyline and update the GPX display.
*/
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
/*
The function redrawmarkers() clears all our markers and lines, then uses the array of latlngs to redraw all markers and polylines.
*/
function redrawmarkers() {
    markerGroup.clearLayers();
    // Get the polyline's latlngs
    var latlngs = polyline.getLatLngs();
    // Iterate the polyline's latlngs
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
/*
We can also write out all the values from our array of latlngs, and use Leaflet's function distanceTo(lastpoint) to calculate the distance between each consecutive pair of points.
We are inserting each of our stored points into the format needed for a GPX file.
*/
function displaylatlong() {
        var div = document.getElementById('track');
        var trackd = document.getElementById('trackdistance');
        var timestamp = new Date().toLocaleString('en-GB');
        gpxtrack = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<gpx xmlns="https://www.topografix.com/GPX/1/1"  creator="peter-thomson.com" version="1.1" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://www.topografix.com/GPX/1/1 https://www.topografix.com/GPX/1/1/gpx.xsd">
<trk><name>' + timestamp + '</name>
<trkseg>
';
        div.innerHTML = gpxtrack;
        var latlngs = polyline.getLatLngs();
        trkdistance = 0;
        var lastpoint = latlngs[0];
        // Iterate the polyline's latlngs
        for (var i = 0; i < latlngs.length; i++) {
            trkdistance += latlngs[i].distanceTo(lastpoint);
            var lastpoint = latlngs[i];
            div.innerHTML += '<trkpt lat="' + latlngs[i].lat + '" lon="' + latlngs[i].lng + '"></trkpt>
';
            gpxtrack += '<trkpt lat="' + latlngs[i].lat + '" lon="' + latlngs[i].lng + '"></trkpt>
';
        }
        trkdistance = trkdistance / 1000;
        miles = trkdistance * 0.6213712;
        div.innerHTML += '</trkseg>
</trk>
</gpx>
';
        gpxtrack += '</trkseg>
</trk>
</gpx>
';
        //trkdistance = trkdistance/1000;
        miles = trkdistance * 0.6213712;
        trackd.innerHTML = 'distance = ' + trkdistance.toFixed(2).toString() + 'km  distance = ' + miles.toFixed(2).toString() + ' miles (note distance is horizontal)';
    }
    
 /*
If the user clicks the download GPX button we supply this function with the content of our GPX file. The user can download the file without any interaction with the server.
*/
    //https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
var download = function (content, fileName, mimeType) {
    var a = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';
    if (navigator.msSaveBlob) { // IE10
        navigator.msSaveBlob(new Blob([content], {
            type: mimeType
        }), fileName);
    } else if (URL && 'download' in a) { //html5 A[download]
        a.href = URL.createObjectURL(new Blob([content], {
            type: mimeType
        }));
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        location.href = 'data:application/octet-stream,' + encodeURIComponent(content); // only this mime type is supported
    }
}
 
