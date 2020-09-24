// A $( document ).ready() listner
$( document ).ready(function() {

  const mapCardOwner = (map) => {
    date = new Date(map.date_created);
    return `
    <div class="card map-card m-1">
      <ul class="list-group list-group-flush">
        <li class="list-group-item view-title text-center align-middle my-auto"><strong>${map.title}</strong></li>
        <li class="list-group-item view-date">Created: ${date.toDateString()}</li>
        <li class="list-group-item view-buttons">
          <button id="map-card-edit-${map.id}" type="button" class="btn btn-primary btn-block">Edit</button>
          <button id="map-card-view-${map.id}" type="button" class="btn btn-primary btn-block">View</button>
          <button id="map-card-favorite-${map.id}" type="button" class="btn btn-warning  btn-block">Favorite</button>
        </li>
      </ul>
    </div>
    `
  };

  const mapCardViewer = (map) => {
    date = new Date(map.date_created);
    return `
    <div class="card map-card m-1">
      <ul class="list-group list-group-flush">
        <li class="list-group-item view-title text-center align-middle my-auto"><strong>${map.title}</strong></li>
        <li class="list-group-item view-date">Created: ${date.toDateString()}</li>
        <li class="list-group-item d-flex flex-column justify-content-between view-buttons">
          <button id="map-card-view-${map.id}" type="button" class="btn btn-primary mx-2 btn-block">View</button>
          <button id="map-card-favorite-${map.id}" type="button" class="btn btn-warning mx-2 btn-block">Favorite</button>
        </li>
      </ul>
    </div>
    `
  };

  // Get my maps on nav click
  $( "[id|='viewer']" ).click(function() {
    const map_req_type = this.id.split('-').slice(1).join('-');
    $.get('/maps').then(function(res) {
      $( '#maps-viewer-wrapper' ).empty();
      res.forEach((map) => {
        console.log(map)
        if (map_req_type === 'my-maps') {
        // View all this users maps, and collabs
          if (map.is_owner || map.collaborator_on) {$( '#maps-viewer-wrapper' ).append(mapCardOwner(map))};
        } else if (map_req_type === 'team-maps') {
        // View all this users collabs
          if (map.collaborator_on) {$( '#maps-viewer-wrapper' ).append(mapCardOwner(map))};
        } else if (map_req_type === 'favorite-maps') {
        // View all this users favorite maps
          if (map.favorite) {
            if (map.is_owner || map.collaborator_on) {
              $( '#maps-viewer-wrapper' ).append(mapCardOwner(map));
            } else {
              $( '#maps-viewer-wrapper' ).append(mapCardViewer(map));
            }
          }
        } else if (map_req_type === 'public-maps') {
        // View all public map (users map, any other public maps)
          if (map.is_owner || map.collaborator_on) {
            $( '#maps-viewer-wrapper' ).append(mapCardOwner(map));
          } else {
            $( '#maps-viewer-wrapper' ).append(mapCardViewer(map));
          }
        }
      });
    });
  })

  // Make map a favorite
  $(document).on("click", "[id|='map-card-favorite']" , function() {
    // Get the mapID by taking the button ID, splitting it, and taking the last value
    const mapID = this.id.split('-').slice(-1);
    $.post(`maps/${mapID}/favorite`, mapID);
  });
});
