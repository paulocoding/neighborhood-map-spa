// setting up google map
var map;
var mapcenter = {lat: 53.349858, lng: -6.260325};
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

$(function(){

  // foursquare
  var ClientID = 'W3HFAQKBHHUMH5DHJNSXUR4RQFXLTVGVHJA4ODOMYWSZCJQT';
  var ClientSecret = 'RINKPCMKRQFYL0FR04SZJE5CMPWYT315DQDXRSCGOSQB4FKX';
  function foursquareJsonUrl(id, secret, lat, lng, radius, limit){

    // getting the current date in the right format
    var d = new Date();
    var curr_day = d.getDate();
    if (curr_day < 10){
      curr_day = '0' + curr_day.toString();
    } else {
      curr_day = curr_day.toString();
    }
    var curr_month = d.getMonth()+1;
    if (curr_month < 10){
      curr_month = '0' + curr_month.toString();
    } else {
      curr_month = curr_month.toString();
    }
    var curr_year = d.getFullYear();
    var dateformated = '' + curr_year + curr_month + curr_day;

    url = 'https://api.foursquare.com/v2/venues/search?ll='+ lat+','+ lng+
          '&radius='+ radius+
          '&limit='+ limit+
          '&client_id='+ id+
          '&client_secret='+secret+
          '&v='+dateformated;
    return url;
  }

  console.log(foursquareJsonUrl(ClientID, ClientSecret, mapcenter.lat, mapcenter.lng, 10, 10));
});
