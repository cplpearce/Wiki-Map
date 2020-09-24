// Js module for creating a new map

// A $( document ).ready() listner
$( document ).ready(function() {

  // Hide unused toolbar items
  $( '[id|="map-edit"]' ).hide();

  // Set the popup internals
  function renderPopup(marker) {
    // In case there wasn't an image set, set it to '' so there's no img url error
    marker.options.image = marker.options.image || '';
    return `
    <div id="marker-popup-div-${marker.options.id}" class="d-flex justify-content-center flex-column">
      <strong>Name: ${marker.options.title}</strong>
      <strong>Description: ${marker.options.description}</strong>
      <strong>Latitude: ${marker._latlng.lat.toFixed(5)}</strong>
      <strong>Longitude: ${marker._latlng.lng.toFixed(5)}</strong>
      <img class="point-image" src="${marker.options.image}" onerror="this.style.display='none'"/>
    </div>
    `;
  }

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

  // To begin upon creating a new map
  // When the create-new button is pressed
  function editorEnable(mapID) {

    // If any layers exist remove them
    map.eachLayer(function (layer) {
      layer._url || map.removeLayer(layer);
    });

    // Create a feature group to hold any created points
    // For reference, a Feature Group is an advanced Layer Group
    // with more features and methods.
    const markerGroup = new L.FeatureGroup();
    // And add it to the map
    map.addLayer(markerGroup);

    // Set a point counter
    let pointCount = 1;
    // If editorEnable is passed with a map ID
    if (mapID) {
      $.get(`/maps/${mapID}`, function(mapData) {
        $( '#map-settings-name' ).val(mapData[0].title);
        $( '#map-settings-public' ).val(mapData[0].private);
      })
      // GET MAP NAME, ETC HERE
      $.get(`/maps/${mapID}/markers`, function(markerData) {
        const pointCount = 1;
        Object.values(markerData).forEach((markerRead) => {
          const latlng = [markerRead.location.x, markerRead.location.y];
          marker = new L.marker(latlng, {
            pointNumber: pointCount,
            title: markerRead.title,
            description: markerRead.description,
            image: markerRead.thumbnail_url,
            id: markerRead.id,
            draggable: true}
            ).addTo(markerGroup);
          // Set the popoup for these new markers
          marker.bindPopup(renderPopup(marker), {maxWidth : 200});

            // Set a popup on mouseover
          marker.on('mouseover', function() {
            marker.setPopupContent(renderPopup(marker), {maxWidth : 200});
            this.openPopup();
          });
          marker.bindTooltip(marker.options.title,
            {
              permanent: true,
              direction: 'right',
            });
        });
        const bounds = markerGroup.getBounds();
        map.fitBounds(bounds);
      });
    }

    // Hide itself
    $( '#map-create-new' ).hide();
    // And show all the map editor buttons
    $( '[id|="map-edit"]' ).show();
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

    // Create a point when dblclicking basemap
    map.on('dblclick', (event) => {
      const marker = new L.marker(event.latlng, {pointNumber: pointCount, title: `Point ${pointCount}`, description: '', image: '', draggable: true}).addTo(markerGroup);
      marker.bindPopup(renderPopup(marker), {maxWidth : 200});
      // set it's Tooltip to its name
      marker.bindTooltip(marker.options.title,
      {
        permanent: true,
        direction: 'right',
      });

      // Set a popup on mouseover
      marker.on('mouseover', function() {
        // Every time we mouse over, update the popup with the LatLon and any changed vars
        marker.setPopupContent(renderPopup(marker), { maxWidth : 200 });
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
    $( '#map-edit-points-btn' ).click(function() {
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

    // Clear the map of all points and reset counter to 1
    function clearMap() {
      pointCount = 1;
      markerGroup.clearLayers();
    }

    // clearMap when the Clear map button is pressed
    $( '#map-edit-clear-points-btn' ).click(() => {
      clearMap();
    });

    // POST or Update map to server
    $( '#map-edit-post-btn' ).click(function() {
      if (mapID) {
        // POST new map
        const postNewMapData = {};

        postNewMapData.points = markerGroup.getLayers().map((marker) => {
          return {
            title: marker.options.title,
            description: marker.options.description,
            url: marker.options.image,
            lat: marker._latlng.lat,
            lon: marker._latlng.lng,
            id: marker.options.id,
          };
        });
        postNewMapData.team = $( '#map-settings-add-team-members' ).val();
        postNewMapData.map_name = $( '#map-settings-name' ).val();
        postNewMapData.map_public = $( '#map-settings-public' ).val() === 'on' ? true : false;
        console.log(postNewMapData)
        $.ajax({
          method: "PUT",
          url: "/maps/create",
          data: postNewMapData
        })
      } else {
        // POST new map
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
        postNewMapData.team = $( '#map-settings-add-team-members' ).val();
        postNewMapData.map_name = $( '#map-settings-name' ).val();
        postNewMapData.map_public = $( '#map-settings-public' ).val() === 'on' ? true : false;
        $.ajax({
          method: "POST",
          url: "/maps/create",
          data: postNewMapData
        })
      };
    });

    // Hide the toolbar buttons and remove any elements
    function exitMapEdit() {
      // Show the create map button
      $( '#map-create-new' ).show();
      // And hide all the map editor buttons
      $( '[id|="map-edit"]' ).hide();
      // Remove the markerGroup
      map.removeLayer(markerGroup);
    }

    // Call exitMapEdit
    $( '#map-edit-cancel-btn' ).click(() => {
      exitMapEdit();
    });
  };

  // Enable a new editor without importing any points
  $( '#map-create-new' ).on('click', () => {
    editorEnable()
  });

  // When a user clicks on 'view', open the Map window to view
  // then on a map card, load the editor
  $(document).on("click", "[id|='map-card-edit']" , function() {
    // Get the mapID by taking the button ID, splitting it, and taking the last value
    const mapID = this.id.split('-').slice(-1);
    $( '#view-map' ).trigger('click');
    editorEnable(mapID);
  });
});
