// On document ready
$( document ).ready(() => {
  // Hide everything at first
  $( '#container-login' ).hide();
  $( '#nav-buttons' ).hide();
  // With an AJAX GET, get our user data
  $.ajax({
    method: "GET",
    url: "/users/user",
  }).then(data => {
    // If the user isn't logged in
    if (data === 'no login') {
      // Render the login page
      $( '#container-login' ).css('display', 'flex');
      // Hide the create new map button
      $( '#map-create-new' ).remove();
      // Change logout - to login
      $( '#logout' ).html('Login');
      // Logout's button color to green (success)
      $( '#logout' ).attr('class', 'btn btn-success');
      // And its ID to #login
      $( '#logout' ).attr('id', 'login');
      // And hide the profile button
      $( '#view-profile' ).hide();
      // And replace the entire group-button views with a new dropdown
      $( '#group-view-btns' ).replaceWith(`
      <div id="group-view-btns" class="btn-group" role="group">
        <button id="view-view-maps" type="button" class="btn btn-warning dropdown-toggle" data-toggle="dropdown">
          View Maps
        </button>
        <div class="dropdown-menu">
          <a id="viewer-public-maps" id="view-popular-map" class="dropdown-item">Public Maps</a>
        </div>
      </div>
      `);
      // $( '[id|="viewer"]' ).click();
      $( '#nav-buttons' ).show();
      $( "[id|='view']" ).click(function() {
        if (this.id !== 'view-view-maps') {
          // Fade all the divs
          $( '#pynPoint-container' ).children().css('display', 'none');
          // Show the element desired
          $( `#container-${this.id.split('-').slice(1).join('-')}` ).css('display', 'flex');
        } else {
          $( "[id|='viewer']" ).click(() => {
              // Fade all the divs
            $( '#pynPoint-container' ).children().css('display', 'none');
            // Show the element desired
            $( `#container-${this.id.split('-').slice(1).join('-')}` ).css('display', 'flex');
            $( '#map-create-new' ).hide();
          });
        }
      });
    } else {
      $( "#view-map" ).click();
      // Unhide the nav buttons
      $( '#nav-buttons' ).show();
      // set name/email/location to data.info
      const { name, email, location } = data.info;
      // init fav/collabs
      let favorited = "";
      let collabs = "";
      // Generate the favs and collab maps
      data.favs.map((fav) => favorited += `${fav.fav_map}<br>`);
      data.collabs.map((collab) => collabs += `${collab.collab_map}<br>`);
      // Begin a reverse Geocode for the current user's home city
      // nominatim reverse geo > as format JSON, at zoom level 10, on the users lat (x) and lon (y)
      $.get(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&lat=${location.x}&lon=${location.y}`)
        // res is the Reverse GEO code for the user LAT LON
        .done(function(res) {
          // Build the profile card
          const profileHTML = `
          <article class="profile-info mx-5">
            <div class="card" style="width: 18rem;">
              <div class="card-header">
                User: <strong>${name}</strong>
              </div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item"><strong>Location:</strong> ${res.address.city}, ${res.address.state}, ${res.address.country}</li>
                <li class="list-group-item"><strong>Email:</strong> ${email}</li>
                <li class="list-group-item"><strong>Favorites</strong><br>${favorited}</li>
                <li class="list-group-item"><strong>Collaborations</strong><br>${collabs}</li>
              </ul>
            </div>
          </article>
          `;
        // Add the card profileHTML to container-profile
        $(profileHTML).prependTo('#container-profile');
      });
    }
  });
});
