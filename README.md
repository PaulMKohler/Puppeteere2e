# Puppeteere2e
 
Start with the standard example and build from there.

Example - navigating to https://example.com and saving a screenshot as example.png:

Save file as example.js

```

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();

````
