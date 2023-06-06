// Fetch the earthquake data.
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

async function fetchEarthquakeData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    createMap(data.features);
  } catch (error) {
    console.error('Error loading the earthquake data:', error);
  }
}

fetchEarthquakeData();

// Create the map.
function createMap(earthquakeData) {
  // Create a Leaflet map centered on a specific location
  const map = L.map('map').setView([39.8283, -98.5795], 4);

  // Add the tile layer (base layer map).
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Function to determine the marker size based on each earthquake's magnitude.
  function markerSize(magnitude) {
    return magnitude * 4;
  }

  // Function to determine the marker color based on each earthquake's depth.
  function markerColor(depth) {
    if (depth < 10) {
      return '#ADFF2F'; // Light green
    } else if (depth < 30) {
      return '#FFFF00'; // Yellow
    } else if (depth < 50) {
      return '#FFA500'; // Orange
    } else if (depth < 70) {
      return '#FF8C00'; // Dark orange
    } else if (depth < 90) {
      return '#FF4500'; // Orange-red
    } else {
      return '#FF0000'; // Red
    }
  }

  // Create a legend.
  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info legend');
    const depths = [-10, 10, 30, 50, 70, 90];
    const labels = [];

    for (let i = 0; i < depths.length; i++) {
      labels.push(
        '<i style="background:' + markerColor(depths[i]) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km' : '+ km')
      );
    }

    div.innerHTML = labels.join('<br>');
    return div;
  };

  legend.addTo(map);

  // Iterate through each part of the earthquake data to create markers.
  earthquakeData.forEach(earthquake => {
    const latitude = earthquake.geometry.coordinates[1];
    const longitude = earthquake.geometry.coordinates[0];
    const magnitude = earthquake.properties.mag;
    const depth = earthquake.geometry.coordinates[2];

    const marker = L.circleMarker([latitude, longitude], {
      radius: markerSize(magnitude),
      fillColor: markerColor(depth),
      color: '#000',
      weight: 0.5,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map);

    marker.bindPopup(
      `<h3>${earthquake.properties.place}</h3>
      <hr>
      <p>Magnitude: ${magnitude}</p>
      <p>Depth: ${depth} km</p>
      <p>Latitude: ${latitude}</p>
      <p>Longitude: ${longitude}</p>`
    );
  });
}