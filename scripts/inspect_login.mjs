import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function inspectLogin() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  try {
    const page = await browser.newPage();
    const loginUrl = 'https://my.newtonschool.co/login?next=/course/0rsk0a0teyqh/details';
    console.log(`Navigating to: ${loginUrl}`);

    await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    const screenshotPath = path.resolve('public', 'newton_login_screen.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const loginDetails = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map((el) => ({
        type: el.type,
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
        value: el.value,
      }));

      const buttons = Array.from(document.querySelectorAll('button')).map((el) => ({
        text: el.innerText.trim(),
        className: el.className,
      }));

      return {
        url: window.location.href,
        inputs,
        buttons,
        bodySnippet: document.body.innerText.slice(0, 1000),
      };
    });

    console.log('\n--- LOGIN PAGE DETAILS ---');
    console.log(JSON.stringify(loginDetails, null, 2));
    fs.writeFileSync('newton_login_analysis.json', JSON.stringify(loginDetails, null, 2));
  } finally {
    await browser.close();
  }
}

inspectLogin();
