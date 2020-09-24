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

  // If any layers exist remove them
  function clearAllLayers() {
    map.eachLayer(function (layer) {
      layer._url || map.removeLayer(layer);
    });
  }

  // Hide the toolbar buttons and remove any elements
  function exitMapEdit() {
    // Show the create map button
    $( '#map-create-new' ).show();
    // And hide all the map editor buttons
    $( '[id|="map-edit"]' ).hide();
    // Remove any layers
    clearAllLayers()
    // clear any set mapID
    mapID = '';
  }

  // Add the locate me button
  L.control.locate().addTo(map);

  // Add the geocoder
  L.Control.geocoder({
    iconLabel: true,
    placeholder: 'Search for Address...',
    collapsed: false,
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

  // To begin a viewing session
  function viewerEnable(mapID) {
    // If any layers exist remove them
    clearAllLayers()

    // Create a feature group to hold any created points
    // For reference, a Feature Group is an advanced Layer Group
    // with more features and methods.
    const markerGroup = new L.FeatureGroup();
    // And add it to the map
    map.addLayer(markerGroup);

    // Set a point counter
    let pointCount = 1;

    // First get an update the map metadata
    $.get(`/maps/${mapID}`, function(mapData) {
      $( '#map-settings-name' ).val(mapData[0].title);
      $( '#map-settings-public' ).val(mapData[0].private);
    })
    // then pull the points from the map
    $.get(`/maps/${mapID}/markers`, function(markerData) {
      let pointCount = 1;
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
        pointCount += 1;
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
      const bounds = markerGroup.getBounds().pad(0.5);
      map.fitBounds(bounds);
    });
  }
  // End of mapViewer

  // To begin upon creating a new map
  // When the create-new button is pressed
  function editorEnable(mapID) {

    // If any layers exist remove them
    clearAllLayers()

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
      // First get an update the map metadata
      $.get(`/maps/${mapID}`, function(mapData) {
        $( '#map-settings-name' ).val(mapData[0].title);
        $( '#map-settings-public' ).val(mapData[0].private);
      })
      // then pull the points from the map
      $.get(`/maps/${mapID}/markers`, function(markerData) {
        Object.values(markerData).forEach((markerRead) => {
          console.log(markerRead)
          const latlng = [markerRead.location.x, markerRead.location.y];
          marker = new L.marker(latlng, {
            pointNumber: pointCount,
            title: markerRead.title,
            description: markerRead.description,
            image: markerRead.thumbnail_url,
            id: markerRead.id,
            draggable: true}
            ).addTo(markerGroup);
          pointCount += 1;
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
        const bounds = markerGroup.getBounds().pad(0.5);
        map.fitBounds(bounds);

        // Ctrl click delete
        marker.on('click', function(event) {
          if (event.originalEvent.ctrlKey) {markerGroup.removeLayer(event.target)};
        });
      });
    }

    // Hide itself
    $( '#map-create-new' ).hide();
    // And show all the map editor buttons
    $( '[id|="map-edit"]' ).show();

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
      const postNewMapData = {};
      if (mapID) {
        // PUT updated map
        postNewMapData.points = markerGroup.getLayers().map((marker) => {
          return {
            title: marker.options.title,
            description: marker.options.description,
            image_url: marker.options.image,
            lat: marker._latlng.lat,
            lon: marker._latlng.lng,
            id: marker.options.id,
          };
        });
        postNewMapData.team = $( '#map-settings-add-team-members' ).val();
        postNewMapData.map_name = $( '#map-settings-name' ).val();
        postNewMapData.map_public = $( '#map-settings-public' ).val() === 'on' ? true : false;
        $.ajax({
          method: "PUT",
          url: `/maps/${mapID}`,
          data: postNewMapData
        })
      } else {
        // POST new map
        postNewMapData.points = markerGroup.getLayers().map((marker) => {
          return {
            title: marker.options.title,
            description: marker.options.description,
            image_url: marker.options.image,
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
      // Finally exit the editor
      exitMapEdit();
      // Add a toast
    });

    // Call exitMapEdit
    $( '#map-edit-cancel-btn' ).click(() => {
      exitMapEdit();
    });
  };
  // End of mapEditor

  // Enable a new editor without importing any points
  $( '#map-create-new' ).on('click', () => {
    mapID = '';
    editorEnable()
  });

  // When a user clicks on 'view', open the Map window to view
  // then on a map card edit button, load the editor
  $(document).on("click", "[id|='map-card-edit']" , function() {
    // Get the mapID by taking the button ID, splitting it, and taking the last value
    const mapID = this.id.split('-').slice(-1);
    $( '#view-map' ).trigger('click');
    editorEnable(mapID);
  });

  // When a user clicks on 'view', open the Map window to view
  // then on a map card view button, load the viewer
  $(document).on("click", "[id|='map-card-view']" , function() {
    // Get the mapID by taking the button ID, splitting it, and taking the last value
    const mapID = this.id.split('-').slice(-1);
    $( '#view-map' ).trigger('click');
    exitMapEdit();
    viewerEnable(mapID);
  });
});
