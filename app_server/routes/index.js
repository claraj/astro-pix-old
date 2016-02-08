var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var apod = require('../controllers/apod');


/* GET home page. */
router.get('/', homepage);

function homepage(req, res) {
  res.render('index', { title: 'ASTROPIX' });
}

//MUST have a body-parser to get POST data.
//(Unlike GET requests, which can be extracted from body.query)
parser = bodyParser.json();


router.post('/fetch_picture', parser, function fetch_picture(req, res) {

  var today = "today_picture";
  var random = "random_picture";    //Button attributes. Which button was clicked?

  if (req.body[today] ) {
    apod.apodRequest(false, function() {
      provideResponse(res);
    });
  }

  else if (req.body[random]) {
    apod.apodRequest(true, function() {
      provideResponse(res);
    });
  }

  else {
    res.status(404).send("Unknown option");  //TODO better error message.
  }

});


function provideResponse(res){

  var apodJSON = apod.apodJSON();
  var apodError = apod.apodError();

  console.log("The JSON: " + JSON.stringify(apodJSON));
  console.log("Error?: " + apod.error);

  if (apodError) {
    res.render('apodError');
  }

  else {
    res.render('image', apodJSON);
  }
}



module.exports = router;
