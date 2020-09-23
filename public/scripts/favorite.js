$( document ).ready(() => {

  const map_id = 1; //// Some way to ge map_id

$('#favorite-btn').click(() => {
    $.ajax({
      method : "post",
      url : `/maps/${map_id}/favorite`
    }).then(data => {
      console.log(data);
    });
  });
});
