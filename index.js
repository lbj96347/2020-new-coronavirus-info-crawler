const request = require("request")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const healthCommissionUrls = require('./cities_health_commission_department_website.json')
const cityList = require('./city_position.json')
const newCityList = require('./new_city_position.json')
const provinceList = require('./province_list.json')
const Url = require("url")
const fs = require('fs');

const dxyUrl = "https://3g.dxy.cn/newh5/view/pneumonia"
const newCityGeoList = []

const requestAction = function (url){
  request(url, {timeout: 10000} , function (error, response, body) {
    // console.error('error:', error); // Print the error if one occurred
    if(!error){
      // console.log('body:', body); // Print the HTML for the Google homepage.
      // console.log(dom.window.document.documentElement.textContent);
      const dom = new JSDOM(body);
      var data = dom.window.document.getElementById("getAreaStat");
      var finalString = (data.innerHTML.replace("try { window.getAreaStat =","")).replace("}catch(e){}","");
      var finalData = JSON.parse(finalString)  
      // console.log( finalData );
      extractData(finalData);
    }else{
      if( error.code === 'ESOCKETTIMEDOUT' ){
        return null
      }else{
        return null
      }
    }
  });

}

const extractData = function(data){
  getCityGeo()
  var pureCitiesList = []
  var geoCitiesList = []
  data.map(function ( province, key ){
    if( province["cities"] ){
      var cities = province["cities"]
      cities.map( function( city, key ){
        pureCitiesList.push(city)
      })
    }
  })

  if( pureCitiesList.length > 1 ){
    // console.log( pureCitiesList )
    pureCitiesList.map(function ( city, key){
      var cityPosition;
      for( var i in newCityGeoList ){
        if( newCityGeoList [i]["city"] == city["cityName"] ){
          cityPosition = newCityGeoList[i]["position"]
          city["position"] = cityPosition
          geoCitiesList.push( city ) 
        }
      }
    });
  }
  
  console.log( geoCitiesList );
  makeJSONFile( geoCitiesList );
}

const makeJSONFile = function (cityList){
  fs.writeFile("./new_virus_data.json", JSON.stringify(cityList), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
  })
}

requestAction(dxyUrl)

const getCityGeo = function(){
  var keys = Object.keys(newCityList)
  keys.map( function( cityName, key){
     newCityGeoList.push({
       "city": cityName, 
       "position": [newCityList[cityName]["lat"] , 
           newCityList[cityName]["lon"] ] 
       })
  })
}

