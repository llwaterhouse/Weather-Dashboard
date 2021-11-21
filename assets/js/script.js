
var formEl = $('#city-form'); // form that contains city input and button
var cityInputEl = $('#city-input'); // name of city that is entered
var savedCitiesEl = $('#saved-cities'); // element with saved buttons
var cityWeatherEl = $('#city-weather'); // top box displaying current weather
var cityDateHdr = $('#city-date'); // header in top box including city
var cityWthrEl = $('#city-weather-text'); // block with weather conditions
const lowUVI = 4; // maximum low risk from UV Index
const modUVI = 8; // maximum moderate risk from UV Index
var apiKey = '&appid=f3e4e1fc64808ebfa5c1347325b4ff4b'; //OpenWeather API key
var savedCitiesArray; 

// displayModal displays  a string to the user by a Bootstrap modal
function displayModal(displayText) {
	console.log("displayModal");
	$('#weather-modal').find('.modal-title').text('Note:');
	$('#weather-modal').find('.modal-body').text(displayText);
	$('#weather-modal').modal('show');
}


// reads and creates buttons from local storage
var init = function() {
	// read local storage and create button for each city
	// add event handler to each one
	// displayModal("Good morning, Linda!");
	savedCitiesArray = JSON.parse(localStorage.getItem("weather-cities"));

	// // if there are saved cities already, create buttons, otherwise initialize storage
	if (savedCitiesArray !== null) {
		for (var i=0; i< savedCitiesArray.length; i++) {
			createCityButton(savedCitiesArray[i]);
		}
	}
	else {
		savedCitiesArray = [];
	}
};

// read and display the temperature, wind speed, humidity and UV Index.  Color code the UV Index green if acceptable, orange/yellow if moderate and red if dangerous.
var displayTempWindHumUV = function(data) {
	// remove old info in top weather box
	console.log("in dtwhu");
	$('#city-weather-text').children().each(function() {
		this.html = '';
	});

	$('#temp').html('<b>Temp: </b>' + data.current.temp + '\xB0F');
	$('#wind').html('<b>Wind: </b>' + data.current.wind_speed + ' mph');
	$('#humidity').html('<b>Humidity: </b>' + data.current.humidity + '%');

	// wrap color background according to UV Index
	$('#uv').html('<b>UV Index: </b>');
	$('#uv').removeClass('badge-success badge-warning badge-danger');


	// if UV is less than lowUVI range, set badge color to low (=success)
	if (data.current.uvi < lowUVI) {
		$('#uv').append("<span class='badge badge-success'>   " + data.current.uvi + '   </span>');
	} else if (data.current.uvi < modUVI) {
		//moderate UV level
		$('#uv').append("<span class='badge badge-warning'>" + data.current.uvi + '</span>');
	} else {
		$('#uv').append("<span class='badge badge-danger'>" + data.current.uvi + '</span>');
	}
};
// Fetch data with uvi and fill in temp, humidity and wind in top section
var fetchTopConditions = function(data) {
	var cityLatLonURL =
		'https://api.openweathermap.org/data/2.5/onecall?lat=' +
		data.city.coord.lat +
		'&lon=' +
		data.city.coord.lon +
		apiKey +
		'&units=imperial';
	var firstData = data;
	// Need to get another API result to get uvi index

	fetch(cityLatLonURL)
		.then(function(response) {
			if (response.ok) {
				response.json().then(function(data) {
					console.log(JSON.stringify(data));

					// display weather for current day
					displayTempWindHumUV(data);

					// Fill in 5 day forecast
					display5DayForecast(data);
				});
			} else {
				displayModal('Error: City ' + response.statusText);
			}
		})
		.catch(function(error) {
			displayModal('Unable to connect to ');
		});
};

// Fills out forecast blocks for next 5 days
var display5DayForecast = function(data) {
	// fill in each day's forecast.  Today is at location 0, start after that, but forecast blocks start at 0
	for (var i = 1; i < 6; i++) {
    
		var dateToDisplay = moment.unix(data.daily[i].dt);

		console.log('5Day: ', dateToDisplay.format('MM/DD/YY'));
    var whichDayBlock = "#day" + i;
    var curCondition = $(whichDayBlock + " > .forecast-data"); // 
    curCondition.text(dateToDisplay.format('MM/DD/YY'));
    

		var whichIcon = data.daily[i].weather.icon;
		var iconURL = 'http://openweathermap.org/img/wn/' + whichIcon + '@2x.png';
		// $('#todayIcon').attr('src', iconURL);
		// $('#todayIcon').attr('height', '48');
		// $('#todayIcon').attr('width', '48');
	}
};

// Fills in top weather header
var displayTopWeatherHeader = function(data) {
	var dateToday = moment().format(' (MM/D/YYYY)');
	var headerStr = data.city.name;
	headerStr += dateToday;
	console.log(headerStr);
	$('#city-date').text(headerStr);
	$('#city-date').css("font-weight", "Bold");	
	var whichIcon = data.list[0].weather[0].icon;
	var iconURL = 'http://openweathermap.org/img/wn/' + whichIcon + '@2x.png';
	$('#todayIcon').attr('src', iconURL);
	$('#todayIcon').attr('height', '48');
	$('#todayIcon').attr('width', '48');
};

// displays current day's weather and 5 day forecast
var displayWeatherAndForecast = function(data) {
	// Fill in top box header for today's weather
	displayTopWeatherHeader(data);
	// Fill in other weather conditions
	fetchTopConditions(data);
};

// fetchCityForecast takes a cityName string as a parameter.  Looks for the weather getting lat/lon"g back for a call to the next API. Fills out top weather box as well as 5 day forecast.
var fetchCityForecast = function(cityName) {
	var cityURL = 'https://api.openweathermap.org/data/2.5/forecast?q=' + cityName + apiKey;
	// api.openweathermap.org/data/2.5/forecast?q=Boston&appid=f3e4e1fc64808ebfa5c1347325b4ff4b

	fetch(cityURL)
		.then(function(response) {
			if (response.ok) {
				response.json().then(function(data) {
					console.log(JSON.stringify(data));

					// remove old info top weather box

					// while (breedDisplayEl.firstChild) {
					//   breedDisplayEl.removeChild(breedDisplayEl.firstChild);
					// }
					// display weather for current day and 5 day forecast
					displayWeatherAndForecast(data);
				});
			} else {
				displayModal('Error: City ' + response.statusText);
			}
		})
		.catch(function(error) {
			displayModal('Unable to connect to ');
		});
};

var saveCity = function(cityName) {
	if (cityName != "") {
		// add cityname to array 
		savedCitiesArray.push(cityName);

		localStorage.setItem("weather-cities", JSON.stringify(savedCitiesArray));
	}
	console.log ("SaveCity: ", savedCitiesArray);
};
function fillCity(event) {
	var targetCity = event.target.textContent;
	console.log("tgtCty: ", targetCity);

	fetchCityForecast(targetCity);

}
var createCityButton = function(cityInput) {
		// create button element with cityName
	
		// var button = $("<button>");
		// button.text = cityInput;
		// button.addClass("custom-btn2 btn mb-2");
		// savedCitiesEl.append(button);
		// console.log(JSON.stringify(savedCitiesEl));
	//  button.on("click", fillCity);

		var button = document.createElement('button');
		button.type = 'button';
		button.innerHTML = cityInput;
		button.classList.add('custom-btn2');
		button.classList.add('btn');
		button.classList.add('mb-2');
		savedCitiesEl.append(button);
		
		// add eventListener
		button.addEventListener("click", fillCity);


};

var handleFormSubmit = function(event) {
	event.preventDefault();

	var cityName = cityInputEl.val();
	console.log('clicked Get ForecastBtn', cityName);
	if (!cityName) {
		displayModal('Please enter a city!');
		return;
	}
	// find today's forecast for this city
	fetchCityForecast(cityName);
	// create button with city and save to local storage
	createCityButton(cityName);
	saveCity(cityName);

	// reset form
	cityInputEl.val('');
};
// Let's get things rolling!
init();
formEl.on('submit', handleFormSubmit);



