// Js module for creating a new map

// A $( document ).ready() listner
$( document ).ready(function() {
  // replace "toner" here with "terrain" or "watercolor"
  const layer = new L.StamenTileLayer("toner");
  const map = new L.Map("map-frame", {
      center: new L.LatLng(43.6532, -79.3832),
      zoom: 12
  });
  L.DomUtil.addClass(map._container,'marker-cursor-enabled');
  map.addLayer(layer);
  // Make sure our toolbar is clickable
  const toolbar = L.DomUtil.get('create-map-toolbar');

  // Don't drop a point if user clicks the toolbar
  L.DomEvent.on(toolbar, 'mousewheel', L.DomEvent.stopPropagation);
  L.DomEvent.on(toolbar, 'click', L.DomEvent.stopPropagation);

  map.on('click', (event) => {
    const coord = event.latlng.toString().split(',');
    const clickLat = coord[0].split('(');
    const clickLon = coord[1].split(')');
    alert(`You clicked the map at latitude ${clickLat[1]} and longitude ${clickLon[0]}`);
    // TODO: Create a server function to pass the point to the DB
  });
  // Without this, the map won't re-size if the display is set to none||hidden
  $( '#nav-buttons' ).children().click(() => {
    map.invalidateSize();
  });
});
