const fetch = require('node-fetch');
require('@gouch/to-title-case');

function convertToCelcius(kelvin) {
	/* 
		Helper function to convert obtained Kelvin temperature to degree celcius
	*/
	return (kelvin - 273.15).toFixed(2);
}


function convertToFahrenheit(kelvin) {
	/* 
		Helper function to convert obtained Kelvin temperature to degree Fahrenheit
	*/
	var celcius = convertToCelcius(kelvin);

	return ((9 * celcius / 5) + 32).toFixed(2);

}

async function fetchData(apiKey, city, fahrenheit) {
	let apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;	// construct the url with the passed in parameters

	// initialize empty variables to be used later
	var weatherReport, 
		latitude, 
		longitude,
		temp, 
		minTemp, 
		maxTemp, 
		humidity,
		countryCode,
		country;

	city = city.toTitleCase();

	let result = await fetch(apiUrl);	// fetch data from the api using fetch function of node-fetch module
	
	if(result.status === 200) {			// check the status code
		let jsonObj = await result.json();	// convert the response to JSON object

		// start segragating pieces of data from prior observations of api data model
		latitude = jsonObj.coord.lat;
		longitude = jsonObj.coord.lon;
        weatherReport = (jsonObj.weather[0].description).toTitleCase();
		
		// check unit and call appropriate unit conversion functions
        if(fahrenheit) {
            temp = convertToFahrenheit(jsonObj.main.temp);
		    minTemp = convertToFahrenheit(jsonObj.main.temp_min);
		    maxTemp = convertToFahrenheit(jsonObj.main.temp_max);
        } else {
            temp = convertToCelcius(jsonObj.main.temp);
		    minTemp = convertToCelcius(jsonObj.main.temp_min);
		    maxTemp = convertToCelcius(jsonObj.main.temp_max);
        }

		humidity = jsonObj.main.humidity;
		countryCode = jsonObj.sys.country;	// needed for fetching the country name

		// prepare for fetching the country name from another api
		let countryUrl = `https://restcountries.eu/rest/v2/alpha/${countryCode}`;	//construct the url
		let countryResponse = await fetch(countryUrl);	// fetch the data	

		if(countryResponse.status === 200) {	// check status of response
			let jsonCountry = await countryResponse.json();	// convert to JSON object
			country = jsonCountry.name;		// segregate country name

			// return an object consisting of the necessary information on weather and location
			return {
				latitude,
				longitude,
				weatherReport,
				temp,
				minTemp,
				maxTemp,
				humidity,
				country
			};
		}
	}

	throw new Error(result.status);		// throw error if the process is incomplete
}

// export the fetchData() function
module.exports = {
    fetchData
};