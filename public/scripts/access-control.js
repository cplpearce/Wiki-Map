
$( document ).ready(function() {
  $('#login-form').submit((event) => {
    const credentials = {
      username : $('#login-username').val(),
      password : $('#login-password').val()
    };

    $.ajax({
      method: "POST",
      url: "/login",
      data: credentials
    }).then(data => {
      console.log(data);
    });
  });

  $('#logout').click(() => {
    $.post("/login/logout");
  });
});
