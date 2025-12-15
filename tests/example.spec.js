// tests/example.spec.js
const { test, expect } = require('@playwright/test');

test('Home page loads and shows login button', async ({ page }) => {
  // 1. Go to the local React URL
  await page.goto('http://localhost:5173');

  // 2. Check if the browser title contains "Poker" (or Vite/React App)
  // You might need to check index.html <title> to be sure, 
  // but let's check for the visual text on the page.
  
  // 3. Look for the "Sign in" button or main heading
  // (We use a flexible locator that looks for text)
  const loginButton = page.getByText('Sign in with Google');
  
  // 4. Verify it is visible
  await expect(loginButton).toBeVisible();
});