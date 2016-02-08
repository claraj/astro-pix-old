var request = require('request');
var moment = require('moment');

var baseURL = 'https://api.nasa.gov/planetary/apod' ;

var apodJSON;
var apodError = false;

var APIKEY = process.env.APOD_API_KEY;

function getJSON() {
  return apodJSON;
}

function getError(){
  return apodError;
}


function apodRequest(random, callback) {

  var queryParam = { 'api_key' : APIKEY };

  if (random) {
    queryParam.date = randomDateString();
  }

  request({uri :baseURL, qs: queryParam} , function(error, request, body){
    apodJSONReply(error, request, body, callback);
  });

}


function apodJSONReply(error, response, body, callback){

  if (!error && response.statusCode == 200){
    apodJSON = JSON.parse(body);
    addCustomAttributes();
    console.log("Have JSON" + JSON.stringify(apodJSON));
    apodError = false;
  }

  else {
    //Log error info, set apodError flag to true
    console.log("Error in JSON request: ")
    console.log(error);
    console.log(response);
    console.log(body);
    apodError = true;
  }

  callback();

}



//Add some custom attributes, for example image
//credit, and create a URL to NASA's site for
//the page on this image.

function addCustomAttributes(){

  //APOD includes a copyright attribute, but only if the image is under copyright.
  //Add a parameter for copyright or image credit, depending if there is a copyright holder
  //NASA's images are in the public domain so no copyright, so provide an image credit.
  if (apodJSON.hasOwnProperty("copyright")) {
    apodJSON.credit = "Image credit and copyright: " + apodJSON.copyright;
  } else {
    apodJSON.credit = "Image credit: NASA";
  }

  //Create the NASA link to the image's page
  //The url provided is just for the image
  //Would like to provide a link in the form
  //   http://apod.nasa.gov/apod/ap160208.html
  //Which is a page about the image.

  var baseURL = "http://apod.nasa.gov/apod/";

  var imgDate = moment(apodJSON.date);
  var filenameDate = imgDate.format("YYMMDD");
  var filename = "ap" + filenameDate + ".html";
  var url = baseURL + filename;
  apodJSON.apodurl = url;

  console.log("Custom" + JSON.stringify(apodJSON));  //for debugging

}

//APOD started on June 16th, 1995. Select a random date between
//then and today.  Convert to a string in YYYY-MM-DD format.
function randomDateString(){

  //Create data objects for today and start date
  var today = moment();
  var APODstart = moment('1995-06-16');

  //Convert to Unix time - milliseconds since Jan 1, 1970
  var todayUnix = today.valueOf();
  var APODstartUnix = APODstart.valueOf();

  //How many milliseconds between APOD start and now?
  var delta = todayUnix - APODstartUnix;

  //Generate a random number between 0 and (number of milliseconds between APOD start and now)
  var offset = Math.floor((Math.random() * delta));
  //And random number to APOD start
  var randomUnix = APODstartUnix + offset;

  //And then turn this number of seconds back into a date
  var randomDate = moment(randomUnix);

  //And format this date as "YYYY-MM-DD", the format required in the
  //APOD API calls.
  var stringRandomDate = randomDate.format('YYYY-MM-DD')

  return stringRandomDate;
}


//Make these functions available to other parts of the code.
module.exports.apodRequest = apodRequest;
module.exports.apodJSON = getJSON;
module.exports.apodError = getError;
