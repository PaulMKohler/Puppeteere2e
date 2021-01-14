const puppeteer = require('puppeteer');
const TITLE_SELECTOR = '#Blog1 > div.blog-posts.hfeed > div:nth-child(INDEX) > div > div > div > h3 > a';
const DATE_SELECTOR = '#Blog1 > div.blog-posts.hfeed > div:nth-child(INDEX) > h2 > span';
const AUTHOR_SELECTOR = '#Blog1 > div.blog-posts.hfeed > div:nth-child(INDEX) > div > div > div > div.post-footer > div.post-footer-line.post-footer-line-1 > span.post-author.vcard > span > a > span';

const LENGTH_SELECTOR_CLASS = 'date-outer';

async function stephenBlogScrape() {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();

  await page.goto('http://btcocktails.blogspot.com/');

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

    console.log(title, ' -> ', date, ' -> ', author);
  }
}

stephenBlogScrape();
