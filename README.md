Intro
=====

It's a web crawler to get info & extract data from all local health commissions in China. It will provide data to 2020-virus-map project.

这是一个自动获取信息的机器人，从所有的地方卫生健康委员会上获取信息，并解析成结构化的数据提供给「新型冠状病毒感染地图」进行使用。

👍 推荐： [人民日报与丁香园联合发布的页面](https://3g.dxy.cn/newh5/view/pneumonia) 

> 目前 index.js 中的信息抓取会优先从这个网站中获取到相关的数据，并提供出来给 `https://github.com/lbj96347/2020-virus-map` 使用 

Notice
======

🚧 It's still under development, please be patient. Feel free to use city_position.json & website list file. 

File Intro 
==========

`cities.json` contains provinces & cities names, relationships. 

`province_list.json` contains provinces info 

`city_position.json` It's a generated file from city_info_crawler.js( ⚠️  with some issues) 

`new_city_position.json` contains each city's [lat,lng]. It's a file from `https://www.highcharts.com.cn/docs/latlon` 

`new_virus_data.json` It's a generated file from index.js(⚠️  it can't be used for `https://github.com/lbj96347/2020-virus-map` immediately)

`cities_health_commission_department_website.json` contains news web page of all local health commission department 

`city_info_crawler.js` use baidu map API to get each city's [lat,lng] value 

`get_health_commission_data.js` A crawler script to get latest local health news  


How to 
=======

#### dev 

> npm install 

> node index.js 


