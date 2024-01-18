// Store our API endpoint as queryUrl.
let queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

// Initialize Leaflet map
let map = L.map("map", {
    center: [37.0084901,-116.033579],
    zoom: 5
  })

// Adding the tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '© CartoDB'
}).addTo(map);

// Define a markerSize() function that will give each datapoint a different radius based on its magnitude.
function markerSize(magnitude) {
    
  // First verify if magnitude is a valid value to add to the map
    if (typeof magnitude !== 'number' || isNaN(magnitude) || magnitude <= 0) {
        return 0;
    }
    return Math.pow(magnitude, 2) * 8000
}

function getColor(d) {
     return d > 90 ? '#FF4500' :
            d > 70 ? '#FF8C00' :
            d > 50 ? '#FFD700' :
            d > 30 ? '#FFFF00' :
            d > 10 ? '#228B22' :
                         '#96FB8C' 
}

d3.json(queryUrl).then(function(earthquakes){
  let markers = L.layerGroup()
  
  earthquakes.features.forEach(function(feature) {
    // Extract coordenates and magnitud from features
    let coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
    let magnitude = feature.properties.mag
    let d = feature.geometry.coordinates[2]

    // According to its magnitud and depth, we will draw a circle on the map layer
    let circle = L.circle(coordinates, {
      radius: markerSize(magnitude),
      color: getColor(d),
      weight: 1,
      fillColor: getColor(d),
      fillOpacity: 0.8
    })

    // This popup is to show the earthquake info
    circle.bindPopup(`<strong>Magnitude:</strong> ${magnitude}<br>
                      <strong>Location:</strong> ${feature.properties.place}<br>
                      <strong>Depth:</strong> ${d} km`)

    // Add the point to the markers group
    markers.addLayer(circle)
  })

  // Add all the markers group to the map
  markers.addTo(map)
})

// From leaflet resources we create a control legend to show color meanings
var legend = L.control({position: 'bottomright'})
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        depths = [-10, 10, 30, 50, 70, 90],
        labels = [];
        
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < depths.length; i++) {
        div.innerHTML +=
            '<i style="background: ' + getColor(depths[i] + 0.1) + '"></i> ' +
            (depths[i] ? depths[i] : '0') + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+')
    }

    return div;
}
legend.addTo(map)
