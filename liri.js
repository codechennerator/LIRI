const apiKeys = require('./key.js');
const Twit = require('twit');
const Spotify = require('node-spotify-api');
const fetch = require('node-fetch');
const fs = require('fs');
const inquirer = require('inquirer');

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
  askForContinuation();
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
  let artists = [];
  for (let i = 0; i<data.tracks.items[0].artists.length; i++){
    artists.push(data.tracks.items[0].artists[i].name);
  }
  console.log("Artists: " + artists.join(', '));
  //Song Name
  console.log("Song Name: " + data.tracks.items[0].name);
  //A preview of the link
  console.log("Preview: " + data.tracks.items[0].external_urls.spotify);
  
  console.log("Album Name: " + (data.tracks.items[0].album.name));
  console.log("===========================================================");
  askForContinuation();
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
  askForContinuation();
}
function getMovieData(commandRequest){
  let queryURL = "https://www.omdbapi.com/?t=" + commandRequest + "&y=&plot=short&apikey=" + apiKeys.omdbKey;
  fetch(queryURL).then(
    response => response.json().then ( json => {
      printMovieData(json);
    })
    .catch(error => {
       console.log("We encoutered an error, here's info for Mr. Nobody instead.")
       let queryURL2 = "https://www.omdbapi.com/?t=Mr+Nobody" + "&y=&plot=short&apikey=" + apiKeys.omdbKey;
       fetch(queryURL2).then(
        response => response.json().then ( json2 => {
          printMovieData(json2);
        })
        .catch(error2 => {
           console.log(error2);           
        })
      ); 
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
  }else{
    console.log("Invalid command line. Please don't break me.");
  }
}
/*------------------------------Inputs--------------------------------
//Uncomment this code to make it work like the assignment wanted to!
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
*/

/** *------------------------------Inquirer--------------------------------*/
function askForContinuation(){
  inquirer.prompt([
    {
      type: "confirm",
      message: "Continue?",
      name: "continue",
      default: false
    }
  ]).then(answers => {
    if(answers.continue){
      askInput();
    }else{
      console.log("Goodbye!");
    }
  });
}
function getCommandLine(commandLine){
  inquirer
    .prompt([
      {
        type: "input",
        message: "What would you like to tell " + commandLine + " to look for?",
        name: "commandRequest"
      },
    ]).then(answers =>{
      switch (commandLine){
        case "spotify-this-song":
          getTrackInfo(answers.commandRequest);
          break;
        case "movie-this":
          getMovieData(answers.commandRequest);
         break;
      }
    });
}
function askInput(){
  inquirer
    .prompt([
      {
        type: "list",
        message: "Choose a function",
        choices: [
          "trump-tweets",
          "spotify-this-song",
          "movie-this",
          "do-what-it-says"
        ],
        name: "commandLine"

      },
    ]).then(answers => {
      switch(answers.commandLine){
        case "trump-tweets":
          getTweets();
          break;
        case "spotify-this-song":
          getCommandLine(answers.commandLine);
          break;
        case "movie-this":
          getCommandLine(answers.commandLine);
          break;
        case "do-what-it-says":
          getFileData();
          break;
      }
    });
  }
askInput();
