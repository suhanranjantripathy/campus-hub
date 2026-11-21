import puppeteer from 'puppeteer';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campushub';

export async function loginNewtonSchool({ email, password, headless = true }) {
  console.log('🚀 Starting Puppeteer browser for Newton School login...');
  const browser = await puppeteer.launch({
    headless: headless ? 'new' : false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const loginUrl = 'https://my.newtonschool.co/login?next=/course/0rsk0a0teyqh/details';

  try {
    console.log(`Navigating to ${loginUrl}...`);
    await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 45000 });

    // Wait for the email and password fields
    await page.waitForSelector('#email', { timeout: 15000 });
    await page.waitForSelector('#password', { timeout: 15000 });

    console.log(`Filling credentials for: ${email}`);
    // Clear & type email
    await page.click('#email', { clickCount: 3 });
    await page.type('#email', email, { delay: 30 });

    // Clear & type password
    await page.click('#password', { clickCount: 3 });
    await page.type('#password', password, { delay: 30 });

    // Find and click the "Login" submit button
    console.log('Submitting login form...');
    const loginButton = await page.$('button[type="submit"]') ||
      (await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.find((b) => b.innerText.trim().toLowerCase() === 'login') || btns[btns.length - 1];
      }));

    if (loginButton) {
      await loginButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // Wait for navigation after login
    console.log('Waiting for authentication response...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {
      console.log('Navigation completed or dynamic redirect detected.');
    });

    const currentUrl = page.url();
    console.log(`Post-login URL: ${currentUrl}`);

    // Take screenshot of result
    await page.screenshot({ path: path.resolve('public', 'newton_logged_in.png'), fullPage: true });

    // Check for login error messages
    const errorText = await page.evaluate(() => {
      const errEl = document.querySelector('.error-message, [role="alert"], .text-danger, .sc-error');
      return errEl ? errEl.innerText.trim() : null;
    });

    if (errorText) {
      console.error(`Login error on page: ${errorText}`);
      return { success: false, error: errorText, url: currentUrl };
    }

    // Check if successfully arrived at dashboard/course
    const isSuccess = !currentUrl.includes('/login') && !currentUrl.includes('/register');

    if (isSuccess) {
      console.log('✅ Authentication successful! Navigated into course/dashboard.');
      
      // Extract cookies for authenticated session reuse
      const cookies = await page.cookies();

      // Extract course content snippet
      const pageData = await page.evaluate(() => {
        return {
          title: document.title,
          headings: Array.from(document.querySelectorAll('h1, h2, h3, h4')).map((h) => h.innerText.trim()),
          modules: Array.from(document.querySelectorAll('[class*="course"], [class*="module"], [class*="batch"]')).map((el) => el.innerText.trim().slice(0, 100)),
        };
      });

      return {
        success: true,
        url: currentUrl,
        cookies,
        pageData,
      };
    } else {
      return {
        success: false,
        error: 'Still on auth page — please check your credentials or 2FA/OTP requirements',
        url: currentUrl,
      };
    }
  } catch (error) {
    console.error('Puppeteer login error:', error);
    await page.screenshot({ path: path.resolve('public', 'newton_error.png') }).catch(() => {});
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// CLI direct execution support: node scripts/login_and_sync_newton.mjs <email> <password>
if (process.argv[1]?.endsWith('login_and_sync_newton.mjs')) {
  const email = process.argv[2] || process.env.NEWTON_EMAIL;
  const password = process.argv[3] || process.env.NEWTON_PASSWORD;

  if (!email || !password) {
    console.log('\nUsage:');
    console.log('  node scripts/login_and_sync_newton.mjs <your-email> <your-password>');
    console.log('  or set NEWTON_EMAIL and NEWTON_PASSWORD in .env.local\n');
    process.exit(0);
  }

  loginNewtonSchool({ email, password, headless: false }).then((res) => {
    console.log('\n--- EXECUTION RESULT ---');
    console.log(JSON.stringify(res, null, 2));
  });
}
