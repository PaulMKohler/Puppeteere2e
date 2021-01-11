
const puppeteer = require('puppeteer');
const CREDS = require('./creds');
const userToSearch = 'john';
const searchUrl = `https://github.com/search?q=${userToSearch}&type=users`;
const USERNAME_SELECTOR = '#login_field';
const PASSWORD_SELECTOR = '#password';
const LOGINBTN_SELECTOR = '#login > div.auth-form-body.mt-3 > form > input.btn.btn-primary.btn-block';

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
  //browser.close();
}

run();
