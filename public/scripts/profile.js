$( document ).ready(() => {
  $.ajax({
    method: "GET",
    url: "/users/user",
  }).then(data => {
    console.log(data)

    const { name, email, location } = data.info;
    let favorited = "";
    let collabs = "";

    for (const fav of data.favs) {
      favorited += `<li>${fav.fav_map}`;
    }

    for (const collab of data.collabs) {
      collabs += `<li>${collab.collab_map}`;
    }
    $.get(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&lat=${location.x}&lon=${location.y}`)
      .done(function(res) {
      const profileHtml = `
      <article class="profile-info mx-5">
        <div class="card" style="width: 18rem;">
          <div class="card-header">
            User: <strong>${name}</strong>
          </div>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Location: ${res.display_name}</li>
            <li class="list-group-item">Email: ${email}</li>
            <li class="list-group-item"><ul>${favorited}</ul></li>
            ${collabs.length ? '<li class="list-group-item">collabs</li>' : ''}
          </ul>
        </div>
      </article>
      `;

      $(profileHtml).prependTo('#container-profile');
    });
  });
});
