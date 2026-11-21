import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function launchGoogleLogin() {
  const profileDir = path.resolve('.newton-chrome-profile');
  fs.mkdirSync(profileDir, { recursive: true });

  console.log('🌐 Launching Chrome with Google Sign-In automation...');
  console.log(`📁 User session directory: ${profileDir}`);

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: profileDir,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--start-maximized',
    ],
  });

  try {
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    // Remove webdriver flag
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    const targetUrl = 'https://my.newtonschool.co/register?next=/course/0rsk0a0teyqh/details';
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    console.log('Waiting 3 seconds for Google Identity Service button to render...');
    await new Promise((r) => setTimeout(r, 3000));

    // Listen for new popup window (Google OAuth Account Chooser)
    browser.on('targetcreated', async (target) => {
      if (target.type() === 'page') {
        const popupPage = await target.page();
        if (popupPage) {
          const popupUrl = popupPage.url();
          console.log(`\n🔔 Google Sign-In Popup Opened: ${popupUrl}`);
        }
      }
    });

    // Auto-click the Google button iframe
    console.log('Locating "Sign up with Google" button...');
    let clicked = false;

    // Try finding iframe
    const googleIframe = await page.$('iframe[src*="accounts.google.com/gsi/button"]');
    if (googleIframe) {
      console.log('Found Google button iframe. Clicking...');
      const box = await googleIframe.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        clicked = true;
        console.log('✅ Clicked Google Sign-in button successfully!');
      }
    }

    if (!clicked) {
      // Fallback: look for any button/div containing "Google"
      console.log('Trying fallback selectors for Google button...');
      await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('*'));
        const gEl = els.find((el) => {
          const t = el.innerText || '';
          return t.toLowerCase().includes('google') && el.children.length === 0;
        });
        if (gEl) gEl.click();
      });
    }

    console.log('\n======================================================');
    console.log('👉 Google Sign-in has been clicked.');
    console.log('👉 Select your Google account in the popup window.');
    console.log('👉 Once redirected to your course details, the session');
    console.log('   will be automatically extracted.');
    console.log('======================================================\n');

    // Wait until redirected to course details or dashboard
    await page.waitForFunction(
      () => {
        const u = window.location.href;
        return (
          u.includes('/course/0rsk0a0teyqh') ||
          (u.includes('my.newtonschool.co') && !u.includes('/login') && !u.includes('/register'))
        );
      },
      { timeout: 180000, polling: 1000 }
    );

    const loggedInUrl = page.url();
    console.log(`\n🎉 Successfully authenticated into Newton School!`);
    console.log(`Current URL: ${loggedInUrl}`);

    await new Promise((r) => setTimeout(r, 4000));

    // Save cookies
    const cookies = await page.cookies();
    const cookiesPath = path.resolve('public', 'newton_session.json');
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log(`💾 Saved session cookies to: ${cookiesPath}`);

    // Take screenshot of authenticated course page
    const screenshotPath = path.resolve('public', 'newton_authenticated_course.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Saved course screenshot to: ${screenshotPath}`);

    // Extract course data
    const courseInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        headings: Array.from(document.querySelectorAll('h1, h2, h3, h4')).map((h) => h.innerText.trim()),
        bodySnippet: document.body.innerText.slice(0, 1500),
      };
    });

    console.log('\n--- EXTRACTED COURSE DATA ---');
    console.log(JSON.stringify(courseInfo, null, 2));

    return { success: true, url: loggedInUrl, courseInfo };
  } catch (err) {
    console.error('Google login error:', err.message);
    return { success: false, error: err.message };
  }
}

if (process.argv[1]?.endsWith('google_login_newton.mjs')) {
  launchGoogleLogin();
}
