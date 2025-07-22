import { test, expect } from '@playwright/test';

test.describe('IPフラッシュ計算アプリ - ユーザーストーリー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ユーザーストーリー1: 新規ユーザーがアプリを初めて使用する', async ({ page }) => {
    // ホームページが正しく表示される
    await expect(page.locator('h1')).toContainText('IP Flush Arithmetic');
    await expect(page.locator('text=IPアドレス計算の練習アプリ')).toBeVisible();
    
    // ナビゲーションメニューがモバイルフレンドリーである
    await expect(page.locator('nav')).toBeVisible();
    
    // 各機能へのリンクが表示される
    // 静的サイトなのでランキング機能は削除済み
    await expect(page.getByRole('link', { name: '🧠 クイズ' })).toBeVisible();
    await expect(page.getByRole('link', { name: '📚 練習' })).toBeVisible();
    await expect(page.getByRole('link', { name: '🧮 計算機' })).toBeVisible();
  });

  test('ユーザーストーリー2: クイズに挑戦して学習する', async ({ page }) => {
    // クイズページに移動
    await page.getByRole('link', { name: '🧠 クイズ' }).click();
    await expect(page).toHaveURL(/\/quiz\/?/);
    
    // クイズの種類を選択
    await page.selectOption('select[name="questionType"]', 'BINARY_IP_CONVERSION');
    
    // 問題が表示される
    await expect(page.locator('text=2進数表記')).toBeVisible();
    
    // 選択肢が4つ表示される
    const choices = page.locator('button[data-testid^="choice-"]');
    await expect(choices).toHaveCount(4);
    
    // 選択肢をクリックして回答
    await choices.first().click();
    
    // 結果が表示される
    const resultElement = page.locator('text=正解, text=不正解');
    await expect(resultElement.first()).toBeVisible();
    
    // 次の問題ボタンが表示される
    await expect(page.locator('text=次の問題')).toBeVisible();
    
    // スコアが表示される
    await expect(page.locator('text=スコア')).toBeVisible();
  });

  test('ユーザーストーリー3: 新しいホストアドレス判定問題を解く', async ({ page }) => {
    await page.goto('/quiz');
    
    // ホストアドレス判定問題を選択
    await page.selectOption('select[name="questionType"]', 'HOST_IN_NETWORK');
    
    // 問題文が正しく表示される
    await expect(page.locator('text=ネットワーク').first()).toBeVisible();
    await expect(page.locator('text=有効なホストアドレスを選択')).toBeVisible();
    
    // 選択肢が表示される
    const choices = page.locator('button[data-testid^="choice-"]');
    await expect(choices).toHaveCount(4);
    
    // 回答後に解説が表示される
    await choices.first().click();
    await expect(page.locator('text=ネットワークアドレス')).toBeVisible();
    await expect(page.locator('text=ブロードキャストアドレス')).toBeVisible();
  });

  test('ユーザーストーリー4: 練習モードで反復学習する', async ({ page }) => {
    await page.getByRole('link', { name: '📚 練習' }).click();
    await expect(page).toHaveURL(/\/practice\/?/);
    
    // 練習問題の種類を選択
    await page.click('text=ネットワークアドレス計算');
    
    // 問題が表示される
    await expect(page.locator('text=ネットワークアドレス')).toBeVisible();
    
    // 複数の問題を連続で解ける
    for (let i = 0; i < 3; i++) {
      const choices = page.locator('button[data-testid^="choice-"]');
      await choices.first().click();
      
      // 結果確認後、次の問題へ
      if (await page.locator('text=次の問題').isVisible()) {
        await page.click('text=次の問題');
      }
    }
  });

  test('ユーザーストーリー5: 計算機機能でサブネット計算する', async ({ page }) => {
    await page.getByRole('link', { name: '🧮 計算機' }).click();
    await expect(page).toHaveURL(/\/calculator\/?/);
    
    // サブネット計算モードに切り替え
    await page.click('text=サブネット計算');
    
    // IPアドレス入力
    await page.fill('input[name="ipAddress"]', '192.168.1.10');
    await page.fill('input[name="cidr"]', '24');
    
    // 計算実行
    await page.getByRole('button', { name: '計算', exact: true }).click();
    
    // 結果が表示される
    await expect(page.locator('text=ネットワークアドレス')).toBeVisible();
    await expect(page.locator('text=ブロードキャスト')).toBeVisible();
    await expect(page.locator('text=利用可能ホスト数')).toBeVisible();
  });

  test.skip('ユーザーストーリー6: スコア保存機能の確認（ランキングは静的サイトのため削除済み）', async ({ page }) => {
    // 静的サイト化によりランキング機能は削除されました
    // ローカルストレージでのスコア保存のみテスト
    await page.click('text=クイズ');
    await page.selectOption('select[name="questionType"]', 'CIDR_TO_SUBNET');
    
    // 5問解く
    for (let i = 0; i < 5; i++) {
      const choices = page.locator('button[data-testid^="choice-"]');
      await choices.first().click();
      
      if (await page.locator('text=次の問題').isVisible()) {
        await page.click('text=次の問題');
      }
    }
    
    // スコア保存ダイアログが表示される
    if (await page.locator('text=スコアを保存').isVisible()) {
      await page.fill('input[name="playerName"]', 'テストユーザー');
      await page.click('text=保存');
    }
    
    // ランキングページに移動（削除予定のため無効化）
    // await page.getByRole('link', { name: '🏆 ランキング' }).click();
    // await expect(page).toHaveURL('/ranking');
    
    // ランキング表が表示される（削除予定のため無効化）
    // await expect(page.locator('text=順位')).toBeVisible();
    // await expect(page.locator('text=プレイヤー名')).toBeVisible();
    // await expect(page.locator('text=スコア')).toBeVisible();
  });

  test('ユーザーストーリー7: モバイルデバイスでの使いやすさ', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    // ページが正しく表示される
    await expect(page.locator('h1')).toBeVisible();
    
    // ナビゲーションがモバイル対応している
    await expect(page.locator('nav')).toBeVisible();
    
    // クイズページでタッチ操作が正常に動作する
    await page.click('text=クイズ');
    const choices = page.locator('button[data-testid^="choice-"]');
    
    // ボタンが十分なタッチエリアを持つ
    const firstChoice = choices.first();
    const boundingBox = await firstChoice.boundingBox();
    expect(boundingBox!.height).toBeGreaterThan(40); // 最小44pxのタッチエリア
  });

  test('ユーザーストーリー8: アプリの応答性とパフォーマンス', async ({ page }) => {
    // ページ読み込み時間をテスト
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // 2秒以内に読み込まれることを確認
    expect(loadTime).toBeLessThan(2000);
    
    // クイズ問題生成の速度をテスト
    await page.click('text=クイズ');
    
    const questionStartTime = Date.now();
    await page.selectOption('select[name="questionType"]', 'BINARY_IP_CONVERSION');
    const questionLoadTime = Date.now() - questionStartTime;
    
    // 問題生成が1秒以内に完了することを確認
    expect(questionLoadTime).toBeLessThan(1000);
    
    // 選択肢が表示される
    await expect(page.locator('button[data-testid^="choice-"]')).toHaveCount(4);
  });
});
