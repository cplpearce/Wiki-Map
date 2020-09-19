// Js module for creating a new map

// A $( document ).ready() listner
$( document ).ready(function() {
  // replace "toner" here with "terrain" or "watercolor"
  const layer = new L.StamenTileLayer("toner");
  const map = new L.Map("map-frame", {
      center: new L.LatLng(37.7, -122.4),
      zoom: 12
  });
  map.addLayer(layer);

  map.on('click', (event) => {
      const coord = event.latlng.toString().split(',');
      const lat = coord[0].split('(');
      const lon = coord[1].split(')');
      alert(`You clicked the map at latitude ${lat[1]} and longitude ${lon[0]}`);
      // Create a server function to pass the point to the DB
  });
});
