var map;
function initMap() {
  var spire = {lat: 53.349858, lng: -6.260325};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 18,
    center: spire
  });
  var marker = new google.maps.Marker({
    position: spire,
    map: map
  });

  var contentString =             '</div>'+
            '<h1 id="firstHeading" class="firstHeading">The Spire</h1>'+
            '<div id="bodyContent">'+
            '<p>The Spire of Dublin, alternatively titled the Monument of Light is a large...</p>';

    var infowindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 360
    });

    marker.addListener('click', function() {
      infowindow.open(map, marker);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){marker.setAnimation(null);}, 1400);
    });
}
