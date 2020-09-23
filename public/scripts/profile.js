$.ajax({
  method: "get",
  url: "/users/user",
}).then(data => {
  console.log(data);
});
