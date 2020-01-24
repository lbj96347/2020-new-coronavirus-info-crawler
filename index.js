const request = require("request")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const healthCommissionUrls = require('./cities_health_commission_department_website.json')
const cityList = require('./city_position.json')
const Url = require("url")

const keywords = ["新型冠状病毒", "通报", "情况", "病例", "疫情", "日期", "最新"];
var allLatestLocalUpdate = []
var checkLocalNewsUpdateStep = 0 // 

// Test URL "http://wsjkw.gd.gov.cn/zwyw_yqxx/content/post_2877905.html" 

// Get into a specific local HC department news list and get original DOM info  
const checkNewsList = function (department, url){
  const parsedUrl = Url.parse(url)
  request(url, {timeout: 10000} , function (error, response, body) {
    // console.error('error:', error); // Print the error if one occurred
    if(!error){
      // console.log('body:', body); // Print the HTML for the Google homepage.
      // console.log('final string :', finalString);
      // console.log( "url host: ", parsedUrl.host)
      // console.log(dom.window.document.documentElement.textContent);
      const dom = new JSDOM(body);
      dom.window.href = parsedUrl.href
      dom.window.host = parsedUrl.host
      checkLatestNewsUrl(dom.window);
    }else{
      // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      /*
      if( error.code === 'ESOCKETTIMEDOUT' ){
        checkLocalNewsUpdateStep = checkLocalNewsUpdateStep + 1  
        return GetLatestNews(checkLocalNewsUpdateStep)  
      }else{
        return null
      }
      */
      console.log( department + "请求失败" );
      checkLocalNewsUpdateStep = checkLocalNewsUpdateStep + 1  
      return GetLatestNews(checkLocalNewsUpdateStep)
    }
  });
}

const checkNewsPage = function(url){
  const parsedUrl = Url.parse(url)
  request(url, {timeout: 1500} , function (error, response, body) {
    // console.error('error:', error); // Print the error if one occurred
    if(!error){
      console.log('body:', body); // Print the HTML for the Google homepage.
      // console.log('final string :', finalString);
      // console.log( "url host: ", parsedUrl.host)
      // console.log(dom.window.document.documentElement.textContent);
      const dom = new JSDOM(body);
      dom.window.href = parsedUrl.href
      dom.window.host = parsedUrl.host
      extractDataFromNews(dom.window);
    }else{
      // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      if( error.code === 'ESOCKETTIMEDOUT' ){
      }else{
        return null
      }
      // jump into next news
    }
  });

}

// Extract the latest virus news and save the URL
const checkLatestNewsUrl = function (main){
  var matchAnchors = []
  for( var i in main.document.getElementsByTagName("a") ){
    var anchor = main.document.getElementsByTagName("a")[i] 
    var anchorText = anchor.textContent;// anchor.textContent;
    var keywordCount = 0;
    if( anchorText ){
        keywords.map(function( word, key){
            if(anchorText.search(word) > 0){
                keywordCount = keywordCount + 1;
            }
        });
        if( keywordCount >= 2 ){
            console.log("锚点里面的资讯：", anchorText );
            // 有可能不具备年，月，日这个条件，但是已经是一个新闻
            // 只需要取数据中，第一个元素的 href 即可
            // href 中如果不具备 http 头的话，那么需要获取该 domain 下的 url 并补充回去
            // console.log("锚点含有时间信息：",  anchorText.match(/\b(年|月|日)\b/g) )
            matchAnchors.push(anchor)
        }
    }else{
      console.log("get anchors error");
    }
  }
  // console.log(  matchAnchors[0].href )
  // console.log("final url: " , completeHref( main.href, matchAnchors[0].href ) ) 
  if( matchAnchors.length > 0 ){
    allLatestLocalUpdate.push( completeHref( main, matchAnchors[0].href ) ) 
    checkLocalNewsUpdateStep = checkLocalNewsUpdateStep + 1      
    GetLatestNews(checkLocalNewsUpdateStep)
  }else{
    checkLocalNewsUpdateStep = checkLocalNewsUpdateStep + 1      
    GetLatestNews(checkLocalNewsUpdateStep)
  }
}

const extractDataFromNews = function(main){
  var paragraphs = main.document.documentElement.textContent.split(" ") // 对内容进行分段
  console.log( '新闻内容：', paragraphs[0] );
  paragraphs.sort(function(a, b){
    // ASC  -> a.length - b.length
    // DESC -> b.length - a.length
    return b.length - a.length;
  }); // 对关键内容，核心内容进行排序，优先输出

  cityList.map(function( cityItem, key ){
    var city = cityItem["city"];
    // 正则的搜索有可能不是按照城市来的，尤其是直辖市
    var cityCases = new RegExp(city + '[1-9][0-9]{0,2}', 'g');
    var matchCases = paragraphs[0].match(cityCases)
    if( matchCases ){
      if( matchCases.length > 1 ){
      var casesArray = [];
        matchCases.map(function(cityCase, key){
          casesArray.push({"city": cityCase.split(city)[0], "count": cityCase.split(city)[1]});
        });
        casesArray.sort(function(a, b){
          // ASC  -> a.length - b.length
          // DESC -> b.length - a.length
          return b["count"] - a["count"];
        });
        console.log(city + "累计: " + casesArray[0].count )
      }else{
        console.log(matchCases[0].split(city)[0] +  "累计: " + matchCases[0].split(city)[1]  )
      }
    }else{
      return null
    }
  });
}

// main is the same as dom.window object. 
// for geting href or host info
const completeHref = function (main, href){
  if( href.lastIndexOf("http://") < 0 ){
    // 居然还有可能出现 .. 的情况 
    // 也会有前方是 host + html 静态网页的情况
    // 还出现了「疫情通报」就是一个按钮
    if( href.lastIndexOf("./") == 0 ){
      return main.href + href.replace("./","/")
    }else if( href.lastIndexOf("..") == 0 ){
      return "http://" + main.host + "/" + href.replace("..","")
    }else if( main.href !=  ("http://" + main.host + "/")  ){
      return "http://" + main.host + "/" + href
    }else{
      return main.href + href; 
    }
  }else{
    console.log("straight out href", href)
    return href 
  }
}

// Extract all local department HC news 
const GetLatestNews = function (step){
  if( step < (healthCommissionUrls.length - 1) ){
    var department = healthCommissionUrls[step]["department"] 
    console.log("现在的位置是：", department ); 
    checkNewsList(department, healthCommissionUrls[step]["url"])
  }else{
    console.log( '所有的本地更新链接：', allLatestLocalUpdate ); 
    // Jump into each detail page & extract data
  }
}

const GetLatestData = function( ){
  checkNewsPage('http://wjw.shanxi.gov.cn/wjywl02/24328.hrh')
}

// GetLatestNews(checkLocalNewsUpdateStep)

GetLatestData() 

// checkNewsList("浙江", "http://www.zjwjw.gov.cn/col/col1202101/index.html") 
