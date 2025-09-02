import { test, expect } from '@playwright/test';
import path from 'path';

// Visual testing for identifying UI inconsistencies
test.describe('Visual Inconsistencies Testing', () => {
  const screenshotDir = path.join(__dirname, '../../test-results/visual-screenshots');

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('1. Filter accordion transparency and overlapping issues', async ({ page }) => {
    // Take screenshot of homepage with filters
    await page.screenshot({ 
      path: path.join(screenshotDir, '1-homepage-initial.png'),
      fullPage: true 
    });

    // Look for filter elements
    const filterButton = page.locator('[data-testid="filter-button"], .filter-button, button:has-text("Filter")');
    const filterAccordion = page.locator('[data-testid="filter-accordion"], .filter-accordion, .accordion');
    
    // Try to open filters if they exist
    if (await filterButton.count() > 0) {
      await filterButton.first().click();
      await page.waitForTimeout(1000);
      
      // Take screenshot with filters open
      await page.screenshot({ 
        path: path.join(screenshotDir, '1-filters-open.png'),
        fullPage: true 
      });
      
      // Check for transparency issues
      const filterContainer = page.locator('.filter-container, .filters, [class*="filter"]').first();
      if (await filterContainer.count() > 0) {
        const styles = await filterContainer.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            opacity: computed.opacity,
            backgroundColor: computed.backgroundColor,
            zIndex: computed.zIndex,
            position: computed.position
          };
        });
        
        console.log('Filter container styles:', styles);
      }
    }
    
    // Document findings
    console.log('✓ Filter accordion transparency test completed');
  });

  test('2. Sign-in and sign-up buttons styling inconsistencies', async ({ page }) => {
    // Navigate to auth pages and capture button styling
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of sign-in page
    await page.screenshot({ 
      path: path.join(screenshotDir, '2-signin-page.png'),
      fullPage: true 
    });
    
    // Check sign-in button styling
    const signinButton = page.locator('button:has-text("Sign in"), button:has-text("Login"), [type="submit"]');
    if (await signinButton.count() > 0) {
      const buttonStyles = await signinButton.first().evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          border: computed.border,
          borderRadius: computed.borderRadius,
          padding: computed.padding,
          fontSize: computed.fontSize
        };
      });
      console.log('Sign-in button styles:', buttonStyles);
    }
    
    // Navigate to sign-up page
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '2-signup-page.png'),
      fullPage: true 
    });
    
    // Check sign-up button styling
    const signupButton = page.locator('button:has-text("Sign up"), button:has-text("Register"), [type="submit"]');
    if (await signupButton.count() > 0) {
      const buttonStyles = await signupButton.first().evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          border: computed.border,
          borderRadius: computed.borderRadius,
          padding: computed.padding,
          fontSize: computed.fontSize
        };
      });
      console.log('Sign-up button styles:', buttonStyles);
    }
    
    console.log('✓ Auth buttons styling test completed');
  });

  test('3. Color inconsistency on sign-in page vs other pages', async ({ page }) => {
    // Capture homepage colors
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const homepageColors = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color
      };
    });
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '3-homepage-colors.png'),
      fullPage: true 
    });
    
    // Capture sign-in page colors
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    
    const signinColors = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color
      };
    });
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '3-signin-colors.png'),
      fullPage: true 
    });
    
    console.log('Homepage colors:', homepageColors);
    console.log('Sign-in page colors:', signinColors);
    
    // Compare colors
    const colorMismatch = homepageColors.backgroundColor !== signinColors.backgroundColor ||
                         homepageColors.color !== signinColors.color;
    
    if (colorMismatch) {
      console.log('⚠️ Color inconsistency detected between homepage and sign-in page');
    }
    
    console.log('✓ Color consistency test completed');
  });

  test('4. Home page color change after user sign-in', async ({ page }) => {
    // Take screenshot before sign-in
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '4-homepage-before-signin.png'),
      fullPage: true 
    });
    
    const beforeSigninColors = await page.evaluate(() => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color
      };
    });
    
    // Attempt to sign in (this would require actual auth setup)
    // For now, we'll simulate by checking if there's a sign-in link
    const signinLink = page.locator('a:has-text("Sign in"), a:has-text("Login")');
    if (await signinLink.count() > 0) {
      await signinLink.first().click();
      await page.waitForLoadState('networkidle');
      
      // Navigate back to homepage to check colors after auth attempt
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({ 
        path: path.join(screenshotDir, '4-homepage-after-signin-attempt.png'),
        fullPage: true 
      });
    }
    
    console.log('Before sign-in colors:', beforeSigninColors);
    console.log('✓ Homepage color change test completed');
  });

  test('5. Admin dashboard accessibility problems', async ({ page }) => {
    // Try to access admin dashboard
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '5-admin-dashboard.png'),
      fullPage: true 
    });
    
    // Check for accessibility issues
    const accessibilityIssues = await page.evaluate(() => {
      const issues: string[] = [];
      
      // Check for missing alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt) {
          issues.push(`Image ${index + 1} missing alt text`);
        }
      });
      
      // Check for missing labels on form inputs
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const hasLabel = document.querySelector(`label[for="${input.id}"]`) || 
                        input.closest('label') ||
                        input.getAttribute('aria-label') ||
                        input.getAttribute('aria-labelledby');
        if (!hasLabel) {
          issues.push(`Form input ${index + 1} missing label`);
        }
      });
      
      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      headings.forEach((heading, index) => {
        const currentLevel = parseInt(heading.tagName.charAt(1));
        if (currentLevel > previousLevel + 1) {
          issues.push(`Heading hierarchy skip detected at heading ${index + 1}`);
        }
        previousLevel = currentLevel;
      });
      
      return issues;
    });
    
    console.log('Accessibility issues found:', accessibilityIssues);
    console.log('✓ Admin dashboard accessibility test completed');
  });

  test('6. Navigation bar misalignment when user is logged in', async ({ page }) => {
    // Test navigation bar in logged-out state
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '6-navbar-logged-out.png'),
      fullPage: false 
    });
    
    const navbarLoggedOut = await page.locator('nav, .navbar, header').first().evaluate(el => {
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);
      return {
        width: rect.width,
        height: rect.height,
        display: computed.display,
        justifyContent: computed.justifyContent,
        alignItems: computed.alignItems,
        padding: computed.padding
      };
    });
    
    // Simulate logged-in state by checking for user menu or profile
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, .profile-menu');
    if (await userMenu.count() > 0) {
      await page.screenshot({ 
        path: path.join(screenshotDir, '6-navbar-logged-in.png'),
        fullPage: false 
      });
    }
    
    console.log('Navigation bar (logged out) styles:', navbarLoggedOut);
    console.log('✓ Navigation bar alignment test completed');
  });

  test('7. Missing home page navigation option from settings page', async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: path.join(screenshotDir, '7-settings-page.png'),
      fullPage: true 
    });
    
    // Check for home navigation options
    const homeLinks = await page.locator('a[href="/"], a:has-text("Home"), a:has-text("Homepage")').count();
    const breadcrumbs = await page.locator('.breadcrumb, .breadcrumbs, nav[aria-label="breadcrumb"]').count();
    const backButton = await page.locator('button:has-text("Back"), .back-button, [aria-label="Go back"]').count();
    
    console.log(`Home navigation options found:`);
    console.log(`- Home links: ${homeLinks}`);
    console.log(`- Breadcrumbs: ${breadcrumbs}`);
    console.log(`- Back buttons: ${backButton}`);
    
    if (homeLinks === 0 && breadcrumbs === 0 && backButton === 0) {
      console.log('⚠️ No home navigation options found on settings page');
    }
    
    console.log('✓ Settings page navigation test completed');
  });

  test.afterAll(async () => {
    console.log('\n=== VISUAL TESTING SUMMARY ===');
    console.log('All visual inconsistency tests completed.');
    console.log('Screenshots saved to: test-results/visual-screenshots/');
    console.log('Review the screenshots and console logs for detailed findings.');
  });
});