const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.setViewport({
  width: 640,
  height: 480,
  deviceScaleFactor: 1,
});
  await page.screenshot({path: 'example.png'});
  await browser.close();
})();
