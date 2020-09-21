// Js module for creating a new map

// A $( document ).ready() listner
$( document ).ready(function() {
  // replace "toner" here with "terrain" or "watercolor"
  const layer = new L.StamenTileLayer("toner");
  const map = new L.Map("map-frame", {
      center: new L.LatLng(43.6532, -79.3832),
      zoom: 12,
      name: 'My new Map',
  });
  L.DomUtil.addClass(map._container,'marker-cursor-enabled');
  // Disable map zoom double clicks
  map.doubleClickZoom.disable();
  map.addLayer(layer);
  // Make sure our toolbar is clickable
  const toolbar = L.DomUtil.get('create-map-toolbar');
  // Don't drop a point if user clicks the toolbar
  L.DomEvent.on(toolbar, 'mousewheel', L.DomEvent.stopPropagation);
  L.DomEvent.on(toolbar, 'mouseup', L.DomEvent.stopPropagation);

  map.on('dblclick', (event) => {
    const coord = event.latlng.toString().split(',');
    const marker = new L.marker(event.latlng, {type: 'marker', draggable: true}).addTo(map);
    // TODO: Create a server function to pass the point to the DB
  });
  // Without this, the map won't re-size if the display is set to none||hidden
  $( '#nav-buttons' ).children().click(() => {
    map.invalidateSize();
  });
  $( '#map-points-btn' ).click(function() {
    $( '#map-points-table-body' ).empty();
    let count = 1;
    map.eachLayer(function (layer) {
      if (layer.options.type === 'marker') {
        $( '#map-points-table-body' ).append(`
        <tr>
        <th scope="row">${count}</th>
        <td>${layer._latlng.lat.toFixed(5)}</td>
        <td>${layer._latlng.lng.toFixed(5)}</td>
        </tr>
        `);
        count += 1;
      }
    });
  })
});

