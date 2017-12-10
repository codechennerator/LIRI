const apiKeys = require('./key.js');
const Twit = require('twit');
const Spotify = require('node-spotify-api');
const fetch = require('node-fetch');
const fs = require('fs');

//Input keys
const T = new Twit(apiKeys.twitterKeys);
const S = new Spotify(apiKeys.spotifyKeys);


//Functions
/**----------------------------Twitter---------------------------------*/
function printTweets(data){
  console.log("===========================================================");
  for(let i =0; i< data.length; i++){
    console.log("Tweet #" + i + ": " + data[i].text);    
  }
  console.log("===========================================================");
}
function getTweets(){
  T.get('statuses/user_timeline', { screen_name: "realDonaldTrump", count: 20 }, function(err, data, response) {
    if (err) {
      return console.log('Error occurred: ' + err);
    }else{
      printTweets(data);
    }
  });
}

/*------------------------------Spotify--------------------------------*/
function printTrackInfo(data){
  console.log("===========================================================");
  //Artist
  for (let i = 0; i<data.tracks.items[0].artists.length; i++){
    console.log("Artist: " + data.tracks.items[0].artists[i].name);
  }
  //Song Name
  console.log("Song Name: " + data.tracks.items[0].name);
  //A preview of the link
  console.log("Preview: " + data.tracks.items[0].external_urls.spotify);
  
  console.log("Album Name: " + (data.tracks.items[0].album.name));
  console.log("===========================================================");
}
function getTrackInfo(commandRequest){
  S.search({ type: 'track', query: commandRequest }, function(err, data) {
      if (err) {
        return console.log('Error occurred: ' + err);
      }  
      if (data.tracks.total == 0){ //If the search results bring up nothing, go back again and input The sign. 
        S.search({type: 'track', query: "The Sign Ace of Base" }, function(err, data2){
          if (err) {
            return console.log('Error occurred: ' + err);
          }else{
            console.log("We couldn't find your track, here's Ace of Base instead.");
            printTrackInfo(data2);
          }
        });
      }else{
        printTrackInfo(data);
      }
  });
}

/*------------------------------OMDB--------------------------------*/
function printMovieData(data){
  console.log(
    "===========================================================" + "\n" +
    "Title: " + data.Title + '\n' + 
    "Year: " + data.Year + '\n' + 
    "IMDB Rating: " + data.Ratings[0].Value + '\n' + 
    "Rotten Tomato Rating: " + data.Ratings[1].Value + '\n' + 
    "Country of Production: " + data.Country + '\n' + 
    "Language: " + data.Language + '\n' + 
    "Plot: " + data.Plot + '\n' + 
    "Actors: " + data.Actors + '\n' +
    "==========================================================="
  );
}
function getMovieData(commandRequest){
  let queryURL = "https://www.omdbapi.com/?t=" + commandRequest + "&y=&plot=short&apikey=" + apiKeys.omdbKey;
  fetch(queryURL).then(
    response => response.json().then ( json => {
      printMovieData(json);
    })
    .catch(error => {
       console.log(error);
    }) 
  );
}
/*------------------------------do-what-it-says (command)--------------------------------*/
function printFile(data){
  let dataArr = data.split(',');
  run(dataArr[0], dataArr[1]);
}
function getFileData(){
  fs.readFile("random.txt", "utf8", function(err,data){
    if (err){
      return console.log('Error occured' + err)
    }else{
      printFile(data);
    }
  });
}
/*------------------------------Directory--------------------------------*/
function run(commandLine, commandRequest){
  if(commandLine === 'my-tweets'){
    console.log('The creator of this app does not tweet much.');
    console.log('Try using the command "trump-tweets"');
  }
  else if(commandLine === "trump-tweets"){
    getTweets();
  }else if(commandLine === "spotify-this-song"){
    getTrackInfo(commandRequest); 
  }else if(commandLine === "movie-this"){
    getMovieData(commandRequest);
  }else if(commandLine === "do-what-it-says"){
    getFileData();
  }
}
/*------------------------------Inputs--------------------------------*/
function getInputs(){
  //Get Inputs
  let commandLine = process.argv[2];
  let commandRequest =  '';
  //Parse the other arguments into one string.
  for (let i = 3; i<process.argv.length; i++){
    commandRequest += process.argv[i];
    if (i != process.argv.length -1){
      commandRequest += ' '
    }
  }
  run(commandLine, commandRequest);
}
getInputs();