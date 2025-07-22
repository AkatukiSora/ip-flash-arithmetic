import { test, expect } from '@playwright/test';

test.describe('基本的なページ機能', () => {
  test('ホームページが正常に表示される', async ({ page }) => {
    await page.goto('/');
    
    // ページタイトルとメインコンテンツが表示される
    await expect(page.locator('h1')).toContainText('IP Flush Arithmetic');
    await expect(page.getByRole('link', { name: '🧠 クイズ' })).toBeVisible();
    await expect(page.getByRole('link', { name: '📚 練習' })).toBeVisible();
    await expect(page.getByRole('link', { name: '🧮 計算機' })).toBeVisible();
  });

  test('クイズページが正常に表示される', async ({ page }) => {
    await page.goto('/quiz');
    
    // クイズセットアップ画面が表示される
    await expect(page.locator('h1')).toContainText('クイズ設定');
    await expect(page.locator('h2')).toContainText('出題範囲を選択');
    
    // 問題タイプのチェックボックスが表示される
    await expect(page.locator('input[type="checkbox"]').first()).toBeVisible();
  });

  test('練習ページが正常に表示される', async ({ page }) => {
    await page.goto('/practice');
    
    // 練習ページのコンテンツが表示される
    await expect(page.locator('h1')).toContainText('練習モード');
  });

  test('計算機ページが正常に表示される', async ({ page }) => {
    await page.goto('/calculator');
    
    // 計算機ページのコンテンツが表示される
    await expect(page.locator('h1')).toContainText('IP計算機');
  });

  test('ナビゲーションが正常に動作する', async ({ page }) => {
    await page.goto('/');
    
    // クイズページへのナビゲーション
    await page.getByRole('link', { name: '🧠 クイズ' }).click();
    await expect(page).toHaveURL('/quiz');
    
    // ホームに戻る
    await page.getByRole('link', { name: '← 戻る' }).click();
    await expect(page).toHaveURL('/');
    
    // 練習ページへのナビゲーション
    await page.getByRole('link', { name: '📚 練習' }).click();
    await expect(page).toHaveURL('/practice');
    
    // ホームに戻る
    await page.getByRole('link', { name: '← 戻る' }).click();
    await expect(page).toHaveURL('/');
    
    // 計算機ページへのナビゲーション
    await page.getByRole('link', { name: '🧮 計算機' }).click();
    await expect(page).toHaveURL('/calculator');
  });

  test('計算機の基本機能が動作する', async ({ page }) => {
    await page.goto('/calculator');
    
    // 入力フィールドが表示される
    await expect(page.locator('input[placeholder*="IPアドレス"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="CIDR"]')).toBeVisible();
    
    // IPアドレスとCIDRを入力
    await page.fill('input[placeholder*="IPアドレス"]', '192.168.1.100');
    await page.fill('input[placeholder*="CIDR"]', '24');
    
    // 計算実行ボタンをクリック
    await page.getByRole('button', { name: '計算実行' }).click();
    
    // 結果が表示される
    await expect(page.locator('text=ネットワークアドレス')).toBeVisible();
  });
});
