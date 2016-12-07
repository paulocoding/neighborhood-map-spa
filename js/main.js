// setting up google maps
var map;
var mapcenter = {lat: 53.349807, lng: -6.260225};
function initMap() {
  var spire = {lat: 53.349807, lng: -6.260225};
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 17,
    center: spire
  });
}



// main app
$(function(){

  function createMarker(item){
    var marker = new google.maps.Marker({
      position: {lat: item.lat, lng: item.lng},
      map: map
    });

    // info window
    var contentString = '</div>'+
              '<h1 id="firstHeading" class="firstHeading">'+item.name+'</h1>'+
              '<div id="bodyContent">'+
              '<p>'+item.category+'</p>'+
              '<p>'+item.address+'</p>'+
              '<p>'+item.city+'</p>'+
              '<p>'+item.country+'</p>';

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

  // date format Helper
  function getCurrDate(){
      // getting the current date
      // and formating it to the foursquare standard YYYYMMDD
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
      var dateformated = curr_year + curr_month + curr_day;
      return dateformated;
  }

  // foursquare api
  var ClientID = 'W3HFAQKBHHUMH5DHJNSXUR4RQFXLTVGVHJA4ODOMYWSZCJQT';
  var ClientSecret = 'RINKPCMKRQFYL0FR04SZJE5CMPWYT315DQDXRSCGOSQB4FKX';
  function foursquareJsonUrl(id, secret, lat, lng, radius, limit){

    url = 'https://api.foursquare.com/v2/venues/search?ll='+ lat+','+ lng+
          '&radius='+ radius+
          '&limit='+ limit+
          '&client_id='+ id+
          '&client_secret='+secret+
          '&v='+ getCurrDate();
    return url;
  }

  // gets locations from foursquare using an ajax json call
  // and pushes them to the given lists
  // locationList serves as cache
  // filteredList serves as view model list
  function getFoursquareList(locationList, filteredList){
    var foursquareUrl = foursquareJsonUrl(ClientID, ClientSecret,
                                          mapcenter.lat, mapcenter.lng,
                                          10000, 10);
    // json call
    $.getJSON(foursquareUrl, function(data){
      data.response.venues.forEach(function(el){
        var location = {};
        location.name = el.name;

        if (el.categories[0]){
          location.category = el.categories[0].name;
        } else {
          location.category = 'No category';
        }

        if (el.location.address){
          location.address = el.location.address;
        } else {
          location.address = '-';
        }

        if (el.location.city){
          location.city = el.location.city;
        } else {
          location.city = '-';
        }

        if (el.location.country){
          location.country = el.location.country;
        } else {
          location.country = '-';
        }
        location.lat = el.location.lat;
        location.lng = el.location.lng;

        locationList.push(location);
        filteredList.push(location);
        createMarker(location);
      });
    }).fail(function() {
      // TO DO: handle error
      console.log( 'An error ocurred' );
    });
  }

  // Knockout
  // Models
  var locations = {
    locationList: ko.observableArray([]),
    filteredList: ko.observableArray([]),
    get: function(){
      getFoursquareList(this.locationList, this.filteredList);
    },
    filter: function(filter){
      self = this;
      self.filteredList.removeAll();
      self.locationList().forEach(function(el){
        if(el.name.toLowerCase().indexOf(filter) > -1){
          self.filteredList.push(el);
        }
      });
    }
  };

  // View Model
  var ViewModel = function(){
    var self = this;
    self.locations = locations;
    self.filteredList = locations.filteredList;
    self.locations.get(); // makes the JSON call to get locations info
    self.query = ko.observable('');
    self.filterArray = function(){
      var filter = self.query().toLowerCase();
      self.locations.filter(filter);
    };
  };
  ko.applyBindings( new ViewModel());
});
