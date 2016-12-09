'use strict';

// total number of locations to load from foursquare
var TOTAL_LOCATIONS = 12;

// setting up google maps
var map;
var mapcenter = {lat: 53.340, lng: -6.260};
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 17,
    center: mapcenter
  });
}



// main app
$(function(){

  // Animates a given marker and displays infowindow
  function markerAnim(marker){
    marker.infowindow.open(map, marker);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){marker.setAnimation(null);}, 1400);
  }

  // Creates a marker on the map for a given item
  function createMarker(item, markersList, wikiArticle, error){
    var marker = new google.maps.Marker({
      position: {lat: item.lat, lng: item.lng},
      map: map
    });

    // creating info window
    var contentString = '</div>'+
              '<h1 id="firstHeading" class="firstHeading">'+item.name+'</h1>'+
              '<div id="bodyContent">'+
              '<p>'+item.category+'</p>'+
              '<p><span>'+item.address+'</p>'+
              '<p><span>'+item.city+' </span>'+
              '<span>'+item.country+'</span></p>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 360
      });
      marker.infowindow = infowindow;
      marker.addListener('click', function() {
        markerAnim(marker);
        loadWikiFor(item, wikiArticle, error);
      });
      return marker;
  }

  // Sets the map on all markers in the markers array.
  function setMapOnAll(markers, map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the markers array.
  function clearMarkers(markers) {
    setMapOnAll(markers, null);
  }

  // Removes the given marker from the map.
  function clearMarker(marker) {
    marker.setMap(null);
  }

  // Sets the given marker in the map.
  function showMarker(marker){
    marker.setMap(map);
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
  function foursquareJsonUrl(id, secret, lat, lng, radius, limit){

    var url = 'https://api.foursquare.com/v2/venues/search?ll='+ lat+','+ lng+
          '&radius='+ radius+
          '&limit='+ limit+
          '&client_id='+ id+
          '&client_secret='+secret+
          '&v='+ getCurrDate();
    return url;
  }

  // Gets locations from foursquare using an ajax json call
  // and pushes them to the given lists
  // locationList serves as cache
  // filteredList serves as view model list
  function getFoursquareList(locations, callback, error){
    var ClientID = 'W3HFAQKBHHUMH5DHJNSXUR4RQFXLTVGVHJA4ODOMYWSZCJQT';
    var ClientSecret = 'RINKPCMKRQFYL0FR04SZJE5CMPWYT315DQDXRSCGOSQB4FKX';

    var locationList = locations.locationList;
    var filteredList = locations.filteredList;
    var foursquareUrl = foursquareJsonUrl(ClientID, ClientSecret,
                                          mapcenter.lat, mapcenter.lng,
                                          10000, TOTAL_LOCATIONS);
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
      });
      callback();
    }).fail(function() {
      error.show(true);
      error.message('There was a problem loading data from foursquare. ');
    });
  }

  // load wikipedia data for a given item (search by name)
  function loadWikiFor(item, wikiArticle, error){
    var query = item.name;
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='+
                  query + '&format=json&callback=wikiCallback';

    var wikiRequestTimeout = setTimeout(function(){
      error.show(true);
      error.message('There was a problem loading data from wikipedia. ');
    }, 8000);

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        jsonp: "callback",
        success: function( response ) {
            var titles = response[1];
            var articles = response[2];
            var urls = response[3];
            wikiArticle.update(titles, articles, urls);
            clearTimeout(wikiRequestTimeout);
        }
    });
  }

  // Knockout
  //
  // Models
  var locations = {
    locationList: ko.observableArray([]),
    filteredList: ko.observableArray([]),
    markersList: ko.observableArray([]),
    filter: function(filter){
      var self = this;
      self.filteredList.removeAll();
      // sets all markers not visible
      clearMarkers(this.markersList());
      for (var i = 0; i < self.locationList().length; i++) {
        var el = self.locationList()[i];
        if(el.name.toLowerCase().indexOf(filter) > -1){
          self.filteredList.push(el);
          showMarker(self.markersList()[i]);
        }
      }
    },
    activateMarker: function(el){
      var self = this;
      locations = self.locationList();
      var found = false;
      var itemIndex = -1;
      for (var i = 0; i < locations.length && !found; i++) {
        if(el.lat === locations[i].lat && el.lng === locations[i].lng){
          found = true;
          itemIndex = i;
        }
      }
      if (found){
        markerAnim(self.markersList()[itemIndex]);
      }
    }
  };

  var wikiArticle = {
    title: ko.observable(''),
    article: ko.observable(''),
    url: ko.observable(''),
    update: function(titles, articles, urls){
      // it shows the first item from the wikipedia results
      // or a message if a wikipedia article is not found
      if (titles.length > 0) {
        this.title(titles[0]);
        this.article(articles[0]);
        this.url(urls[0]);
      } else {
        this.title('Sorry!');
        this.article('Could not find information about this in item wikipedia!');
        this.url('');
      }
    },
    clear: function(){
        this.title('');
        this.article('');
        this.url('');
    }
  };

  var error = {
    show: ko.observable(false),
    message: ko.observable('')
  };

  // View Model
  var ViewModel = function(){
    var self = this;
    self.locations = locations;
    self.wikiArticle = wikiArticle;
    self.closedSearch = ko.observable(false);
    self.filteredList = locations.filteredList;
    self.error = error;

    // to be used as a callback after the foursquare data is loaded
    // creates google's map markers and sets click event
    self.createMarkers = function(){
      var markersList = self.locations.markersList;
      self.locations.locationList().forEach(function(location){
        var marker = createMarker(location,
                                  markersList,
                                  self.wikiArticle,
                                  self.error);
        markersList.push(marker);
      });
    };

    // makes the JSON call and fills in the locations
    getFoursquareList(self.locations, self.createMarkers, self.error);
    self.query = ko.observable('');
    self.filterArray = function(){
      var filter = self.query().toLowerCase();
      self.locations.filter(filter);
    };
    self.showMarker = function(){
      self.locations.activateMarker(this);
      loadWikiFor(this, self.wikiArticle, self.error);
    };
    self.hideWikiSection = function(){
      self.wikiArticle.clear();
    };
    self.closeSearch = function(){
      self.closedSearch(!self.closedSearch());
    };
    self.hideErrorWindow = function(){
      self.error.show(false);
    }
  };
  ko.applyBindings( new ViewModel());
});
