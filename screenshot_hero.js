const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  await page.goto('https://stretch-theme-sand.myshopify.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  // Close popup by clicking X
  try {
    await page.click('button[aria-label="Close"]', { timeout: 2000 });
  } catch(e) {
    try {
      await page.evaluate(() => {
        const popup = document.querySelector('promo-popup, [class*="popup"]');
        if (popup) popup.remove();
      });
    } catch(e2) {}
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'stretch_hero_clean.png' });
  console.log('Hero clean screenshot saved');
  
  // Scroll down to see featured products
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'stretch_home_products.png' });
  console.log('Home products screenshot saved');
  
  // Collection page scrolled to products
  await page.goto('https://stretch-theme-sand.myshopify.com/collections/all', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'stretch_collection_grid.png' });
  console.log('Collection grid screenshot saved');
  
  await browser.close();
})();
