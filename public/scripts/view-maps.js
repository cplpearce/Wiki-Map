// A $( document ).ready() listner
$( document ).ready(function() {

  // {"maps":[{"id":1,"title":"Blessed of the Stars","date_created":"2020-09-22T15:09:23.048Z","last_updated":"2020-09-22T15:09:23.048Z","share_url":null,"active":true,"private":true,"owner_id":5}
  const mapCardOwner = (id, title, date) => {
    return `
    <div class="card map-card col-lg-2 col-md-3 col-4">
      <img class="map-card-image" src="${'https://picsum.photos/200'}"/>
      <div class="card-body">
        <span class="text-muted">ID: ${id}</span>
        <h5 class="card-title">Title: ${title}</h5>
        <p class="text-muted">Date: ${new Date(date).toUTCString()}</span>
        <br>
        <button id="map-card-edit-${id}" type="button" class="btn btn-primary">Edit</button>
        <button id="map-card-view-${id}" type="button" class="btn btn-primary">View</button>
      </div>
    </div>
    `
  };
  // Get my maps
  $.get( "/maps", function(data) {
    Object.values(data.maps).forEach((map) => {
      $( '#maps-viewer-wrapper' ).append(mapCardOwner(map.id, map.title, map.date_created));
      // WHERE user_id === cookie
    });
  });
  $( '[id|="map-card-edit"]' ).click(function(event) {
    console.log(event)
  })
});
