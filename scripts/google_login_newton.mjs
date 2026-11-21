import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function launchGoogleLogin() {
  const profileDir = path.resolve('.newton-chrome-profile');
  fs.mkdirSync(profileDir, { recursive: true });

  console.log('🌐 Launching Chrome with Google Sign-In support...');
  console.log(`📁 User session directory: ${profileDir}`);

  const browser = await puppeteer.launch({
    headless: false, // Visible browser so Google allows OAuth and you can select your account
    defaultViewport: null,
    userDataDir: profileDir, // Persists your Google login across sessions!
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled', // Prevents "This browser may not be secure" block
      '--start-maximized',
    ],
  });

  try {
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    // Prevent detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    const targetUrl = 'https://my.newtonschool.co/register?next=/course/0rsk0a0teyqh/details';
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    console.log('\n======================================================');
    console.log('👉 A Chrome window is open on your screen.');
    console.log('👉 Click "Sign in with Google" or select your account.');
    console.log('👉 Once you complete Google Sign-in, this script will');
    console.log('   automatically capture your session and save it!');
    console.log('======================================================\n');

    // Wait until user is redirected into the course or dashboard (up to 3 minutes)
    await page.waitForFunction(
      () => {
        const u = window.location.href;
        return (
          u.includes('/course/0rsk0a0teyqh') ||
          u.includes('/dashboard') ||
          (u.includes('my.newtonschool.co') && !u.includes('/login') && !u.includes('/register'))
        );
      },
      { timeout: 180000, polling: 1000 }
    );

    const loggedInUrl = page.url();
    console.log(`\n🎉 Successfully authenticated via Google!`);
    console.log(`Current URL: ${loggedInUrl}`);

    // Wait for the course page content to load
    await new Promise((r) => setTimeout(r, 4000));

    // Save session cookies
    const cookies = await page.cookies();
    const cookiesPath = path.resolve('public', 'newton_session.json');
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log(`💾 Session cookies saved to: ${cookiesPath}`);

    // Capture screenshot of authenticated course page
    const screenshotPath = path.resolve('public', 'newton_authenticated_course.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Course screenshot saved to: ${screenshotPath}`);

    // Extract course content
    const courseInfo = await page.evaluate(() => {
      return {
        title: document.title,
        textSnippet: document.body.innerText.slice(0, 1500),
      };
    });

    console.log('\n--- EXTRACTED COURSE DATA ---');
    console.log(JSON.stringify(courseInfo, null, 2));

    return {
      success: true,
      url: loggedInUrl,
      courseInfo,
    };
  } catch (err) {
    console.error('Google login process error:', err.message);
    return { success: false, error: err.message };
  } finally {
    // Keep browser open for a few seconds so user sees the course loaded
    await new Promise((r) => setTimeout(r, 4000));
    await browser.close();
    console.log('Browser session closed.');
  }
}

// Direct CLI execution
if (process.argv[1]?.endsWith('google_login_newton.mjs')) {
  launchGoogleLogin();
}
