$(document).ready(function() {
  
  function setMinHeight() {
    windowHeight = $(window).innerHeight();
    $('#map').css('min-height', windowHeight);
    $('#menubar').css('min-height', windowHeight);
  };
  setMinHeight();

  $(window).resize(function() {
    setMinHeight();
  });
});