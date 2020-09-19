const userViews = [
  'container-create-map',
  'container-view-maps',
  'container-profile'
]
$( document ).ready(function() {
  // View manager
  $( '#view-create-map' ).click(() => {
    userViews.forEach((view) => $( `#${view}` ).fadeOut("slow" ));
    console.log('s')
  });
});
