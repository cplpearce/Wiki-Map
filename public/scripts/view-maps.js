// A $( document ).ready() listner
$( document ).ready(function() {

  const mapCardOwner = (id, title, date) => {
    date = new Date(date);
    return `
    <div class="card map-card m-1">
      <ul class="list-group list-group-flush">
        <li class="list-group-item view-title text-center align-middle my-auto"><strong>${title}</strong></li>
        <li class="list-group-item view-date">Created: ${date.toDateString()}</li>
        <li class="list-group-item view-buttons">
          <button id="map-card-edit-${id}" type="button" class="btn btn-primary btn-block">Edit</button>
          <button id="map-card-view-${id}" type="button" class="btn btn-primary btn-block">View</button>
          <button id="map-card-favorite-${id}" type="button" class="btn btn-warning  btn-block">Favorite</button>
        </li>
      </ul>
    </div>
    `
  };

  const mapCardViewer = (id, title, date) => {
    date = new Date(date);
    return `
    <div class="card map-card m-1">
      <ul class="list-group list-group-flush">
        <li class="list-group-item view-title text-center align-middle my-auto"><strong>${title}</strong></li>
        <li class="list-group-item view-date">Created: ${date.toDateString()}</li>
        <li class="list-group-item d-flex flex-column justify-content-between view-buttons">
          <button id="map-card-view-${id}" type="button" class="btn btn-primary mx-2 btn-block">View</button>
          <button id="map-card-favorite-${id}" type="button" class="btn btn-warning mx-2 btn-block">Favorite</button>
        </li>
      </ul>
    </div>
    `
  };
  /*
  collaborator_on: false
date_created: "2020-09-24T17:01:24.775Z"
favorite: false
id: 10
last_updated: "2020-09-24T17:01:24.775Z"
share_url: null
title: "Cleric of the Arcane"
*/

  // Get my maps on nav click
  $( "[id|='viewer']" ).click(function() {
    const map_req_type = this.id.split('-').slice(1).join('-');
    $.get('/maps').then(function(res) {
      console.log(map_req_type)
      console.log(res)
      $( '#maps-viewer-wrapper' ).empty();
      Object.values(res.maps).forEach((map) => {
        console.log(map)
        if (map_req_type === 'public-maps') {
          $( '#maps-viewer-wrapper' ).append(mapCardViewer(map.id, map.title, map.date_created));
        } else {
          $( '#maps-viewer-wrapper' ).append(mapCardOwner(map.id, map.title, map.date_created));
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
