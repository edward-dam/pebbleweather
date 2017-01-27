// Author: Ed Dam

// pebblejs
require('pebblejs');

// clayjs
var Clay       = require('pebble-clay');
var clayConfig = require('./config');
var clay = new Clay(clayConfig);

// libraries
var UI       = require('pebblejs/ui');
var Vector2  = require('pebblejs/lib/vector2');
var ajax     = require('pebblejs/lib/ajax');
var Settings = require('pebblejs/settings');

// collect api data
var gpsLatitude;
var gpsLongitude;
var apiKeyDark = '6dc8bde763d1816f2e3f249ec11ee48f';
var apiKeyOpen = '42efb17b4ad3d4a52025106d13376d96';
//console.log('Saved darkapidata: ' + Settings.data('weatherdarkapi'));
//console.log('Saved openapidata: ' + Settings.data('weatheropenapi'));
collectgpslocation(function() {
  collecthourlyweatherdata();
  collectdailyweatherdata();
});

// definitions
var window = new UI.Window();
var windowSize = window.size();
var size = new Vector2(windowSize.x, windowSize.y);
var icon = 'images/menu_icon.png';
var backgroundColor = 'black';
var highlightBackgroundColor = 'white';
var textColor = 'white';
var highlightTextColor = 'black';
var textAlign = 'center';
var fontLarge = 'gothic-28-bold';
var fontMedium = 'gothic-24-bold';
var fontSmall = 'gothic-18-bold';
//var fontXSmall = 'gothic-14-bold';
function position(height){
  return new Vector2(0, windowSize.y / 2 + height);
}

// main screen
var mainWind = new UI.Window();
var mainText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
var mainImage = new UI.Image({size: size});
mainText.position(position(-65));
mainImage.position(position(-70));
mainText.font(fontLarge);
mainText.text('WEATHER');
mainImage.image('images/splash.png');
mainWind.add(mainText);
mainWind.add(mainImage);
mainWind.show();

// up screen
mainWind.on('click', 'up', function(e) {
  var upWind = new UI.Window();
  var upHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  var upText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  upHead.position(position(-35));
  upText.position(position(-5));
  upHead.font(fontLarge);
  upText.font(fontMedium);
  upHead.text('Dark Sky API');
  upText.text('www.darksky.net');
  upWind.add(upHead);
  upWind.add(upText);
  upWind.show();
});

// down screen
mainWind.on('click', 'down', function(e) {
  var downWind = new UI.Window();
  var downHead = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  var downText = new UI.Text({size: size, backgroundColor: backgroundColor, textAlign: textAlign});
  downHead.position(position(-30));
  downText.position(position(-5));
  downHead.font(fontMedium);
  downText.font(fontSmall);
  downHead.text('Weather v1.1');
  downText.text('by Edward Dam');
  downWind.add(downHead);
  downWind.add(downText);
  downWind.show();
});

// select button
mainWind.on('click', 'select', function(e) {

  // load collected api data
  var darkapidata = Settings.data('weatherdarkapi');
  var openapidata = Settings.data('weatheropenapi');
  //console.log('Loaded darkapidata: ' + darkapidata);
  //console.log('Loaded openapidata: ' + openapidata);
  
  // load options
  var options = JSON.parse(localStorage.getItem('clay-settings'));
  //console.log('Loaded temp_degrees option: ' + options.temp_degrees);
  
  // determine currently api data
  var currentData = darkapidata.currently;
  var currentSummary = currentData.summary;
  var currentTemperature = Math.round(currentData.apparentTemperature) + '°';
  if ( options !== null ) {
    if ( options.temp_degrees === "celsius" ) {
      currentTemperature = Math.round((currentData.apparentTemperature - 32) * 5 / 9) + '°';
    }
  }

  // determine hourly api data
  for (var i = 1; i < 25; i++) {
    var hourlyData = darkapidata.hourly.data[i];
    determinetime(hourlyData);
    determinetemp(hourlyData);
    determinesummary(hourlyData, "hourlySummary", i);
    //console.log('hourlyTime' + i + ': ' + window["hourlyTime" + i]);
    //console.log('hourlyTemp' + i + ': ' + window["hourlyTemp" + i]);
    //console.log('hourlySummary' + i + ': ' + window["hourlySummary" + i]);
  }
  
  // determine daily api data
  for (var j = 0; j < 8; j++) {
    var dailyData = openapidata.list[j];
    determineweekday(dailyData);
    determinetempmin(dailyData);
    determinetempmax(dailyData);
    determinesummary(dailyData, "dailySummary", j);
    //console.log('dailyWeekday' + j + ': ' + window["dailyWeekday" + j]);
    //console.log('dailyTempMin' + j + ': ' + window["dailyTempMin" + j]);
    //console.log('dailyTempMax' + j + ': ' + window["dailyTempMax" + j]);
    //console.log('dailySummary' + j + ': ' + window["dailySummary" + j]);
  }

  // display screen
  var weatherMenu = new UI.Menu({ //fullscreen: true,
    textColor: textColor, highlightBackgroundColor: highlightBackgroundColor,
    backgroundColor: backgroundColor, highlightTextColor: highlightTextColor,
    status: { separator: 'none', color: textColor, backgroundColor: backgroundColor }
  });
  weatherMenu.section(0, { title: "Today's Weather" });
  weatherMenu.item(0, 0, { icon: icon,
    title: window.dailySummary1,
    subtitle: 'Max: ' + window.dailyTempMax1 + ' Min: ' + window.dailyTempMin1
  });
  weatherMenu.section(1, { title: "7 Day Forecast" });
  for (j = 1; j < 8; j++) {
    weatherMenu.item(1, j-1, { icon: icon,
      title: window["dailyWeekday" + j], 
      subtitle: window["dailyTempMax" + j] + '/' + window["dailyTempMin" + j] + ' ' + window["dailySummary" + j]
    });
  }
  weatherMenu.show();
  mainWind.hide();

  // display hourly screen
  weatherMenu.on('select', function(e) {
    if (e.sectionIndex === 0) {
      var hourlyMenu = new UI.Menu({ //fullscreen: true,
        textColor: textColor, highlightBackgroundColor: highlightBackgroundColor,
        backgroundColor: backgroundColor, highlightTextColor: highlightTextColor,
        status: { separator: 'none', color: textColor, backgroundColor: backgroundColor }
      });
      hourlyMenu.section(0, { title: "Today's Weather" });
      hourlyMenu.item(0, 0, { icon: icon,
        title: 'Now', subtitle: currentTemperature + " " + currentSummary
      });
      for (i = 1; i < 25; i++) {
        hourlyMenu.item(0, i, { icon: icon,
          title: window["hourlyTime" + i],
          subtitle: window["hourlyTemp" + i] + " " + window["hourlySummary" + i]
        });
      }
      hourlyMenu.show();
    }
  });

  // function determine time
  function determinetime(data) {
    var time = new Date(data.time*1000);
    var hour = time.getHours();
    var minutes = time.getMinutes();
    hour = hour > 9 ? hour : '0' + hour;
    minutes = minutes > 9 ? minutes : '0' + minutes;
    window["hourlyTime" + i] = hour + ":" + minutes;
  }
  
  // function determine weekday
  function determineweekday(data) {
    var time = new Date(data.dt*1000);
    var daynames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var weekday = daynames[time.getDay()];
    window["dailyWeekday" + j] = weekday;
  }
  
  // function determine temp
  function determinetemp(data) {
    var temperature = Math.round(data.temperature) + '°';
    if ( options !== null ) {
      if ( options.temp_degrees === "celsius" ) {
        temperature = Math.round((data.temperature - 32) * 5 / 9) + '°';
      }
    }
    window["hourlyTemp" + i] = temperature;
  }
  
  // function determine temp min
  function determinetempmin(data) {
    var temperature = Math.round((data.temp.min - 273.15) * 9 / 5 + 32) + '°';
    if ( options !== null ) {
      if ( options.temp_degrees === "celsius" ) {
        temperature = Math.round(data.temp.min - 273.15) + '°';
      }
    }
    window["dailyTempMin" + j] = temperature;
  }
  
  // function determine temp max
  function determinetempmax(data) {
    var temperature = Math.round((data.temp.max - 273.15) * 9 / 5 + 32) + '°';
    if ( options !== null ) {
      if ( options.temp_degrees === "celsius" ) {
        temperature = Math.round(data.temp.max - 273.15) + '°';
      }
    }
    window["dailyTempMax" + j] = temperature;
  }

  // function determine summary
  function determinesummary(data, variable, index) {
    var summary;
    if ( variable === "hourlySummary" ) {
      summary = data.summary;
    } else {
      summary = data.weather[0].main;
    }
    window[variable + index] = summary;
  }

});

// functions

function collectgpslocation(callback) {
  navigator.geolocation.getCurrentPosition(function(api) {
    //console.log('Collected gpsLocation: ' + api.coords);
    gpsLatitude = api.coords.latitude;
    gpsLongitude = api.coords.longitude;
    //console.log('Latitude gpsLocation: ' + gpsLatitude);
    //console.log('Longitude gpsLocation: ' + gpsLongitude);
    callback();
  });
}

function collecthourlyweatherdata() {
  var url = 'https://api.darksky.net/forecast/' + apiKeyDark + '/' +
  gpsLatitude + ',' + gpsLongitude + '?exclude=[minutely,alerts,flags]';
  //console.log('url: ' + url);
  ajax({ url: url, method: 'get', type: 'json' },
    function(api){
      //console.log('Collected apidata: ' + api);
      Settings.data('weatherdarkapi', api);
    }
  );
}

function collectdailyweatherdata() {
  var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?lat=' +
  gpsLatitude + '&lon=' + gpsLongitude + '&appid=' + apiKeyOpen + '&cnt=8';
  //console.log('url: ' + url);
  ajax({ url: url, method: 'get', type: 'json' },
    function(api){
      //console.log('Collected apidata: ' + api);
      Settings.data('weatheropenapi', api);
    }
  );
}
