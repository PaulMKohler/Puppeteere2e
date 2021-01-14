const puppeteer = require('puppeteer');
const searchUrl='http://btcocktails.blogspot.com/search?updated-max=DATESTARTT00:00:00-07:00'
const mongoose = require('mongoose');
const Post = require('./models/Post');
const FIRSTBLOG = 20150724;
const TITLE_SELECTOR = '#Blog1 > div.blog-posts.hfeed > div:nth-child(INDEX) > div > div > div > h3 > a';
const DATE_SELECTOR = '#Blog1 > div.blog-posts.hfeed > div:nth-child(INDEX) > h2 > span';
const AUTHOR_SELECTOR = '#Blog1 > div.blog-posts.hfeed > div:nth-child(INDEX) > div > div > div > div.post-footer > div.post-footer-line.post-footer-line-1 > span.post-author.vcard > span > a > span';

const LENGTH_SELECTOR_CLASS = 'date-outer';

async function stephenBlogScrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  //Friday, 24 July 2015
  //YYYY/MM/DD format (2015-07-24)
  //OLDEST ARTICLE
  let startDate = new Date();

  // current date
  // adjust 0 before single digit date
  let dayNumber = ('0' + startDate.getDate()).slice(-2);

  // current month
  let monthNumber = ('0' + (startDate.getMonth() + 1)).slice(-2);

  // current year
  let yearNumber = startDate.getFullYear();

  let beginDate = yearNumber + "-" + monthNumber + "-" + dayNumber;
  //While Date is after 2015-07-25 replace DATESTART in search url with date string
  let numDateStr = beginDate.replaceAll('-', '');

  let numDate = parseInt(numDateStr);

  while(numDate > FIRSTBLOG){

    await page.goto(searchUrl.replace("DATESTART",beginDate));

    let listLength = await page.evaluate((sel) => {
      return document.getElementsByClassName(sel).length;
    }, LENGTH_SELECTOR_CLASS);

    for (let i = 1; i <= listLength; i++) {
      // change the index to the next child
      let titleSelector = TITLE_SELECTOR.replace("INDEX", i);
      let dateSelector = DATE_SELECTOR.replace("INDEX", i);
      let authorSelector = AUTHOR_SELECTOR.replace("INDEX", i);

      let title = await page.evaluate((sel) => {
        let element = document.querySelector(sel);
        return element? element.innerHTML: null;
      }, titleSelector);

      let date = await page.evaluate((sel) => {
          let element = document.querySelector(sel);
          return element? element.innerHTML: null;
        }, dateSelector);

      let author = await page.evaluate((sel) => {
          let element = document.querySelector(sel);
          return element? element.innerHTML: null;
        }, authorSelector);

      if(!title || !date || !author){
        continue;
      }

      startDate = new Date(date);

      upsertPost({
        title: title,
        author: author,
        dateCreated: date,
        dateCrawled: new Date()
      });
      //console.log(title, ' -> ', date, ' -> ', author);

    }
    // current date
    // adjust 0 before single digit date
    let dayNumber = ('0' + startDate.getDate()).slice(-2);

    // current month
    let monthNumber = ('0' + (startDate.getMonth() + 1)).slice(-2);

    // current year
    let yearNumber = startDate.getFullYear();

    beginDate = yearNumber + "-" + monthNumber + "-" + dayNumber;

    //While Date is after 2015-07-25 replace DATESTART in search url with date string
    // format is: "69,803 users"
    let numDateStr = beginDate.replaceAll('-', '');

    let numDate = parseInt(numDateStr);
    console.log(numDate);
  }
}

function upsertPost(userObj) {

	const DB_URL = 'mongodb://localhost/stephenBlogPosts';

  	if (mongoose.connection.readyState == 0) { mongoose.connect(DB_URL); }

    	// if this title exists, update the entry, don't insert
	let conditions = { title: userObj.title };
	let options = { upsert: true, new: true, setDefaultsOnInsert: true };

  	Post.findOneAndUpdate(conditions, userObj, options, (err, result) => {
  		if (err) throw err;
  	});
}

stephenBlogScrape();
