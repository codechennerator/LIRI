var twitKeys = require('./key.js');
var Twit = require('twit');
var T = new Twit(twitKeys);
var commandLine = process.argv[2];

var count = 0;
if(commandLine === "trump-tweets"){
  // T.get('users/search', { q: '@realDonaldTrump', count: 20 }, function(err, data, response) {
  T.get('statuses/user_timeline', { screen_name: "realDonaldTrump", count: 20 }, function(err, data, response) {
    for(let i =0; i< data.length; i++){
          console.log("Tweet #" + i + ": " + data[i].text);
    }
  });
}else if(commandLine === "spotify-this-song"){

}else if(commandLine === "movie-this"){
  
}else if(commandLine === "do-what-it-says"){
  
}