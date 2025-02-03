const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36');

    console.log('Navigating to http://192.168.0.95/jobs');
    await page.goto('http://192.168.0.95/jobs', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Page loaded.');
    await page.screenshot({ path: 'machine95.png' });
    await page.waitForSelector('tbody tr', { timeout: 15000 });
    console.log('Selector found.');
    await browser.close();
  } catch (error) {
    console.error('Error in test script:', error);
  }
})();
