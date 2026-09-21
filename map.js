'use strict';

// GeoJSON uses [longitude, latitude]; Leaflet views use [latitude, longitude].
// All map assets are local. No tile service, API key, or analytics is required.
(async () => {
  const status = document.getElementById('map-status');
  const examplesToggle = document.getElementById('map-examples');
  if (!window.L) {
    status.textContent = 'The map library could not load. Reload the page to try again.';
    return;
  }
  const map = L.map('map', {
    scrollWheelZoom: false, minZoom: 0, maxZoom: 8, zoomSnap: 0.25,
    zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false,
    maxBounds: [[-85, -200], [85, 200]], maxBoundsViscosity: 1
  });
  const reset = () => {
    map.stop();
    map.fitBounds([[-58, -175], [80, 175]], {padding: [8, 8], animate: false});
  };
  reset();
  new ResizeObserver(() => map.invalidateSize()).observe(document.getElementById('map'));
  document.getElementById('map-reset').disabled = false;
  document.getElementById('map-reset').addEventListener('click', reset);
  map.attributionControl.addAttribution('Geography: <a href="https://www.naturalearthdata.com/">Natural Earth</a>');
  map.createPane('land');
  map.getPane('land').style.zIndex = 200;
  const locations = document.getElementById('map-locations');
  const empty = document.getElementById('map-empty');
  const entries = [];
  function updateIndex() {
    locations.replaceChildren();
    entries.filter(entry => !entry.example || examplesToggle.checked).forEach(entry => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.textContent = entry.name;
      button.addEventListener('click', () => {
        if (entry.layer.getBounds) map.fitBounds(entry.layer.getBounds(), {maxZoom: 5});
        else map.setView(entry.layer.getLatLng(), 5);
        entry.layer.openPopup();
      });
      item.append(button);
      locations.append(item);
    });
    empty.hidden = locations.childElementCount > 0;
  }
  const featureOptions = example => ({
    style: feature => ({color: /^#[\da-f]{6}$/i.test(feature.properties?.color) ? feature.properties.color : '#b31f34', weight: 2, fillOpacity: 0.3}),
    pointToLayer: (_feature, latlng) => L.circleMarker(latlng, {radius: 7, color: '#40301e', weight: 2, fillColor: '#c8a24a', fillOpacity: 1}),
    onEachFeature: (feature, layer) => {
      const name = feature.properties?.name || 'Unnamed location';
      const popup = document.createElement('div');
      const heading = document.createElement('h3');
      heading.textContent = name;
      const description = document.createElement('p');
      description.textContent = feature.properties?.description || 'Add a description for this location.';
      popup.append(heading, description);
      layer.bindPopup(popup);
      const label = document.createElement('span');
      label.textContent = name;
      layer.bindTooltip(label);
      entries.push({name, layer, example});
    }
  });
  async function read(file) {
    const response = await fetch('data/' + file + '.geojson');
    if (!response.ok) throw new Error(file + ': HTTP ' + response.status);
    const data = await response.json();
    if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error(file + ': expected a GeoJSON FeatureCollection');
    return data;
  }
  try {
    const [land, territories, places] = await Promise.all(['land', 'territories', 'places'].map(read));
    L.geoJSON(land, {pane: 'land', interactive: false, style: {color: '#93896e', weight: 0.7, fillColor: '#e8dfc1', fillOpacity: 1}}).addTo(map);
    L.geoJSON(territories, featureOptions(false)).addTo(map);
    L.geoJSON(places, featureOptions(false)).addTo(map);
    updateIndex();
    status.textContent = 'Atlas ready. Select a location on the map or in the list below.';
  } catch (error) {
    status.textContent = 'The atlas data could not load. Serve this folder over HTTP and check the GeoJSON files, then reload.';
    console.error('Atlas:', error);
    return;
  }
  // Optional examples are separate from the blank author-owned data files.
  try {
    const [territories, places] = await Promise.all(['example-territories', 'example-places'].map(read));
    const examples = L.featureGroup([L.geoJSON(territories, featureOptions(true)), L.geoJSON(places, featureOptions(true))]);
    examplesToggle.disabled = false;
    examplesToggle.addEventListener('change', () => {
      if (examplesToggle.checked) { examples.addTo(map); map.fitBounds(examples.getBounds(), {padding: [40, 40], maxZoom: 4}); }
      else { map.removeLayer(examples); reset(); }
      updateIndex();
    });
  } catch (error) {
    status.textContent = 'Atlas ready. Optional examples could not load.';
    console.warn('Atlas examples:', error);
  }
})();
