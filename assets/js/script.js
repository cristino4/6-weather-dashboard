var apiKey = "c94957d800c39e4cc9b3130db089253a";
var lat = "";
var lon = "";
// var lat = "34.396622";
// var lon = "-117.275002";
var cityName = "london";
var limit = 10;
var currentWeather;
var fiveDayForecast;

currentCityEl = $("#current-city");
currentIconEl = $("#current-icon");
currentDescriptionEl = $("#current-description");
currentTempEl = $("#current-temp");
currentWindEl = $("#current-wind");
currentHumidityEl = $("#current-humidity");
searchHistoryEl = $("#search-history")

$("#clear-history-button").click(function(){{
    localStorage.removeItem("searchHistory")
    searchHistoryEl.empty()
    titleItemEl = $("<option>").text("Search History")
    searchHistoryEl.append(titleItemEl)
}})
$("#search-button").click(search)
$("#search-history").change(function(event){
    $("#search-results button").remove();
    el = $(this).find(":selected")
    log(el)
    lat = el.data("lattitude")
    lon = el.data("longitude")
    searchText = `${el.data("name")}, ${el.data("state")}, ${el.data("country")}`
    pageUpdate(lat,lon)
})

getCurrentLocation()

async function init(pos){
    const crd = pos.coords;
    lat = crd.latitude;
    lon = crd.longitude;
    console.log("Your current position is:");
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    pageUpdate(lat,lon)
}

async function pageUpdate(lat,lon){

    //location coordinates are stored as global var
    log(`Location check lat ${lat} lon ${lon}`)
    weatherData = await pollWeather(lat,lon)
    log(`Location check lat ${lat} lon ${lon}`)
    forecastData = await pollForecast(lat,lon)
    fiveDayForecast = parseForecast(forecastData)
    currentWeather = parseCurrentWeather(weatherData)
    displayForecast(currentWeather,fiveDayForecast)
    updateSearchHistory()

}

function getCurrentLocation() {
        navigator.geolocation.getCurrentPosition(init);
  }

async function getAddress() {
  // notice, no then(), cause await would block and 
  // wait for the resolved result
  const position = await this.getCoordinates(); 
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  x = [latitude,longitude]

  // Actually return a value
  return x 
}


//***************************************** */



  
//********************************************** */






//displays seach history on drop down menu
function updateSearchHistory(){
    searchHistoryEl.empty()
    if(localStorage.getItem("searchHistory") != null){
        titleItemEl = $("<option>").text("Search History")
        searchHistoryEl.append(titleItemEl)
        mem = JSON.parse(localStorage.getItem("searchHistory"));
        for(let i = 0; i < mem.length;i++){
            histItem = $("<option>")
            histItem.text(`${mem[i].city}, ${mem[i].state}, ${mem[i].country}`)
            searchHistoryEl.append(histItem)
            histItem.attr("data-lattitude",mem[i].lattitude)
            histItem.attr("data-longitude",mem[i].longitude)
            histItem.attr("data-name",mem[i].city)
            histItem.attr("data-state",mem[i].state)
            histItem.attr("data-country",mem[i].country)
        } 
    } else {
        searchHistoryEl.empty()
        titleItemEl = $("<option>").text("Search History")
        searchHistoryEl.append(titleItemEl)
    }
}

async function search(event){
    log("EVENT: ")
    log(event)
    term =$("#search-bar")[0].value;
    
    if (term === ""){
        log("Error Enter a search term")
        return
    }
    locations = await pollLocations(term);
    searchRes = parseLocations(locations)
    log(`search results: `)
    for (i=0;i<searchRes[0].length;i++){
        log(`#${i+1} City: ${searchRes[0][i]}, State: ${searchRes[1][i]}, Country: ${searchRes[2][i]}, Coordinates: ${searchRes[3][i]}`)
    }
    displayResults(searchRes)

}
async function applySelection(event){
    log("EVENT: ")
    log(event)
    $("#search-results button").remove();
    $("#search-results p").remove();
    lat = event.target.attributes.getNamedItem("data-lattitude").value;
    lon = event.target.attributes.getNamedItem("data-longitude").value;
    var city = event.target.attributes.getNamedItem("data-name").value;
    var state = event.target.attributes.getNamedItem("data-state").value;
    var country = event.target.attributes.getNamedItem("data-country").value;

    if(localStorage.getItem("searchHistory") != null){
        const storageEntry = new Object()
        storageEntry.lattitude = lat;
        storageEntry.longitude = lon;
        storageEntry.city = city;
        storageEntry.state = state;
        storageEntry.country = country;
        mem = JSON.parse(localStorage.getItem("searchHistory"))
        mem.push(storageEntry)
        //save search to local storage (search history)
        localStorage.setItem(`searchHistory`,JSON.stringify(mem))
    } else {
        const storageEntry = new Object()
        storageEntry.lattitude = lat;
        storageEntry.longitude = lon;
        storageEntry.city = city;
        storageEntry.state = state;
        storageEntry.country = country;
        mem = []
        mem.push(storageEntry)
        //save search to local storage (search history)
        localStorage.setItem(`searchHistory`,JSON.stringify(mem))
    }


    pageUpdate(lat,lon)
    
}

function parseLocations(loc){
    var cities = [];
    var states = [];
    var countries = [];
    var coors = [];
    for (let i=0;i<loc.length;i++){
        cities.push(loc[i].name)
        states.push(loc[i].state)
        countries.push(loc[i].country)
        coors.push([loc[i].lat,loc[i].lon])
    }
    return [cities,states,countries,coors]
}

async function pollLocations(term){
    log(`Searching for ${term}`)
    url = `https://api.openweathermap.org/geo/1.0/direct?q=${term}&limit=5&appid=${apiKey}`
    const response = await fetch(url)
    res = response.json();
    log(`Results:`)
    log(res)
    return res

}

function displayResults(results) {
    //results [cities,states,countries,coor]
    $("#search-results button").remove();
    $("#search-results p").remove();
    resultsContainerEl = $("#search-results")
    titleEl = $("<p>")
    titleEl.text("Search Results:")
    resultsContainerEl.append(titleEl)
    for (i = 0; i<results[0].length; i++){
        resultEl = $("<button>")
        resultEl.addClass("btn btn-outline-primary my-2")
        resultEl.text(`${results[0][i]}, ${results[1][i]}, ${results[2][i]}`)
        resultEl.attr("data-lattitude",results[3][i][0])
        resultEl.attr("data-longitude",results[3][i][1])
        resultEl.attr("data-name",results[0][i])
        resultEl.attr("data-state",results[1][i])
        resultEl.attr("data-country",results[2][i])
        resultEl.attr("type","button")
        resultEl.click(applySelection)
        resultsContainerEl.append(resultEl)
    }

}

function locationFound(pos){
    const crd = pos.coords;
    log('Current Position:');
    log(`Latitude : ${crd.latitude}`);  
    log(`Longitude: ${crd.longitude}`);
    lat = crd.latitute;
    lon = crd.longitude;
}

function locationError(){
    log(`Location Error: ${err.code} ${err.message}`);
    lat = null;
    lon = null;
}


async function pollWeather(lat,lon){
    log(`Obtaining weather data for latitude: ${lat} longitude: ${lon}`)
    weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
    const response = await fetch(weatherUrl)
    res = response.json()
    log("Data:")
    log(res)
    return res

}

async function pollForecast(lat,lon){
    log(`Obtaining forecast data for lattitude: ${lat} longitude: ${lon}`)
    weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&exclude=hourly,daily`
    const response = await fetch(weatherUrl)
    res = response.json()
    log("Data:")
    log(res)
    return res
}

function parseForecast(data){
    //day = [date,temp,wind,humidity,icon,description]
    var forecast;
    day1 = [data.list[0].dt_txt,data.list[0].main.temp,data.list[0].wind.speed,data.list[0].main.humidity,data.list[0].weather[0].icon,data.list[0].weather[0].description]
    day2 = [data.list[8].dt_txt,data.list[1].main.temp,data.list[1].wind.speed,data.list[1].main.humidity,data.list[1].weather[0].icon,data.list[1].weather[0].description] 
    day3 = [data.list[16].dt_txt,data.list[2].main.temp,data.list[2].wind.speed,data.list[2].main.humidity,data.list[2].weather[0].icon,data.list[2].weather[0].description] 
    day4 = [data.list[24].dt_txt,data.list[3].main.temp,data.list[3].wind.speed,data.list[3].main.humidity,data.list[3].weather[0].icon,data.list[3].weather[0].description] 
    day5 = [data.list[32].dt_txt,data.list[4].main.temp,data.list[4].wind.speed,data.list[4].main.humidity,data.list[4].weather[0].icon,data.list[4].weather[0].description]  
    forecast = [day1,day2,day3,day4,day5]
    
    log(`Parsing 5 day forcast:`)
    log(`Day 1: ${day1} `)
    log(`Day 2: ${day2} `)
    log(`Day 3: ${day3} `)
    log(`Day 4: ${day4} `)
    log(`Day 5: ${day5} `)

    return forecast

}

function parseCurrentWeather(data){
    var country = data.sys.country;
    var city = data.name;
    // var state = data.state
    var humidity = data.main.humidity;
    var temp = data.main.temp;
    var win = data.wind.speed;
    var iconID = data.weather[0].icon;
    var description = data.weather[0].description
    log(`Parsing Weather: City ${city}, Country ${country}, Humidity ${humidity}, Temperature ${temp}, Wind ${win}, iconID ${iconID}`)
    // return [country,city,humidity,temp,win,iconID,description,state]
    return [country,city,humidity,temp,win,iconID,description]
}

function displayForecast(current,forecast){
    //display current weather
    // currentCityEl.text(`${current[1]}, ${current[7]}, ${current[0]}`)
    currentCityEl.text(`${current[1]}, ${current[0]}`)
    // currentIconEl.attr("style", `background-image: url(http://openweathermap.org/img/wn/${current[5]}.png)`);
    currentIconEl.attr("src", `https://openweathermap.org/img/wn/${current[5]}.png`);
    currentDescriptionEl.text(current[6]);
    currentHumidityEl.text(`Humidity: ${current[2]} %`);
    currentTempEl.text(`Temperature: ${current[3]} \u00B0F`);
    currentWindEl.text(`Wind: ${current[4]} mph`);

    //display forecast
    //icon update
    var icons = [];
    for (i=0;i<5;i++){
        icons.push($(`#d${i+1}-icon`));
    }
    for (i=0; i<5;i++){
        icons[i].attr("src", `https://openweathermap.org/img/wn/${forecast[i][4]}.png`);
    }
    //description update
    var desc = []
    for (i=0;i<5;i++){
        desc.push($(`#d${i+1}-desc`));
    }
    for (i=0; i<5;i++){
        desc[i].text(forecast[i][5]);
    }
    //temp update
    var desc = []
    for (i=0;i<5;i++){
        desc.push($(`#d${i+1}-temp`));
    }
    for (i=0; i<5;i++){
        desc[i].text(` Temperature: ${forecast[i][1]} \u00B0F`);
    }
    //wind update
    var desc = []
    for (i=0;i<5;i++){
        desc.push($(`#d${i+1}-wind`));
    }
    for (i=0; i<5;i++){
        desc[i].text(`Wind: ${forecast[i][2]} mph`);
    }
    //humidity update
    var desc = []
    for (i=0;i<5;i++){
        desc.push($(`#d${i+1}-humid`));
    }
    for (i=0; i<5;i++){
        desc[i].text(`Humidity: ${forecast[i][3]} %`);
    }
    //dateupdate
    var desc = []
    for (i=0;i<5;i++){
        desc.push($(`#d${i+1}-date`));
    }
    for (i=0; i<5;i++){
        dates = parseDate(forecast[i][0])
        desc[i].text(`${dates[0]} ${dates[1]} ${dates[2]}`);
    }
    
}

function parseDate(date) {
    var response = [];
    //date format 2023-02-19 03:00:00
    dateArr = dayjs(date).$d.toString().split(" ")
    var dayWeek = dateArr[0];
    var month = dateArr[1];
    var day = dateArr[2];
    return response = [dayWeek,month,day];
}

function log(mesg){
    console.log(mesg)
}


