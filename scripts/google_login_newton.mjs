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

    // Auto-click the Google button iframe
    console.log('Locating "Sign up with Google" button...');
    const googleIframe = await page.$('iframe[src*="accounts.google.com/gsi/button"]');
    if (googleIframe) {
      console.log('Found Google button iframe. Clicking...');
      const box = await googleIframe.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        console.log('✅ Clicked Google Sign-in button successfully!');
      }
    }

    console.log('\n======================================================');
    console.log('👉 Google Sign-in page is now open.');
    console.log('👉 Enter your Google email & password (or select account).');
    console.log('👉 Take your time — the script is waiting until you are');
    console.log('   fully redirected back to Newton School course details.');
    console.log('======================================================\n');

    // Wait until user is fully redirected BACK to my.newtonschool.co course or dashboard
    await page.waitForFunction(
      () => {
        const host = window.location.hostname;
        const path = window.location.pathname;

        // Must be on my.newtonschool.co (NOT accounts.google.com)
        if (host !== 'my.newtonschool.co') {
          return false;
        }

        // Must NOT be on /login or /register
        if (path.startsWith('/login') || path.startsWith('/register')) {
          return false;
        }

        // Must be on course page or dashboard
        return path.includes('/course/0rsk0a0teyqh') || path.includes('/dashboard') || path.length > 1;
      },
      { timeout: 300000, polling: 1000 } // 5 minutes wait
    );

    const loggedInUrl = page.url();
    console.log(`\n🎉 Authentication complete! Arrived back at Newton School:`);
    console.log(`Current URL: ${loggedInUrl}`);

    console.log('Waiting 5 seconds for course dashboard to fully render...');
    await new Promise((r) => setTimeout(r, 5000));

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
        links: Array.from(document.querySelectorAll('a')).map((a) => ({ text: a.innerText.trim(), href: a.href })).filter(l => l.text.length > 0 && l.text.length < 60),
        bodySnippet: document.body.innerText.slice(0, 2000),
      };
    });

    console.log('\n--- EXTRACTED COURSE DATA ---');
    console.log(JSON.stringify(courseInfo, null, 2));
    fs.writeFileSync('newton_course_data.json', JSON.stringify(courseInfo, null, 2));

    console.log('\n✅ Course data successfully extracted and saved!');
    return { success: true, url: loggedInUrl, courseInfo };
  } catch (err) {
    console.error('Google login error:', err.message);
    return { success: false, error: err.message };
  }
}

if (process.argv[1]?.endsWith('google_login_newton.mjs')) {
  launchGoogleLogin();
}
