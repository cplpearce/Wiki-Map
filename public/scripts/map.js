// Js module for creating a new map

// A $( document ).ready() listner
$( document ).ready(function() {

  // Hide unused toolbar items
  $( '[id|="map-new"]' ).hide();

  // Ensure all divs in the map don't propagate
  const toolbar = L.DomUtil.get('map-toolbar');

  L.DomEvent.on(toolbar, 'mousewheel', L.DomEvent.stopPropagation);
  L.DomEvent.on(toolbar, 'dblclick', L.DomEvent.stopPropagation);

  // On document load, create the map and basemap
  // replace "toner" here with "terrain" or "watercolor"
  const basemapLayer = new L.StamenTileLayer("toner");
  const map = new L.Map("map-frame", {
      center: new L.LatLng(43.6532, -79.3832),
      zoom: 12,
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

  // Add the map to the Leaflet object
  map.addLayer(basemapLayer);

  // Resize the map anytime the page is changed
  $( '#nav-buttons' ).children().click(() => {
    map.invalidateSize();
  });

  // CREATING A NEW MAP
  // When the create-new button is pressed
  $( '#map-create-new' ).click(function() {

    // Hide itself
    $( '#map-create-new' ).hide();
    // And show all the map editor buttons
    $( '[id|="map-new"]' ).show();
    // Add the req modals to the map-modals div
    $( '#map-modals' ).html(`
      <!-- Modal for map points -->
      <div class="modal fade" id="map-points-modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit Points</h5>
              <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <table id="map-points-table" class="table table-striped table-hover">
                <thead class="thead-dark">
                  <tr>
                    <th class="text-center" scope="col">Point Number</th>
                    <th class="text-center" scope="col">Latitude</th>
                    <th class="text-center" scope="col">Longitude</th>
                    <th class="text-center" scope="col">Title</th>
                    <th class="text-center" scope="col">Description</th>
                    <th class="text-center" scope="col">Image (URL)</th>
                  </tr>
                </thead>
                <tbody id="map-points-table-body">
                </tbody>
              </table>
            </div>
            <div class="modal-footer">
              <button id="modal-view-points-save" type="button" class="btn btn-primary" data-dismiss="modal">Save</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for map settings -->
      <div class="modal fade" id="map-settings-modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Map Settings</h5>
              <button type="button" class="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="map-settings-add-team-members">Map Name</span>
                </div>
                <input id="map-settings-name" type="text" autocomplete="off" class="form-control" placeholder="My New Map!">
              </div>
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span class="input-group-text" id="map-settings-add-team-members">Teammates</span>
                </div>
                <input id="map-settings-add-team-members" type="username" autocomplete="off" class="form-control" placeholder="Comma Separated List of Usernames">
              </div>
              <div class="custom-control custom-switch">
                <input type="checkbox" class="custom-control-input" id="map-settings-public">
                <label class="custom-control-label" for="map-settings-public">Make map public?</label>
              </div>
              <br>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `);

    // Ensure all modals don't propagate
    const newMapPoints = L.DomUtil.get('map-points-modal');
    const newMapSettings = L.DomUtil.get('map-settings-modal');
    L.DomEvent.on(newMapPoints, 'mousewheel', L.DomEvent.stopPropagation);
    L.DomEvent.on(newMapPoints, 'dblclick', L.DomEvent.stopPropagation);
    L.DomEvent.on(newMapSettings, 'mousewheel', L.DomEvent.stopPropagation);
    L.DomEvent.on(newMapSettings, 'dblclick', L.DomEvent.stopPropagation);

    // Set a point counter
    let pointCount = 1;

    // Create a feature group to hold any created points
    // For reference, a Feature Group is an advanced Layer Group
    // with more features and methods.
    const markerGroup = new L.FeatureGroup();
    // And add it to the map
    map.addLayer(markerGroup);

    // Create a point when dblclicking basemap
    map.on('dblclick', (event) => {
      const marker = new L.marker(event.latlng, {pointNumber: pointCount, title: `Point ${pointCount}`, description: '', image: '', draggable: true}).addTo(markerGroup);
      marker.bindPopup(`
        <div id="marker-popup-div-${marker.options.pointNumber}" class="d-flex justify-content-center flex-column">
          <strong>Name: ${marker.options.title}</strong>
          <strong>Description: ${marker.options.description}</strong>
          <strong>Latitude: ${marker._latlng.lat.toFixed(5)}</strong>
          <strong>Longitude: ${marker._latlng.lng.toFixed(5)}</strong>
          <img src="${marker.options.image}"/>
        </div>
      `);
      // set it's Tooltip to it's name
      marker.bindTooltip(marker.options.title,
      {
          permanent: true,
          direction: 'right',
      });

      // Set a popup on mouseover
      marker.on('mouseover', function() {
        // Every time we mouse over, update the popup with the LatLon and any changed vars
        marker.setPopupContent(`
        <div id="marker-popup-div-${marker.options.pointNumber}" class="d-flex justify-content-center flex-column">
          <strong>Name: ${marker.options.title}</strong>
          <strong>Description: ${marker.options.description}</strong>
          <strong>Latitude: ${marker._latlng.lat.toFixed(5)}</strong>
          <strong>Longitude: ${marker._latlng.lng.toFixed(5)}</strong>
          <img class="point-image" src="${marker.options.image}" onerror="this.style.display='none'"/>
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
    });

    // View and edit placed points
    $( '#map-new-points-btn' ).click(function() {
      $( '#map-points-table-body' ).empty();
      markerGroup.eachLayer(function(marker) {
        $( '#map-points-table-body' ).append(`
          <tr>
            <td scope="row">${marker.options.pointNumber}</th>
            <td>${marker._latlng.lat.toFixed(5)}</td>
            <td>${marker._latlng.lng.toFixed(5)}</td>
            <td><input onClick="this.select();" value="${marker.options.title}" placeholder="A name for your pyn" class="form-control" id="point-${marker.options.pointNumber}-title"></input></td>
            <td><input onClick="this.select();" value="${marker.options.description}" class="form-control" placeholder="A brief pyn description"  id="point-${marker.options.pointNumber}-description"></input></td>
            <td><input onClick="this.select();" value="${marker.options.image}" class="form-control" placeholder="Max 200px*200px" id="point-${marker.options.pointNumber}-image"></input></td>
          </tr>
        `);
      });
    });

    // Update all point titles/descriptions when the edit points modal is *saved*
    $( '#modal-view-points-save' ).click(() => {
      markerGroup.eachLayer(function(marker) {
        marker.options.title = $( `#point-${marker.options.pointNumber}-title` ).val();
        marker.options.description = $( `#point-${marker.options.pointNumber}-description` ).val();
        marker.options.image = $( `#point-${marker.options.pointNumber}-image` ).val();
          marker.closeTooltip();
          marker.bindTooltip(marker.options.title,
            {
              permanent: true,
              direction: 'right',
            }
          );
      });
    });

    // Clear all points off map button
    $( '#map-new-clear-points-btn' ).click(() => {
      pointCount = 1;
      markerGroup.clearLayers();
    });

    // POST map to server
    $( '#map-new-post-btn' ).click(function() {
      const postNewMapData = {};

      postNewMapData.points = markerGroup.getLayers().map((marker) => {
        return {
          title: marker.options.title,
          description: marker.options.description,
          url: marker.options.image,
          lat: marker._latlng.lat,
          lon: marker._latlng.lng,
        };
      });
      postNewMapData.map_name = $( '#map-settings-name' ).val();
      postNewMapData.map_public = $( '#map-settings-public' ).val() === 'on' ? true : false;
      $.ajax({
        method: "POST",
        url: "/maps/create",
        data: postNewMapData
      }).then(newmap =>{
        console.log(newmap); ///// NEW MAP
      });
    });

    $( '#map-new-cancel-btn' ).click(() => {

      // Show the create map button
      $( '#map-create-new' ).show();
      // And hide all the map editor buttons
      $( '[id|="map-new"]' ).hide();
      map.removeLayer(markerGroup);
    });
  });
});

