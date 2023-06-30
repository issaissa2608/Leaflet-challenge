// Store our API endpoint inside queryUrl
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

const API_KEY = "pk.eyJ1IjoiNXQ0ZGF2aWQiLCJhIjoiY2w0cnJjaGM3MTRhNTNkcjE1cXVpYnM4ayJ9.SFAhxPLNfhjs4QI_kT9uHg";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  createFeatures(data.features);
});

function markerSize(magnitude) {
    return magnitude * 5;
}

function markerColor(magnitude) {
    if (magnitude <= 1) {
        return "#daec92"
    } else if (magnitude <= 2) {
        return "#ecea92"
    } else if (magnitude <= 3) {
        return "#ecd592"
    } else if (magnitude <= 4) {
        return "#dfb778"
    } else if (magnitude <= 5) {
        return "#e5a05b"
    } else {
        return "#f58668"
    }
};
function createFeatures(earthquakeData) { 
  //  the createFeature function
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "</h3><hr><p>" + "Magnitude: " + (feature.properties.mag) + "</p>");
  }

  const earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: markerSize(feature.properties.mag),
            fillColor: markerColor(feature.properties.mag),
            color: "#000",
            weight: 0.3,
            opacity: 0.5,
            fillOpacity: 1
        });
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  const streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  const darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  const satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
});


  // Define a baseMaps object to hold our base layers
  const baseMaps = {
    "Dark Map": darkmap,
    "Satellite": satellite,
    "Street Map": streetmap

  };

  // Create overlay object to hold our overlay layer
  const overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  const myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [darkmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  const legend = L.control({ position: "bottomright" });
  legend.onAdd = function(map) {
      var div = L.DomUtil.create("div", "info legend");
      magnitudes = [0, 1, 2, 3, 4, 5];
      labels = [];
      legendInfo = "<strong>Magnitude</strong>";
      div.innerHTML = legendInfo;
      // push to labels array as list item
      for (var i = 0; i < magnitudes.length; i++) {
          labels.push('<li style="background-color:' + markerColor(magnitudes[i] + 1) + '"> <span>' + magnitudes[i] + (magnitudes[i + 1]
               ? '&ndash;' + magnitudes[i + 1] + '' : '+') + '</span></li>');
      }
      // add label items to the div under the <ul> tag
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
      return div;
  };
  // Add legend to the map
  legend.addTo(myMap);

};