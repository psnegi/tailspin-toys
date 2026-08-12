import { test, expect } from '@playwright/test';

test.describe('Games filtering', () => {
  test('category filter shows only matching games and updates count', async ({ page }) => {
    await page.goto('/');

    // Wait for the page and games grid to be available
    await page.getByTestId('games-grid').waitFor({ state: 'visible', timeout: 10000 });
    // Use a direct selector and wait for presence to avoid flaky test id resolution
    await page.waitForSelector('#category-filter', { timeout: 10000 });
    const categorySelect = page.locator('#category-filter');

    // Pick the first non-empty category option
    const firstCategoryOption = page.locator('#category-filter option').nth(1);
    const categoryValue = await firstCategoryOption.getAttribute('value');
    test.skip(!categoryValue, 'No categories available to test filtering');

    // Select the category
    await categorySelect.selectOption({ value: categoryValue! });

    // Count visible cards using computed style
    const visibleCount = await page.locator('[data-testid="game-card"]').evaluateAll((cards) =>
      cards.filter((c) => getComputedStyle(c).display !== 'none').length,
    );

    // Assert visible-count element matches
    const visibleCountEl = page.getByTestId('visible-count');
    await expect(visibleCountEl).toHaveText(String(visibleCount));

    // Ensure every visible card's data-game-category equals selected category
    const cards = page.locator('[data-testid="game-card"]');
    const total = await cards.count();
    for (let i = 0; i < total; i++) {
      const card = cards.nth(i);
      const isHidden = await card.evaluate((el) => getComputedStyle(el as Element).display === 'none');
      if (!isHidden) {
        const cardCategory = await card.getAttribute('data-game-category');
        expect(cardCategory).toBe(categoryValue);
      }
    }
  });

  test('publisher filter works in combination with category filter', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('games-grid').waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForSelector('#category-filter', { timeout: 10000 });
    await page.waitForSelector('#publisher-filter', { timeout: 10000 });
    const categorySelect = page.locator('#category-filter');
    const publisherSelect = page.locator('#publisher-filter');

    // Choose first non-empty category and publisher
    const firstCategory = page.locator('#category-filter option').nth(1);
    const firstPublisher = page.locator('#publisher-filter option').nth(1);
    const categoryValue = await firstCategory.getAttribute('value');
    const publisherValue = await firstPublisher.getAttribute('value');

    test.skip(!categoryValue || !publisherValue, 'Not enough categories/publishers to test combined filtering');

    await categorySelect.selectOption({ value: categoryValue! });
    await publisherSelect.selectOption({ value: publisherValue! });

    // Compute visible cards and assert they match both filters
    const cards = page.locator('[data-testid="game-card"]');
    const total = await cards.count();
    let visible = 0;
    for (let i = 0; i < total; i++) {
      const card = cards.nth(i);
      const hidden = await card.evaluate((el) => getComputedStyle(el as Element).display === 'none');
      if (!hidden) {
        visible += 1;
        const cardCategory = await card.getAttribute('data-game-category');
        const cardPublisher = await card.getAttribute('data-game-publisher');
        expect(cardCategory).toBe(categoryValue);
        expect(cardPublisher).toBe(publisherValue);
      }
    }

    const visibleCountEl = page.getByTestId('visible-count');
    await expect(visibleCountEl).toHaveText(String(visible));
  });

  test('clearing filters shows all games', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('games-grid').waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForSelector('#category-filter', { timeout: 10000 });
    await page.waitForSelector('#publisher-filter', { timeout: 10000 });
    const categorySelect = page.locator('#category-filter');
    const publisherSelect = page.locator('#publisher-filter');

    await expect(categorySelect).toBeVisible();
    await expect(publisherSelect).toBeVisible();

    // Select something then clear
    const firstCategory = page.locator('#category-filter option').nth(1);
    const categoryValue = await firstCategory.getAttribute('value');
    if (categoryValue) await categorySelect.selectOption({ value: categoryValue });

    // Clear both
    await categorySelect.selectOption({ value: '' });
    await publisherSelect.selectOption({ value: '' });

    // All cards should be visible
    const totalVisible = await page.locator('[data-testid="game-card"]').evaluateAll((cards) =>
      cards.filter((c) => getComputedStyle(c).display !== 'none').length,
    );

    const totalCards = await page.locator('[data-testid="game-card"]').count();
    expect(totalVisible).toBe(totalCards);

    const visibleCountEl = page.getByTestId('visible-count');
    await expect(visibleCountEl).toHaveText(String(totalCards));
  });
});
