const request = require("request")
const cityData = require('./cities.json')
const parse = require("url-parse")
const fs = require('fs');

var count = 0;
const newCityList = [];
var singleCityPosition = [];

const composeCitylist = function (){
  const cityList = []; 
  cityData["provinces"].map((item, key) => 
    // cityList.push(item["citys"])
    item["citys"].map((item, key) =>
      cityList.push(item["citysName"])
    )
  )
  return cityList;
}
// console.log( composeCitylist().length );

const crawlerAction = function (cityName){
  var requestUrl = parse('http://api.map.baidu.com/geocoder?key='+[YOUR_KEY]+'&address='+ cityName +'&output=json', true)
  request(requestUrl.href, function (error, response, body) {
    console.error('error:', error); // Print the error if one occurred
    if(!error){
      console.log('body:', body); // Print the HTML for the Google homepage.
      var cityPosition = JSON.parse(body)["result"]["location"]
      console.log([cityPosition["lat"], cityPosition["lng"]]);
      singleCityPosition = [cityPosition["lat"], cityPosition["lng"]]; 
      count = count + 1
      return [cityPosition["lat"], cityPosition["lng"]]; 
    }else{
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      return null
    }
  });
}

const requestQueue = function (index){
  // console.log( allCities )
  if( index < (allCities.length - 1) ){
  // if( index < 5 ){
    crawlerAction( allCities[index] )
    newCityList.push({"city": allCities[index], "position": singleCityPosition})
    setTimeout(function (){
      requestQueue(count)
    }, 1000)
  }else{
    console.log( newCityList )
    fs.writeFile("./city_position.json", JSON.stringify(newCityList), function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
    });
  }
}

const allCities = composeCitylist() 
requestQueue(0)
