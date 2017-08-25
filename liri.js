/* Process these commands:
	my-tweets
		-- show your last 20 tweets and when they were created at in your terminal/bash window.
	spotify-this-song
		-- show the following info about song in your terminal/bash window
			Artist(s), song's name, preview link of the song from Spotify, album that the song is from
		-- If no song, then your program will default to "The Sign" by Ace of Base.
	movie-this
		-- * Title of the movie.
		   * Year the movie came out.
		   * IMDB Rating of the movie.
		   * Rotten Tomatoes Rating of the movie.
		   * Country where the movie was produced.
		   * Language of the movie.
		   * Plot of the movie.
		   * Actors in the movie.
		-- title, year, imdb rating, rotten tomatoes rating, country produced, language, plot, actors
	do-what-it-says
		-- use command from random.txt file
*/
// include packages
var fs = require('fs');
var Spotify = require("node-spotify-api");
var request = require("request");
var Twitter = require("twitter");

// include other js files
var keys = require("./keys.js");
// var text = fs.readFileSync("./random.txt");//require("./random.txt");
var text = fs.readFileSync('random.txt', 'utf8', function (err,data) {text = data.trim();});
// console.log(text);
var log = fs.readFileSync('log.txt', 'utf8', function (err,data) {log = data.trim();});

// Take in the command line arguments
var nodeArgs = process.argv;
var command = nodeArgs[2];
var input = "";

// create argument string, starting with 4th element
for (var i = 3; i < nodeArgs.length; i++) {
	input += ", " + nodeArgs[i];
}

commandLiri(command);

function commandLiri(operator) {
	//  || operator === "do-what-it-says"
	if (operator === "do-what-it-says") {
		var random = text.split(",");
		command = random[0].trim();
		input = random[1].trim();
		return commandLiri(command);
	}
	switch (operator) {
		case "my-tweets":
			// console.log("twitter not connected yet");
			callTwitter();
			break;
		case "spotify-this-song":
			callSpotify(input);
			break;
		case "movie-this":
			callMovie();
			break;
		default:
			console.log("That command doesn't exist. Try the following instead:\n'my-tweets', 'spotify-this-song', 'movie-this', 'do-what-it-says'");
			break;
	}
}

function callSpotify(queryString) {
	// random song query:
	// spotify-this-song,"The Sign"
	var spotify = new Spotify({
		id: keys.spotifyKeys.client_ID,
		secret: keys.spotifyKeys.client_secret,
	});

	spotify.search({ type: 'track', query: queryString, limit: 1 }, function(err, data) {
	  if (err) {
	    return console.log('Error occurred: ' + err);
	  }
	  	var song = data.tracks.items[0];
		// console.log( data.tracks.items );
		var artists = song.artists[0].name;
		for (var i = 1; i < song.artists.length; i++) {
			artists += ", " + song.artists[i].name;
		}
		var output = "\n\n";
		output += "\n" + "--- SONG INFO ---";
		output += "\n" + "Artist: " + artists;
		output += "\n" + "Name: " + song.name;
		output += "\n" + "Preview url: " + song.preview_url;
		output += "\n" + "Album: " + song.album.name;
		output += "\n\n";
		console.log(output);
		addLogEntry(output);
		// Artist(s), song's name, preview link of the song from Spotify, album that the song is from
	});
}

function callTwitter() {
	// random tweets query
	// my-tweets
	var client = new Twitter({
		consumer_key: keys.twitterKeys.consumer_key,
		consumer_secret: keys.twitterKeys.consumer_secret,
		access_token_key: keys.twitterKeys.access_token_key,
		access_token_secret: keys.twitterKeys.access_token_secret,
	});

	client.get('statuses/user_timeline', function(err, tweets, response) {
		if (err) {
			return console.log(err);
		}
		var output = "\n\n";
		output += "\n--- TWEETS ---";
		for (tweet of tweets) {
			output += "\n" + tweet.created_at;
			output += "\n" + tweet.text;
			output += "\n--------";
		}
		output += "\n\n";
		console.log(output);
		addLogEntry(output);
	});
}

function callMovie() {
	// random movie query
	// movie-this,10 Things I Hate About You
	// replace spaces with plus signs in movie name
	var movieName = input.trim().split(" ").join("+");
	var empty = false;
	if (!movieName) {
		movieName = "Mr+Nobody";
		empty = true;
	}

	// Then run a request to the OMDB API with the movie specified
	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=" + keys.OMDBKeys.api_key;

	request(queryUrl, function (error, response, body) {
		if (error) {
			return console.log(error);
		}
		var movie = JSON.parse(body);
		var output = "\n\n";
		if (empty) {
			output += "\nIf you haven't watched 'Mr. Nobody,' then you should.\nIt's on Netflix!\n";
		}
		output += "\n--- MOVIE INFO ---";
		output += "\nTitle: " + movie.Title;
		output += "\nPlot: " + movie.Plot;
		output += "\nRelease year: " + movie.Year;
		output += "\nIMDB rating: " + movie.imdbRating;
		// find rt rating from ratings list
		rtIndex = movie.Ratings.indexOf('Rotten Tomatoes');
		for (var rating of movie.Ratings) {
			if (rating.Source === 'Rotten Tomatoes') {
				output += "\nRotten Tomatoes rating: " + rating.Value;
				break;
			}
		}
		output += "\nProduced in: " + movie.Country;
		output += "\nLanguage: " + movie.Language;
		output += "\nLead actors include: " + movie.Actors;
		output += "\n\n";
		console.log(output);
		addLogEntry(output);
		// title, year, imdb rating, rotten tomatoes rating, country produced, language, plot, actors
	});
}

function addLogEntry(output) {
	var formatInput  = command.trim().replace(/,/g, "");
	formatInput += input.trim().replace(/,/g, "");
	// write
	fs.appendFile('log.txt',
		"COMMAND: " + formatInput + "\nRETURNS:" + output + "---***---***---***---\n\n",
		'utf8',
		function (err) {
		if (err) return console.log(err);
	});
}
