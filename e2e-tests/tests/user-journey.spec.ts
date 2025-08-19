import { test, expect } from '@playwright/test';

test.describe('User Journey Tests', () => {
  test('Complete user registration and puzzle ordering flow', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/PuzzleCraft/);

    // Register new user
    await page.click('text=Εγγραφή');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'testpassword123');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.click('button[type="submit"]');

    // Wait for registration success
    await expect(page.locator('text=Επιτυχής εγγραφή')).toBeVisible();

    // Navigate to predefined puzzles
    await page.click('text=Προκαθορισμένα Puzzles');
    await expect(page).toHaveTitle(/Προκαθορισμένα/);

    // Select a puzzle
    await page.click('[data-testid="puzzle-card"]:first-child');
    await expect(page.locator('text=Προσθήκη στο καλάθι')).toBeVisible();

    // Add to cart
    await page.click('text=Προσθήκη στο καλάθι');
    await expect(page.locator('text=Προστέθηκε στο καλάθι')).toBeVisible();

    // Go to cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('text=Το καλάθι σας')).toBeVisible();

    // Proceed to checkout
    await page.click('text=Ολοκλήρωση παραγγελίας');
    await expect(page.locator('text=Στοιχεία αποστολής')).toBeVisible();

    // Fill shipping details
    await page.fill('input[name="street"]', 'Test Street 123');
    await page.fill('input[name="city"]', 'Athens');
    await page.fill('input[name="postalCode"]', '12345');
    await page.selectOption('select[name="country"]', 'Greece');

    // Complete order
    await page.click('text=Ολοκλήρωση παραγγελίας');
    await expect(page.locator('text=Η παραγγελία δημιουργήθηκε επιτυχώς')).toBeVisible();
  });

  test('Admin panel functionality', async ({ page }) => {
    // Login as admin
    await page.goto('/admin');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Verify admin dashboard
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();

    // Check orders management
    await page.click('text=Διαχείριση Παραγγελιών');
    await expect(page.locator('text=Όλες οι παραγγελίες')).toBeVisible();

    // Check analytics
    await page.click('text=Analytics');
    await expect(page.locator('text=Analytics Dashboard')).toBeVisible();
  });

  test('Puzzle customization flow', async ({ page }) => {
    await page.goto('/customize');

    // Upload image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Επιλογή εικόνας');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('test-image.jpg');

    // Configure puzzle
    await page.selectOption('select[name="pieces"]', '500');
    await page.selectOption('select[name="material"]', 'wood');
    await page.selectOption('select[name="size"]', '40x60');

    // Preview puzzle
    await page.click('text=Προεπισκόπηση');
    await expect(page.locator('canvas')).toBeVisible();

    // Add to cart
    await page.click('text=Προσθήκη στο καλάθι');
    await expect(page.locator('text=Προστέθηκε στο καλάθι')).toBeVisible();
  });

  test('Responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    
    // Check mobile menu
    await page.click('[data-testid="mobile-menu"]');
    await expect(page.locator('text=Προκαθορισμένα Puzzles')).toBeVisible();

    // Test mobile navigation
    await page.click('text=Προκαθορισμένα Puzzles');
    await expect(page).toHaveTitle(/Προκαθορισμένα/);
  });

  test('Error handling and validation', async ({ page }) => {
    await page.goto('/');

    // Test invalid login
    await page.click('text=Σύνδεση');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Μη έγκυρο email')).toBeVisible();

    // Test form validation
    await page.goto('/customize');
    await page.click('text=Προσθήκη στο καλάθι');
    await expect(page.locator('text=Παρακαλώ επιλέξτε μια εικόνα')).toBeVisible();
  });

  test('Performance and loading states', async ({ page }) => {
    await page.goto('/');

    // Check loading states
    await page.click('text=Προκαθορισμένα Puzzles');
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

    // Wait for content to load
    await expect(page.locator('[data-testid="puzzle-grid"]')).toBeVisible();

    // Check performance metrics
    const performance = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      };
    });

    expect(performance.loadTime).toBeLessThan(3000); // 3 seconds
    expect(performance.domContentLoaded).toBeLessThan(2000); // 2 seconds
  });
});
