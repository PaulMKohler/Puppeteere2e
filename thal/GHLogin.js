
const puppeteer = require('puppeteer');
const CREDS = require('./creds');
const mongoose = require('mongoose');
const User = require('./models/user');
const userToSearch = 'john';
const searchUrl = `https://github.com/search?q=${userToSearch}&type=users`;
const USERNAME_SELECTOR = '#login_field';
const PASSWORD_SELECTOR = '#password';
const LOGINBTN_SELECTOR = '#login > div.auth-form-body.mt-3 > form > input.btn.btn-primary.btn-block';
const LISTNAME_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.flex-auto > div:nth-child(1) > div.f4.text-normal > a.text-gray';
const LISTEMAIL_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.flex-auto > div.d-flex.flex-wrap.text-small.text-gray > div:nth-child(2) > a'

const LENGTH_SELECTOR_CLASS = 'user-list-item';

const NUMUSERS_SELECTOR = '#js-pjax-container > div > div.col-12.col-md-9.float-left.px-2.pt-3.pt-md-0.codesearch-results > div > div.d-flex.flex-column.flex-md-row.flex-justify-between.border-bottom.pb-3.position-relative > h3'

async function run() {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();

  await page.goto('https://github.com/login');

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(CREDS.username);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(CREDS.password);

  await page.click(LOGINBTN_SELECTOR);

  await page.waitForNavigation();

  await page.goto(searchUrl);
  await page.waitFor(2*1000);

  let numPages = await getNumPages(page);

  console.log('Numpages: ', numPages);

  for (let h = 1; h <= numPages; h++) {

  	let pageUrl = searchUrl + '&p=' + h;

  	await page.goto(pageUrl);

    let listLength = await page.evaluate((sel) => {
      return document.getElementsByClassName(sel).length;
    }, LENGTH_SELECTOR_CLASS);

    for (let i = 1; i <= listLength; i++) {
      // change the index to the next child
      let usernameSelector = LISTNAME_SELECTOR.replace("INDEX", i);
      let emailSelector = LISTEMAIL_SELECTOR.replace("INDEX", i);

      let username = await page.evaluate((sel) => {
          return document.querySelector(sel).getAttribute('href').replace('/', '');
        }, usernameSelector);

      let email = await page.evaluate((sel) => {
          let element = document.querySelector(sel);
          return element? element.innerHTML: null;
        }, emailSelector);

      // not all users have emails visible
      if (!email)
        continue;

      //console.log(username, ' -> ', email);
      upsertUser({
        username: username,
        email: email,
        dateCrawled: new Date()
      });
      // TODO save this user
    }

    //getNumPages(page);
    //browser.close();
  }
}

async function getNumPages(page) {

  let inner = await page.evaluate((sel) => {
    let html = document.querySelector(sel).innerHTML;

    // format is: "69,803 users"
    return html.replace(',', '').replace('users', '').trim();
  }, NUMUSERS_SELECTOR);

  let numUsers = parseInt(inner);

  console.log('numUsers: ', numUsers);

  /*
  * GitHub shows 10 resuls per page, so
  */
  let numPages = Math.ceil(numUsers / 10);
  return numPages;
}

function upsertUser(userObj) {

	const DB_URL = 'mongodb://localhost/thal';

  	if (mongoose.connection.readyState == 0) { mongoose.connect(DB_URL); }

    	// if this email exists, update the entry, don't insert
	let conditions = { email: userObj.email };
	let options = { upsert: true, new: true, setDefaultsOnInsert: true };

  	User.findOneAndUpdate(conditions, userObj, options, (err, result) => {
  		if (err) throw err;
  	});
}

run();
