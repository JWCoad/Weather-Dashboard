// DOM manipulation 
var searchBarHistory = $('#search-history-list');
var searchBarCity = $("#search-city");
var searchBarbutton = $("#search-city-button");
var searchHistoryClear = $("#clear-history");

var currentCity = $("#current-city");
var tempActual = $("#current-temp");
var humidityActual = $("#current-humidity");
var windSpeedActual = $("#current-wind-speed");
var uvindexActual = $("#uv-index");

var weatherActual = $("#weather-content");

// Define API key
var APIkey = "c9bbff2971111e1835f9aeb903bd8d53";

// Easy access to data
var cityResult = [];

// Display searched date and time
var currentDate = moment().format('L');
$("#current-date").text("(" + currentDate + ")");

// Load search history
loadHistory();
loadClear();

// Adds searched term 
$(document).on("submit", function () {
    event.preventDefault();
    var searchString = searchBarCity.val().trim();

    weatherActualRequest(searchString)
    searchHistory(searchString);
    searchBarCity.val("");
});

// Updates search history
searchBarbutton.on("click", function (event) {
    event.preventDefault();
    var searchString = searchBarCity.val().trim();
    weatherActualRequest(searchString)
    searchHistory(searchString);
    searchBarCity.val("");
});

// clears history and array
searchHistoryClear.on("click", function () {

    cityResult = [];
    previousSearch();
    $(this).addClass("hide");
});

// Load item from history
searchBarHistory.on("click", "li.city-btn", function (event) {
    var value = $(this).data("value");
    weatherActualRequest(value);
    searchHistory(value);

});



// Requests actual weather condtions
function weatherActualRequest(searchString) {


    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchString + "&units=metric&appid=" + APIkey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        currentCity.text(response.name);
        currentCity.append("<small class='text-muted' id='current-date'>");
        $("#current-date").text("(" + currentDate + ")");
        currentCity.append("<img src='https://openweathermap.org/img/w/" + response.weather[0].icon + ".png' alt='" + response.weather[0].main + "' />")
        tempActual.text(response.main.temp);
        tempActual.append("&deg;C");
        humidityActual.text(response.main.humidity + "%");
        windSpeedActual.text(response.wind.speed + "KPH");

        var lat = response.coord.lat;
        var lon = response.coord.lon;


        var UVurl = "https://api.openweathermap.org/data/2.5/uvi?&lat=" + lat + "&lon=" + lon + "&appid=" + APIkey;
        // UV is seperate
        $.ajax({
            url: UVurl,
            method: "GET"
        }).then(function (response) {
            uvindexActual.text(response.value);
        });

        var countryCode = response.sys.country;
        var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?&units=metric&appid=" + APIkey + "&lat=" + lat + "&lon=" + lon;

        // Get request for predicted weather
        $.ajax({
            url: forecastURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            $('#five-day-forecast').empty();
            for (var i = 1; i < response.list.length; i += 8) {

                var forecastDateString = moment(response.list[i].dt_txt).format("L");
                console.log(forecastDateString);

                var forecastCol = $("<div class='col-12 col-md-6 col-lg forecast-day mb-3'>");
                var forecastCard = $("<div class='card'>");
                var forecastCardBody = $("<div class='card-body'>");
                var forecastDate = $("<h5 class='card-title'>");
                var forecastIcon = $("<img>");
                var forecastTemp = $("<p class='card-text mb-0'>");
                var forecastHumidity = $("<p class='card-text mb-0'>");


                $('#five-day-forecast').append(forecastCol);
                forecastCol.append(forecastCard);
                forecastCard.append(forecastCardBody);

                forecastCardBody.append(forecastDate);
                forecastCardBody.append(forecastIcon);
                forecastCardBody.append(forecastTemp);
                forecastCardBody.append(forecastHumidity);

                forecastIcon.attr("src", "https://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                forecastIcon.attr("alt", response.list[i].weather[0].main)
                forecastDate.text(forecastDateString);
                forecastTemp.text(response.list[i].main.temp);
                forecastTemp.prepend("Temp: ");
                forecastTemp.append("&deg;C");
                forecastHumidity.text(response.list[i].main.humidity);
                forecastHumidity.prepend("Humidity: ");
                forecastHumidity.append("%");



            }
        });

    });



};

// Code for history
function searchHistory(searchString) {

    if (searchString) {

        if (cityResult.indexOf(searchString) === -1) {
            cityResult.push(searchString);
            previousSearch();
            searchHistoryClear.removeClass("hide");
            weatherActual.removeClass("hide");
        } else {
            var removeIndex = cityResult.indexOf(searchString);
            cityResult.splice(removeIndex, 1);
            cityResult.push(searchString);

            previousSearch();
            searchHistoryClear.removeClass("hide");
            weatherActual.removeClass("hide");
        }
    }
}

// Adds to search history
function previousSearch() {
    searchBarHistory.empty();
    cityResult.forEach(function (city) {
        var searchHistoryItem = $('<li class="list-group-item city-btn">');
        searchHistoryItem.attr("data-value", city);
        searchHistoryItem.text(city);
        searchBarHistory.prepend(searchHistoryItem);
    });
    localStorage.setItem("cities", JSON.stringify(cityResult));

}

// Raise dead previous results
function loadHistory() {
    if (localStorage.getItem("cities")) {
        cityResult = JSON.parse(localStorage.getItem("cities"));
        var lastIndex = cityResult.length - 1;
        previousSearch();
        if (cityResult.length !== 0) {
            weatherActualRequest(cityResult[lastIndex]);
            weatherActual.removeClass("hide");
        }
    }
}

// Hide button if no history exists
function loadClear() {
    if (searchBarHistory.text() !== "") {
        searchHistoryClear.removeClass("hide");
    }
}