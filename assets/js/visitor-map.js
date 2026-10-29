async function initVisitorMap() {
  const element = document.getElementById('visitor-map');
  if (!element) return;
  const status = document.getElementById('visitor-status');
  if (!window.L) { status.textContent = 'Map unavailable. Please reload.'; return; }
  const map = L.map(element, { crs: L.CRS.EPSG4326, scrollWheelZoom: false, minZoom: -1, maxZoom: 5, zoomSnap: 0.25, attributionControl: true });
  map.attributionControl.addAttribution('<a href="https://www.naturalearthdata.com/">Natural Earth</a>');
  const markers = L.layerGroup().addTo(map);
  let countries;
  try {
    const result = await fetch('../assets/world-countries.geojson');
    if (!result.ok) throw new Error('Map data unavailable');
    countries = L.geoJSON(await result.json(), {
      filter: feature => feature.properties.ISO_A2 !== 'AQ',
      style: { color: '#fff', weight: 0.6, fillColor: '#c6d2d6', fillOpacity: 1 },
      onEachFeature: (feature, layer) => {
        const label = document.createElement('span');
        label.textContent = feature.properties.ADMIN || feature.properties.NAME;
        layer.bindTooltip(label);
      },
    }).addTo(map);
    map.fitBounds([[-58, -180], [85, 180]], { padding: [8, 8] });
  } catch { status.textContent = 'Map data unavailable. Please reload.'; return; }
  new ResizeObserver(() => map.invalidateSize()).observe(element);
  try {
    status.textContent = 'Live visitor statistics require a separate backend; GitHub Pages serves static files only.';
    document.querySelectorAll('.visitor-counts strong').forEach(node => node.textContent = '—');
    return;
    const response = await fetch('/__visitors/visit', { method: 'POST', credentials: 'same-origin' });
    if (!response.ok) throw new Error('Statistics unavailable');
    const stats = await response.json();
    document.getElementById('visitor-total').textContent = stats.visits;
    document.getElementById('visitor-countries').textContent = stats.countries;
    const visited = new Set(stats.locations.map(x => x.countryCode));
    countries.setStyle(feature => ({ fillColor: visited.has(feature.properties.ISO_A2_EH || feature.properties.ISO_A2) ? '#73a7a0' : '#c6d2d6' }));
    for (const location of stats.locations) {
      const label = `${location.city}, ${location.country}: ${location.visits} visit${location.visits === 1 ? '' : 's'}`;
      const popup = document.createElement('span');
      popup.textContent = label;
      L.circleMarker([location.latitude, location.longitude], {
        radius: Math.min(13, 4 + Math.log2(location.visits + 1) * 2),
        color: '#fff', weight: 1.5, fillColor: '#a51d38', fillOpacity: 0.85,
      }).bindPopup(popup).addTo(markers);
    }
    const list = document.getElementById('visitor-locations');
    for (const location of [...stats.locations].sort((a,b) => b.visits - a.visits).slice(0, 8)) {
      const item = document.createElement('li');
      item.textContent = `${location.city}, ${location.country} (${location.visits})`;
      list.append(item);
    }
    status.textContent = stats.visits ?
      `Approximate IP-based locations. ${stats.unmappedVisits} visit(s) without location data.` :
      `No external visits recorded. Local preview sessions: ${stats.previewVisits}.`;
  } catch {
    status.textContent = 'Visitor statistics are unavailable on this host.';
  }
}
initVisitorMap();
