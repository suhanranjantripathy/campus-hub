import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function inspectNewtonSchool() {
  console.log('Launching Puppeteer Chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const targetUrl = 'https://my.newtonschool.co/register?next=/course/0rsk0a0teyqh/details';
    console.log(`Navigating to: ${targetUrl}`);

    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const currentUrl = page.url();
    const title = await page.title();
    console.log(`Loaded URL: ${currentUrl}`);
    console.log(`Page Title: ${title}`);

    // Wait a brief moment for client-side hydration
    await new Promise((r) => setTimeout(r, 3000));

    // Save screenshot
    const screenshotPath = path.resolve('public', 'newton_screen.png');
    fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to: ${screenshotPath}`);

    // Extract DOM inspection details
    const pageAnalysis = await page.evaluate(() => {
      // Inputs
      const inputs = Array.from(document.querySelectorAll('input')).map((el) => ({
        type: el.type,
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
        value: el.value,
        ariaLabel: el.getAttribute('aria-label'),
      }));

      // Buttons
      const buttons = Array.from(document.querySelectorAll('button')).map((el) => ({
        text: el.innerText.trim(),
        id: el.id,
        className: el.className,
        type: el.type,
      }));

      // Links (looking for Login / Sign In / Register / Google / SSO)
      const links = Array.from(document.querySelectorAll('a')).map((el) => ({
        text: el.innerText.trim(),
        href: el.href,
      })).filter((l) => l.text.length > 0 && l.text.length < 50);

      // Check for Google SSO iframes or buttons
      const googleBtns = Array.from(document.querySelectorAll('[data-provider="google"], [aria-label*="Google"], .google-btn, button:has(svg)'))
        .map((el) => el.innerText || el.getAttribute('aria-label') || 'Google element');

      return {
        inputs,
        buttons,
        links: links.slice(0, 20),
        googleBtns,
        bodyTextSnippet: document.body.innerText.slice(0, 1000),
      };
    });

    console.log('\n--- ANALYSIS RESULTS ---');
    console.log(JSON.stringify(pageAnalysis, null, 2));

    fs.writeFileSync('newton_analysis.json', JSON.stringify({ currentUrl, title, ...pageAnalysis }, null, 2));
  } catch (err) {
    console.error('Puppeteer inspection failed:', err);
  } finally {
    await browser.close();
  }
}

inspectNewtonSchool();
