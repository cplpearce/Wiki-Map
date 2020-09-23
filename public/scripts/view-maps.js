// A $( document ).ready() listner
$( document ).ready(function() {

  // {"maps":[{"id":1,"title":"Blessed of the Stars","date_created":"2020-09-22T15:09:23.048Z","last_updated":"2020-09-22T15:09:23.048Z","share_url":null,"active":true,"private":true,"owner_id":5}
  const mapCardOwner = (id, title, date) => {
    date = new Date(date);
    return `
    <div class="card map-card col-lg-2 col-md-3 col-4">
      <img class="map-card-image" src="${'https://picsum.photos/200'}"/>
      <div class="card-body">
        <h5 class="card-title">Title: ${title}</h5>
        <p class="text-muted">Date: ${date.toDateString()}</span>
        <br>
        <br>
        <button id="map-card-edit-${id}" type="button" class="btn btn-primary">Edit</button>
        <button id="map-card-view-${id}" type="button" class="btn btn-primary">View</button>
      </div>
    </div>
    `
  };

  const mapCardViewer = (id, title, date) => {
    return `
    <div class="card map-card col-lg-2 col-md-3 col-4">
      <img class="map-card-image" src="${'https://picsum.photos/200'}"/>
      <div class="card-body">
        <h5 class="card-title">Title: ${title}</h5>
        <p class="text-muted">Date: ${new Date(date).toUTCString()}</span>
        <br>
        <button id="map-card-view-${id}" type="button" class="btn btn-primary">View</button>
      </div>
    </div>
    `
  };

  // Get my maps on nav click
  $( "[id|='viewer']" ).click(function() {
    $.ajax({
      method: "POST",
      url: "/maps",
      data: { map_req : this.id.split('-').slice(1).join('_') },
    }).then(function(res) {
      $( '#maps-viewer-wrapper' ).empty();
      Object.values(res.maps).forEach((map) => {
        // if (map.owner_id === data.user_id) {
          $( '#maps-viewer-wrapper' ).append(mapCardOwner(map.id, map.title, map.date_created));
        // }
      });
    });
  })

  /*
  // Get my maps
  $.ajax({
    method: "GET",
    url: "/maps",
  }).then(function(data) {
    console.log(data);
    Object.values(data.maps).forEach((map) => {
        $( '#maps-viewer-wrapper' ).append(mapCardOwner(map.id, map.title, map.date_created));
    });
  });
  */


  $(document).on("click", "[id|='map-card-edit']" , function() {

    const mapID = this.id.split('-').slice(-1)

    const basemapLayer = new L.StamenTileLayer("toner");
    const mapEdit = new L.Map('map-edit-frame', {
        center: new L.LatLng(43.6532, -79.3832),
        zoom: 12,
        name: 'My new Map',
    });

    // Add the locate me button
    L.control.locate().addTo(mapEdit);

    // Add the geocoder
    const geocoder = L.Control.geocoder({
      iconLabel: true,
    }).addTo(mapEdit);

    // Allow a custom cursor over map
    L.DomUtil.addClass(mapEdit._container,'marker-cursor-enabled');

    // Disable map zoom double clicks
    mapEdit.doubleClickZoom.disable();

    // create a layer group to hold user points and add it to the map
    const markerGroup = new L.FeatureGroup();
    mapEdit.addLayer(markerGroup);

    // Add the map to the Leaflet object
    mapEdit.addLayer(basemapLayer);

    // Get the map points!
    const loadedMarkers = $.get(`/maps/${mapID}`, function(markerData) {
      const pointCount = 1;

      /* Points object example
        1:
          active: true
          date_created: "2020-09-22T15:27:56.784Z"
          description: "The countrys landscape is colorful; steep, magnificent mountains, gorgeous flower fields and misty mountains are just a sliver of the wealth of beauty Athea has to offer, which is why the country is admired among foreigners."
          id: 32
          last_updated: "2020-09-22T15:27:56.784Z"
          location: {x: 23, y: 116}
          map_id: 4
          map_title: "Director of Peace"
          owner_id: 2
          share_url: null
          thumbnail_url: "https://picsum.photos/200"
          title: "The Woofer - Animal Sanctuary"
      */

      Object.values(markerData).forEach((marker) => {
        const latlng = [marker.location.x, marker.location.y];
        console.log(latlng);
        marker = new L.marker(latlng, {pointNumber: pointCount, title: marker.title, description: marker.description, image: 'https://oie.msu.edu/_assets/images/placeholder/placeholder-200x200.jpg', draggable: true}).addTo(markerGroup);
        // Set the popoup for these new markers
        marker.bindPopup(`
        <div id="marker-popup-div-${marker.options.pointNumber}" class="d-flex justify-content-center flex-column">
          <strong>Name: ${marker.options.title}</strong>
          <strong>Description: ${marker.options.description}</strong>
          <strong>Latitude: ${marker._latlng.lat.toFixed(5)}</strong>
          <strong>Longitude: ${marker._latlng.lng.toFixed(5)}</strong>
          <img class="popup-image" src="${marker.options.image}"/>
        </div>

        `);

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

        marker.bindTooltip(`Point: ${marker.options.title}`,
        {
            permanent: true,
            direction: 'right',
        });

        // Add all our new points to the map
        mapEdit.addLayer(markerGroup);
      })

      // Toggle the editor modal...
      $( '#map-editor-modal' ).modal('toggle')
      // And listen for it to appear fully
      $( '#map-editor-modal' ).on('shown.bs.modal', function() {
        // Wait until the modal appears to reset the map window
        mapEdit.invalidateSize();
        // Declare, set, and zoom our map the extent of markerGroup!
        const bounds = markerGroup.getBounds();
        mapEdit.fitBounds(bounds);
      });
    });
  });
});


