// A $( document ).ready() listner
$( document ).ready(function() {

  const buildMapCard = (map, edit = true) => {
    date = new Date(map.date_created);

    let mapCard = $( `
    <div class="card map-card m-1">
      <ul class="list-group list-group-flush">
        <li class="list-group-item view-title text-center align-middle my-auto"><strong>${map.title}</strong></li>
        <li class="list-group-item view-date">Created: ${date.toDateString()}</li>
        <li id="map-card-buttons-${map.id}" class="list-group-item view-buttons">
          <button id="map-card-view-${map.id}" type="button" class="btn btn-primary btn-block">View</button>
          <button id="map-card-favorite-${map.id}" type="button" class="btn btn-warning btn-block">Favorite</button>
        </li>
      </ul>
    </div>
    ` );

    if (map.favorite) {
      $( `#map-card-favorite-${map.id}`, mapCard ).attr('class', 'btn btn-warning btn-block');
    } else {
      $( `#map-card-favorite-${map.id}`, mapCard ).attr('class', 'btn btn-secondary btn-block');
    }
    if (edit) {
      $( `#map-card-buttons-${map.id}`, mapCard ).prepend(`<button id="map-card-edit-${map.id}" type="button" class="btn btn-primary btn-block">Edit</button>`);
    }
    return mapCard;
  };

  // Get my maps on nav click
  $( "[id|='viewer']" ).click(function() {
    const map_req_type = this.id.split('-').slice(1).join('-');
    $.get('/maps').then(function(res) {
      $( '#maps-viewer-wrapper' ).empty();
      res.forEach((map) => {
        if (map_req_type === 'my-maps') {
        // View all this users maps, and collabs
          if (map.is_owner || map.collaborator_on) {$( '#maps-viewer-wrapper' ).append(buildMapCard(map))};
        } else if (map_req_type === 'team-maps') {
        // View all this users collabs
          if (map.collaborator_on) {$( '#maps-viewer-wrapper' ).append(buildMapCard(map))};
        } else if (map_req_type === 'favorite-maps') {
        // View all this users favorite maps
          if (map.favorite) {
            if (map.is_owner || map.collaborator_on) {
              $( '#maps-viewer-wrapper' ).append(buildMapCard(map));
            } else {
              $( '#maps-viewer-wrapper' ).append(buildMapCard(map, false));
            }
          }
        } else if (map_req_type === 'public-maps') {
        // View all public map (users map, any other public maps)
          if (map.is_owner) {
            $( '#maps-viewer-wrapper' ).append(buildMapCard(map));
          } else if (!map.is_private) {
            $( '#maps-viewer-wrapper' ).append(buildMapCard(map, false));
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
