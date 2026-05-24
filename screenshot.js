const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  await page.goto('https://stretch-theme-sand.myshopify.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'stretch_home.png', fullPage: true });
  console.log('Homepage screenshot saved');
  
  await page.goto('https://stretch-theme-sand.myshopify.com/collections/all', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'stretch_collection.png', fullPage: true });
  console.log('Collection page screenshot saved');
  
  await browser.close();
})();
