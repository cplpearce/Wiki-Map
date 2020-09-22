// Js module for creating a new map

// A $( document ).ready() listner
$( document ).ready(function() {

  // Set a point counter
  let pointCount = 1;

  // replace "toner" here with "terrain" or "watercolor"
  const basemapLayer = new L.StamenTileLayer("toner");
  const map = new L.Map("map-frame", {
      center: new L.LatLng(43.6532, -79.3832),
      zoom: 12,
      name: 'My new Map',
  });

  // Add the locate me button
  L.control.locate().addTo(map);

  // Add the geocoder
  const geocoder = L.Control.geocoder({
    iconLabel: true,
  }).addTo(map);

  // Allow a custom cursor over map
  L.DomUtil.addClass(map._container,'marker-cursor-enabled');

  // Disable map zoom double clicks
  map.doubleClickZoom.disable();

  // create a layer group to hold user points and add it to the map
  const markerGroup = new L.layerGroup();
  map.addLayer(markerGroup);

  // Add the map to the Leaflet object
  map.addLayer(basemapLayer);

  // Create a point when dblclicking basemap
  map.on('dblclick', (event) => {
    const marker = new L.marker(event.latlng, {pointNumber: pointCount, title: '', description: '', image: 'https://oie.msu.edu/_assets/images/placeholder/placeholder-200x200.jpg', draggable: true}).addTo(markerGroup);
    marker.bindPopup(`
    <div id="marker-popup-div-${marker.options.pointNumber}" class="d-flex justify-content-center flex-column">
      <strong>Name: ${marker.options.title}</strong>
      <strong>Description: ${marker.options.description}</strong>
      <strong>Latitude: ${marker._latlng.lat.toFixed(5)}</strong>
      <strong>Longitude: ${marker._latlng.lng.toFixed(5)}</strong>
      <img src="${marker.options.image}"/>
    </div>
    `);
    marker.bindTooltip(`Point: ${marker.options.pointNumber}`,
    {
        permanent: true,
        direction: 'right',
    });

    // Set a popup on mouseover
    marker.on('mouseover', function() {
      marker.setPopupContent(`
      <div id="marker-popup-div-${marker.options.pointNumber}" class="d-flex justify-content-center flex-column">
        <strong>Name: ${marker.options.title}</strong>
        <strong>Description: ${marker.options.description}</strong>
        <strong>Latitude: ${marker._latlng.lat.toFixed(5)}</strong>
        <strong>Longitude: ${marker._latlng.lng.toFixed(5)}</strong>
        <img class="point-image" src="${marker.options.image}"/>
      </div>
      `);
      this.openPopup();
    });

    // Close the popup on mouse out
    marker.on('mouseout', () => {
      marker.closePopup();
    });

    // Ctrl click delete
    marker.on('click', function(event) {
      if (event.originalEvent.ctrlKey) {markerGroup.removeLayer(event.target)};
    });

    // Increment the pointCount
    pointCount += 1;

    // TODO: Create a server function to pass the point to the DB
  });

  // Without this, the map won't re-size if the display is set to none||hidden
  $( '#nav-buttons' ).children().click(() => {
    map.invalidateSize();
  });

  // View and edit placed points
  $( '#map-points-btn' ).click(function() {
    $( '#map-points-table-body' ).empty();
    markerGroup.eachLayer(function(marker) {
      $( '#map-points-table-body' ).append(`
        <tr>
          <td scope="row">${marker.options.pointNumber}</th>
          <td>${marker._latlng.lat.toFixed(5)}</td>
          <td>${marker._latlng.lng.toFixed(5)}</td>
          <td><input value="${marker.options.title}" placeholder="A name for your pyn" class="form-control" id="point-${marker.options.pointNumber}-title"></input></td>
          <td><input value="${marker.options.description}" class="form-control" placeholder="A brief pyn description"  id="point-${marker.options.pointNumber}-description"></input></td>
          <td><input onClick="this.select();" value="${marker.options.image}" class="form-control" placeholder="Max 200px*200px" id="point-${marker.options.pointNumber}-image"></input></td>
        </tr>
      `);
    });
  });

  // Update all point titles/descriptions when the edit points modal is *saved*
  $( '#modal-view-points-save' ).click(() => {
    markerGroup.eachLayer(function(marker) {
      marker.options.title = $( `#point-${marker.options.pointNumber}-title` ).val();
      marker.options.description = $( `#point-${marker.options.pointNumber}-description` ).val()
      marker.options.image = $( `#point-${marker.options.pointNumber}-image` ).val()
    });
  });

  // Clear all points off map button
  $( '#map-clear-points-btn' ).click(() => {
    pointCount = 1;
    markerGroup.clearLayers();
  });

  // POST map to server
  $( '#map-post-btn' ).click(function() {
    const postData = {}
    console.log(markerGroup.getLayers())
    //$.post( "ajax/test.html", function( data ) {
    //  $( ".result" ).html( data );
    //});
  })
});

