const request = require("request")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const healthCommissionUrls = require('./cities_health_commission_department_website.json')
const Url = require("url")

const keywords = ["新型冠状病毒", "通报", "情况", "病例", "疫情", "日期", "最新"];
var allLatestLocalUpdate = []
var checkLocalNewsUpdateStep = 0 // 

// Test URL "http://wsjkw.gd.gov.cn/zwyw_yqxx/content/post_2877905.html" 

// Get into a specific local HC department news list and get original DOM info  
const checkNewsList = function (url){
  const parsedUrl = Url.parse(url)
  request(url, {timeout: 1500} , function (error, response, body) {
    // console.error('error:', error); // Print the error if one occurred
    if(!error){
      // console.log('body:', body); // Print the HTML for the Google homepage.
      // console.log('final string :', finalString);
      const dom = new JSDOM(body);
      dom.window.href = parsedUrl.href
      checkLatestNewsUrl(dom.window);
      // console.log( "url host: ", parsedUrl.host)
      //console.log(dom.window.document.documentElement.textContent); // "Hello world"
    }else{
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      /*
      if( error.code === 'ESOCKETTIMEDOUT' ){
        checkLocalNewsUpdateStep = checkLocalNewsUpdateStep + 1  
        return GetLatestNews(checkLocalNewsUpdateStep)  
      }else{
        return null
      }
      */
      checkLocalNewsUpdateStep = checkLocalNewsUpdateStep + 1  
      return GetLatestNews(checkLocalNewsUpdateStep)
    }
  });
}

// Extract the latest virus news and save the URL
const checkLatestNewsUrl = function (main){
  var matchAnchors = []
  for( var i in main.document.getElementsByTagName("a") ){
    var anchor = main.document.getElementsByTagName("a")[i] 
    var anchorText = anchor.innerHTML;
    var keywordCount = 0;
    if( anchorText){
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
            console.log("锚点含有时间信息：",  anchorText.match(/\b(年|月|日)\b/g) )
            matchAnchors.push(anchor)
        }
    }
  }
  // console.log(  matchAnchors[0].href )
  // console.log("final url: " , completeHref( main.href, matchAnchors[0].href ) ) 
  if( matchAnchors.length > 0 ){
    allLatestLocalUpdate.push( completeHref( main.href, matchAnchors[0].href ) ) 
    checkLocalNewsUpdateStep = checkLocalNewsUpdateStep + 1      
    // checkNewsList(healthCommissionUrls[checkLocalNewsUpdateStep]["url"])
    GetLatestNews(checkLocalNewsUpdateStep)
  }else{
    checkLocalNewsUpdateStep = checkLocalNewsUpdateStep + 1      
    // checkNewsList(healthCommissionUrls[checkLocalNewsUpdateStep]["url"])
    GetLatestNews(checkLocalNewsUpdateStep)
  }
}

const completeHref = function (preHref, href){
  if( href.lastIndexOf("http://") < 0 ){
    // 居然还有可能出现 .. 的情况 
    return preHref +  href; 
  }else{
    return href 
  }
}

// Extract all local department HC news 
const GetLatestNews = function (step){
  if( step < (healthCommissionUrls.length - 1) ){
    console.log("现在的位置是：", step ); 
    checkNewsList(healthCommissionUrls[step]["url"])
  }else{
    console.log( '所有的本地更新链接：', allLatestLocalUpdate ); 
  }
}

GetLatestNews(checkLocalNewsUpdateStep)
