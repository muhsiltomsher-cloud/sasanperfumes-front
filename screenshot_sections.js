const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  // Homepage hero
  await page.goto('https://stretch-theme-sand.myshopify.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  // Close popup if exists
  try {
    await page.click('[aria-label="Close"] , .popup__close, button[class*="close"]', { timeout: 2000 });
  } catch(e) {}
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'stretch_hero.png' });
  console.log('Hero screenshot saved');
  
  // Collection page product grid focus
  await page.goto('https://stretch-theme-sand.myshopify.com/collections/all', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'stretch_products.png' });
  console.log('Products screenshot saved');
  
  await browser.close();
})();
