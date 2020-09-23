$.ajax({
  method: "get",
  url: "/users/user",
}).then(data => {
  const { name, email, location} = data.info;
  let favorited = "";
  let collabs = "";

  for (const fav of data.favs) {
    favorited += `<li>${fav.fav_map}`;
  }

  for (const collab of data.collabs) {
    collabs += `<li>${collab.collab_map}`;
  }


  const profileHtml = `<article class="profile-info style="display: block">
  <h1>${name}<h1>
  <p>E-mail adress : ${email}<p>
  <p>Location : ${location}<p>
  <h3>Favorites:<h3>
  <ul>${favorited}</ul>
  <h3>Team mate on: <h3>
  <ul>${collabs}<ul>`;


  console.log(profileHtml)




  $(profileHtml).prependTo('#container-profile');
});
