const html = `
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
<script id="l" src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
<div id="map" style="width: 100%; height: 300px;"></div>
<script>
  document.getElementById("l").addEventListener("load", () => {
    const map = L.map("map");
    const marker = L.marker();
    const cb = (block) => {
      if (block?.property?.location) {
        const latlng = [block.property.location.lat, block.property.location.lng];
        map.setView(latlng);
        marker.setLatLng(latlng).addTo(map);
      } else {
        marker.remove();
      }
    };
    addEventListener("message", e => {
      if (e.source !== parent) return;
      cb(e.data);
    });
    cb(${JSON.stringify(reearth.block)});
  });
</script>
`;

reearth.ui.show(html, { visible: true });
reearth.onupdate = () => {
  reearth.ui.postMessage(reearth.block);
};
