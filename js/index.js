
//& =========>  HtmlElement  ============>
const cardsContainer = document.querySelector(".forecast-cards");
const searchBox = document.getElementById("searchBox");
const locationElement =document.querySelector("p.location");
const allBars = document.querySelectorAll(".clock");
const cityContainer = document.querySelector(".city-items")




//& =========>  App variable  ============>

const apiKey ="7a40b4cf1537459e95f212753233008";
const baseUrl="https://api.weatherapi.com/v1/forecast.json";
let currentLocation = "cairo";
const recentCities = JSON.parse(localStorage.getItem("cities")) || []


//& =========>  function  ============>
async function getWeather(location) {
  const response = await fetch(`${baseUrl}?key=${apiKey}&days=7&q=${location}`);
  if (response.status =! 200) return
 const data = await response.json();
  displayWeather(data);
  searchBox.value="";

}

function displayWeather(data) {
  locationElement.innerHTML = `<span class="city-name">${data.location.name}</span>,${data.location.country}`;
  console.log(data);
  const days =data.forecast.forecastday;
const now = new Date();
let cardsHTML="";
for (let [index,day] of days.entries()) {
  const date = new Date(day.date);
  cardsHTML += `
      <div class='${index == 0 ? "card active"  :"card"}' data-index=${index}>
      <div class="card-header">"
        <div class="day">${date.toLocaleDateString("en-us",{weekday :"long"})}</div>
        <div class="time">${now.getHours() > 12 ? now.getHours() -12 :now.getHours() }:${now.getMinutes()}${now.getHours() > 11 ? "PM":"AM" }</div>
      </div>
      <div class="card-body">
        <img src="./images/conditions/${day.day.condition.text}.svg"/>
        <div class="degree">${day.hour[now.getHours()].temp_c}C°</div>
      </div>
      <div class="card-data">
        <ul class="left-column">
          <li>Real Feel: <span class="real-feel">${day.hour[now.getHours()].feelslike_c} C°</span></li>
          <li>Wind: <span class="wind">${day.hour[now.getHours()].wind_mph} Mph</span></li>
          <li>Pressure: <span class="pressure">${day.hour[now.getHours()].pressure_mb} Mb</span></li>
          <li>Humidity: <span class="humidity">${day.hour[now.getHours()].humidity} %</span></li>
        </ul>
        <ul class="right-column">
          <li>Sunrise: <span class="sunrise">${day.astro.sunrise}</span></li>
          <li>Sunset: <span class="sunset">${day.astro.sunset} </span></li>
        </ul>
      </div>
    </div>
    `
  }
       cardsContainer.innerHTML = cardsHTML;

  const allCards = document.querySelectorAll(".card");

  for (let card of allCards) {
    card.addEventListener("click", function (event) {
      const activeCard = document.querySelector(".card.active");
      activeCard.classList.remove("active")
      event.currentTarget.classList.add("active")
      displayRainInfo(days[event.currentTarget.dataset.index])
    })
  }
  let exist = recentCities.find((currentCity) => currentCity.city == data.location.name)
  if (exist) return
  recentCities.push({ city: data.location.name, country: data.location.country });
  localStorage.setItem("cities", JSON.stringify(recentCities))
  displayRecentCity(data.location.name, data.location.country)

}


function success(position) {
   currentLocation = `${position.coords.latitude},${position.coords.longitude}`;
getWeather(currentLocation);
}
window.addEventListener("load", function () {
  navigator.geolocation.getCurrentPosition(success);  
})


function displayRainInfo(weatherInfo) {
  console.log(weatherInfo);
  for (let element of allBars) {
    const clock = element.dataset.clock;
    const height = weatherInfo.hour[clock].chance_of_rain;
    console.log(height);
element.querySelector(".percent").style.height=`${height}%`
  }
}

async function getCityImage(city) {
  const response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape`)
  const data = await response.json();
  const random = Math.trunc(Math.random() * data.results.length)
  return data.results[random]
}
async function displayRecentCity(city, country) {
  let cityInfo = await getCityImage(city);
  if (cityInfo) {
    let itemContent = `
  <div class="item">
    <div class="city-image">
      <img src="${cityInfo.urls.regular}" alt="Image for ${city} city" />
    </div>
    <div class="city-name"><span class="city-name">${city}</span>, ${country}</div>
  </div>
`;

    cityContainer.innerHTML += itemContent
  }
}













//& =========>  Events  ============>
window.addEventListener("load", function () {
  navigator.geolocation.getCurrentPosition(success);
  for (let i = 0; i < recentCities.length; i++) {
    displayRecentCity(recentCities[i].city, recentCities[i].country)
  }
})
searchBox.addEventListener("blur",function () {
  getWeather(this.value) 

})

document.addEventListener("keyup",function (e) {
  console.log(e.key);
  if (e.key=="Enter") {
    getWeather(searchBox.value)
  }
})