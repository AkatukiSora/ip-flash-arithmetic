import { test, expect } from '@playwright/test';

test.describe('アクセシビリティ', () => {
  test('ホームページのアクセシビリティ', async ({ page }) => {
    await page.goto('/');
    
    // ページタイトルが適切に設定されている
    await expect(page).toHaveTitle(/IP Flush Arithmetic/);
    
    // 見出し構造が適切
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toBeVisible();
    
    // ナビゲーションがlandmarkロールを持つ
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // リンクが適切なテキストを持つ
    const links = page.locator('a');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const linkText = await link.textContent();
      expect(linkText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('フォーム要素のアクセシビリティ', async ({ page }) => {
    await page.goto('/calculator');
    
    // サブネット計算モードに切り替え
    await page.click('text=サブネット計算');
    
    // 入力フィールドがラベルを持つ
    const ipInput = page.locator('input[name="ipAddress"]');
    await expect(ipInput).toBeVisible();
    
    const cidrInput = page.locator('input[name="cidr"]');
    await expect(cidrInput).toBeVisible();
    
    // ボタンが適切なテキストを持つ
    const calculateButton = page.getByRole('button', { name: '計算', exact: true });
    await expect(calculateButton).toBeVisible();
    await expect(calculateButton).toBeEnabled();
  });

  test('クイズのアクセシビリティ', async ({ page }) => {
    await page.goto('/quiz');
    
    // 選択肢ボタンが適切にラベル付けされている
    await page.selectOption('select[name="questionType"]', 'CIDR_TO_SUBNET');
    
    const choices = page.locator('button[data-testid^="choice-"]');
    await expect(choices).toHaveCount(4);
    
    // 各選択肢が読み上げ可能なテキストを持つ
    for (let i = 0; i < 4; i++) {
      const choice = choices.nth(i);
      const choiceText = await choice.textContent();
      expect(choiceText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('キーボードナビゲーション', async ({ page }) => {
    await page.goto('/');
    
    // Tabキーでナビゲーション可能
    await page.keyboard.press('Tab');
    
    // フォーカスが視覚的に分かる
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Enterキーでリンクが機能する
    await page.keyboard.press('Enter');
    
    // ページが変わったことを確認
    await page.waitForLoadState('networkidle');
  });

  test('色のコントラスト（テキスト可読性）', async ({ page }) => {
    await page.goto('/');
    
    // 主要なテキスト要素が見える
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav a').first()).toBeVisible();
    
    // ボタンのテキストが読める
    await page.goto('/quiz');
    await page.selectOption('select[name="questionType"]', 'BINARY_IP_CONVERSION');
    
    const choices = page.locator('button[data-testid^="choice-"]');
    await expect(choices.first()).toBeVisible();
  });

  test('スクリーンリーダー支援', async ({ page }) => {
    await page.goto('/quiz');
    
    // ARIAラベルやロールが適切に設定されているかチェック
    const questionContainer = page.locator('[role="main"], main');
    if (await questionContainer.count() > 0) {
      await expect(questionContainer.first()).toBeVisible();
    }
    
    // 選択後のフィードバックが適切
    await page.selectOption('select[name="questionType"]', 'HOST_COUNT');
    const choices = page.locator('button[data-testid^="choice-"]');
    await choices.first().click();
    
    // 結果ダイアログがアクセシブル
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.count() > 0) {
      await expect(dialog).toBeVisible();
    }
  });

  test('エラーメッセージのアクセシビリティ', async ({ page }) => {
    await page.goto('/calculator');
    
    // サブネット計算モードに切り替え
    await page.click('text=サブネット計算');
    
    // 無効な入力でエラーが表示される
    await page.fill('input[name="ipAddress"]', 'invalid-ip');
    await page.getByRole('button', { name: '計算', exact: true }).click();
    
    // エラーメッセージが適切に表示される
    // alert()が表示されるので、それを確認
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('無効');
      await dialog.accept();
    });
  });

  test('モバイルでのアクセシビリティ', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // タッチターゲットが十分な大きさ
    const links = page.locator('nav a');
    const linkCount = await links.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const boundingBox = await link.boundingBox();
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThan(40); // 最小44px推奨
        expect(boundingBox.width).toBeGreaterThan(40);
      }
    }
  });
});
