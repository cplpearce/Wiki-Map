// Manage SPA page views
$( document ).ready(function() {
  // Set all the pynPoint divs to hidden at load
  $( '#pynPoint-container' ).children().css('display', 'none');
  // View manager
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
      });
    }
  });
});
/*
    console.log(this.id)
    if (!this.id === 'view-view-maps') {
      // Fade all the divs
      $( '#pynPoint-container' ).children().css('display', 'none');
      // Show the element desired
      $( `#container-${this.id.split('-').slice(1).join('-')}` ).css('display', 'flex');
    } else {
      $( "[id|='viewer']" ).click(function() {
        // Fade all the divs
      $( '#pynPoint-container' ).children().css('display', 'none');
      // Show the element desired
      $( `#container-${this.id.split('-').slice(1).join('-')}` ).css('display', 'flex');
      });
    }
*/
