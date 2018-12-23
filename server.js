var port = process.env.PORT || 3000;	// define the port

require('dotenv').config();
const path = require('path');
const bodyParser = require('body-parser');
require('@gouch/to-title-case');	// required for toTitleCase() function

// require and intitalize express app
const express = require('express');
const app = express();

// set up body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// set up public folder
app.use(express.static('public'));

const gd = require('./geocode');    // require the geocode.js file

let apiKey = process.env.API_KEY;    // apikey for the weather app

// render the index.html file upon a request to the / route
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

// get data from form and process it to get the weather information
app.post('/', async (req, res) => {		// async function 
	var cityName = (req.body.city).toTitleCase();	// get city name

	// preventing html and script injections
	cityName = cityName.replace(/</g, "&lt;").replace(/>/g, "&gt;");

	var unit = req.body.unit;	//  get weather preferred unit is Fahrenheit or Celcius
	
	try {
		var result = await gd.fetchData(apiKey, cityName, unit === 'Fahrenheit');	// call geocode.fetchdata() function with the parameters
		
		// not using any templating engine so this is gonna be a bit long, manual way of doing things
		var output = "";	// initialize empty variable
		output += `<h5>Latitude: ${result.latitude}</h5>`;
		output += `<h5>Longitude: ${result.longitude}</h5>`;
		output += `<h5>Current Condition: ${result.weatherReport}</h5>`;

		// check for unit and change it appropriately
		if (unit === 'Fahrenheit') {
			output += `<h5>Average Temperature: ${result.temp} °F</h5>`;
			output += `<h5>Maximum Temperature ${result.maxTemp} °F</h5>`;
			output += `<h5>Minimum Temperature: ${result.minTemp} °F</h5>`;
		} else {
			output += `<h5>Average Temperature: ${result.temp} °C</h5>`;
			output += `<h5>Maximum Temperature ${result.maxTemp} °C</h5>`;
			output += `<h5>Minimum Temperature: ${result.minTemp} °C</h5>`;
		}

		output += `<h5>Humidity: ${result.humidity}%</h5>`;
		output += `<h5>Country: ${result.country}</h5>`;
	
		res.send(output);		// send the output
		res.end();				// end response
	} catch (error) {
		res.send(`<h2>"${cityName}" not found or weather api is down temporarily.</h2>`);		// catch any errors down the line and display error message
	}
});


app.all('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'error.html'));
});

app.listen(port, () => console.log(`Listening at port ${port}...`));	// listen at the specified port