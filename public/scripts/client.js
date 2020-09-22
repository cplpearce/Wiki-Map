// Manage SPA page views
$( document ).ready(function() {
  // Set all the pynPoint divs to hidden at load
  $( '#pynPoint-container' ).children().css('display', 'none');
  // If there's no cookie, render the login page
  $( '#container-login' ).css('display', 'flex');
  // View manager
  $( "[id|='view']" ).click(function() {
    // Fade all the divs
    $( '#pynPoint-container' ).children().css('display', 'none');
    // Show the element desired
    $( `#container-${this.id.split('-').slice(1).join('-')}` ).css('display', 'flex');
  });
});
