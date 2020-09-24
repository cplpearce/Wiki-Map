// On document ready
$( document ).ready(() => {
  // With an AJAX GET, get our user data
  $.ajax({
    method: "GET",
    url: "/users/user",
  }).then(data => {
    console.log(data)
    // set name/email/location to data.info
    const { name, email, location } = data.info;
    // init fav/collabs
    let favorited = "";
    let collabs = "";
    // Generate the favs and collab maps
    data.favs.map((fav) => favorited += `<li>${fav.fav_map}`);
    data.collabs.map((collab) => collabs += `<li>${collab.collab_map}`);
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
              <li class="list-group-item">Location: ${res.address.city}, ${res.address.state}, ${res.address.country}</li>
              <li class="list-group-item">Email: ${email}</li>
              <li class="list-group-item"><ul>${favorited}</ul></li>
              ${collabs.length ? '<li class="list-group-item">collabs</li>' : ''}
            </ul>
          </div>
        </article>
        `;
      // Add the card profileHTML to container-profile
      $(profileHTML).prependTo('#container-profile');
    });
  });
});
