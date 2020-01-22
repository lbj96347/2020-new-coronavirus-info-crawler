const request = require("request")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const crawlerAction = function (){
  request("http://wsjkw.gd.gov.cn/zwyw_yqxx/content/post_2877905.html", function (error, response, body) {
    console.error('error:', error); // Print the error if one occurred
    if(!error){
      // console.log('body:', body); // Print the HTML for the Google homepage.
      // console.log('final string :', finalString);
      const dom = new JSDOM(body);
      console.log(dom.window.document.documentElement.innerText); // "Hello world"
    }else{
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      return null
    }
  });
}

crawlerAction()
