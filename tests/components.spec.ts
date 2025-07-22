import { test, expect } from '@playwright/test';

test.describe('ホームページコンポーネント', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ヘッダーコンポーネントが正しく表示される', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('IP Flush Arithmetic');
    await expect(page.locator('text=IPアドレス計算の練習アプリ')).toBeVisible();
  });

  test('ナビゲーションリンクが正常に動作する', async ({ page }) => {
    // クイズリンク
    await page.getByRole('link', { name: '🧠 クイズ' }).click();
    await expect(page).toHaveURL('/quiz');
    
    // ホームに戻る
    await page.goto('/');
    
    // 練習リンク  
    await page.getByRole('link', { name: '📚 練習' }).click();
    await expect(page).toHaveURL('/practice');
    
    // ホームに戻る
    await page.goto('/');
    
    // 計算機リンク
    await page.getByRole('link', { name: '🧮 計算機' }).click();
    await expect(page).toHaveURL('/calculator');
    
    // ホームに戻る
    await page.goto('/');
    
    // ランキングリンク（削除予定のため無効化）
    // await page.click('text=ランキング');
    // await expect(page).toHaveURL('/ranking');
  });

  test('レスポンシブデザインが正常に動作する', async ({ page }) => {
    // デスクトップサイズ
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('nav')).toBeVisible();
    
    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('nav')).toBeVisible();
    
    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('nav')).toBeVisible();
  });
});

test.describe('クイズコンポーネント', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz');
  });

  test('問題タイプ選択が正常に動作する', async ({ page }) => {
    const selector = page.locator('select[name="questionType"]');
    await expect(selector).toBeVisible();
    
    // 各問題タイプを選択
    await selector.selectOption('BINARY_TO_IP');
    await expect(page.locator('text=2進数表記')).toBeVisible();
    
    await selector.selectOption('CIDR_TO_SUBNET');
    await expect(page.locator('text=CIDR').first()).toBeVisible();
    
    await selector.selectOption('NETWORK_ADDRESS');
    await expect(page.locator('text=ネットワークアドレス').first()).toBeVisible();
    
    await selector.selectOption('HOST_IN_NETWORK');
    await expect(page.locator('text=有効なホストアドレス')).toBeVisible();
  });

  test('回答選択と結果表示が正常に動作する', async ({ page }) => {
    await page.selectOption('select[name="questionType"]', 'CIDR_TO_SUBNET');
    
    // 選択肢が4つ表示される
    const choices = page.locator('button[data-testid^="choice-"]');
    await expect(choices).toHaveCount(4);
    
    // 選択肢をクリック
    await choices.first().click();
    
    // 結果ダイアログが表示される
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 解説が表示される
    await expect(page.locator('text=のサブネットマスクは')).toBeVisible();
    
    // 次の問題ボタンが有効
    await expect(page.locator('text=次の問題')).toBeVisible();
  });

  test('スコア表示が正常に動作する', async ({ page }) => {
    await page.selectOption('select[name="questionType"]', 'BINARY_TO_IP');
    
    // 初期スコアが表示される
    await expect(page.locator('text=スコア')).toBeVisible();
    await expect(page.locator('text=0/0')).toBeVisible();
    
    // 1問解いてスコアが更新される
    const choices = page.locator('button[data-testid^="choice-"]');
    await choices.first().click();
    
    // スコアが更新される
    await expect(page.locator('text=1')).toBeVisible();
  });

  test('スコア保存機能が正常に動作する', async ({ page }) => {
    await page.selectOption('select[name="questionType"]', 'HOST_COUNT');
    
    // 5問解く
    for (let i = 0; i < 5; i++) {
      const choices = page.locator('button[data-testid^="choice-"]');
      await choices.first().click();
      
      if (await page.locator('text=次の問題').isVisible()) {
        await page.click('text=次の問題');
      }
    }
    
    // スコア保存ダイアログが表示される可能性をチェック
    if (await page.locator('text=スコアを保存').isVisible()) {
      await page.fill('input[name="playerName"]', 'テストプレイヤー');
      await page.click('text=保存');
      
      // 保存成功メッセージ
      await expect(page.locator('text=保存されました')).toBeVisible();
    }
  });
});

test.describe('練習コンポーネント', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice');
  });

  test('練習問題が無限に生成される', async ({ page }) => {
    // トピック選択
    await page.click('text=CIDR → サブネット');
    
    // 連続で10問解く
    for (let i = 0; i < 10; i++) {
      // ボタンのテキストで選択肢を特定（A., B., C., D.で始まる）
      const choices = page.locator('button').filter({ hasText: /^[A-D]\. / });
      await expect(choices).toHaveCount(4);
      
      await choices.first().click();
      
      // 次の問題に進む
      if (await page.locator('text=次の問題').isVisible()) {
        await page.click('text=次の問題');
      }
    }
    
    // まだ問題が表示されている
    const choices = page.locator('button').filter({ hasText: /^[A-D]\. / });
    await expect(choices).toHaveCount(4);
  });

  test('問題タイプ切り替えが即座に反映される', async ({ page }) => {
    // 最初の問題タイプ
    await page.click('text=ブロードキャストアドレス計算');
    await expect(page.locator('text=ブロードキャストアドレス')).toBeVisible();
    
    // 戻ってから別の問題タイプに変更
    await page.click('text=← 戻る');
    await page.click('text=ネットワークアドレス計算');
    await expect(page.locator('text=ネットワークアドレス')).toBeVisible();
  });
});

test.describe('計算機コンポーネント', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculator');
  });

  test('サブネット計算が正確に動作する', async ({ page }) => {
    // サブネット計算モードに切り替え
    await page.click('text=サブネット計算');
    
    // 入力フォーム
    await page.fill('input[name="ipAddress"]', '192.168.1.100');
    await page.fill('input[name="cidr"]', '24');
    
    // 計算実行
    await page.getByRole('button', { name: '計算', exact: true }).click();
    
    // 結果が表示される
    await expect(page.locator('text=192.168.1.0')).toBeVisible(); // ネットワークアドレス
    await expect(page.locator('text=192.168.1.255')).toBeVisible(); // ブロードキャストアドレス
    await expect(page.getByText('254', { exact: true })).toBeVisible(); // ホスト数
  });

  test('入力検証が正常に動作する', async ({ page }) => {
    // サブネット計算モードに切り替え
    await page.click('text=サブネット計算');
    
    // 無効なIPアドレス
    await page.fill('input[name="ipAddress"]', '256.256.256.256');
    await page.fill('input[name="cidr"]', '24');
    await page.getByRole('button', { name: '計算', exact: true }).click();
    
    // エラーメッセージが表示される（alert）
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('無効');
      await dialog.accept();
    });
    
    // フォームをクリア
    await page.fill('input[name="ipAddress"]', '');
    await page.fill('input[name="cidr"]', '');
    
    // 有効な値で再テスト
    await page.fill('input[name="ipAddress"]', '10.0.0.1');
    await page.fill('input[name="cidr"]', '8');
    await page.getByRole('button', { name: '計算', exact: true }).click();
    
    // 正常な結果が表示される
    await expect(page.locator('text=10.0.0.0')).toBeVisible();
  });

  test('異なるCIDR値での計算', async ({ page }) => {
    // サブネット計算モードに切り替え
    await page.click('text=サブネット計算');
    
    const testCases = [
      { ip: '172.16.1.1', cidr: '16', network: '172.16.0.0' },
      { ip: '192.168.0.50', cidr: '28', network: '192.168.0.48' },
      { ip: '10.1.1.1', cidr: '30', network: '10.1.1.0' }
    ];
    
    for (const testCase of testCases) {
      await page.fill('input[name="ipAddress"]', testCase.ip);
      await page.fill('input[name="cidr"]', testCase.cidr);
      await page.getByRole('button', { name: '計算', exact: true }).click();
      
      await expect(page.locator(`text=${testCase.network}`)).toBeVisible();
    }
  });
});

/*
test.describe('ランキングコンポーネント（削除予定のため無効化）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ranking');
  });

  test('ランキング表が正しく表示される', async ({ page }) => {
    // テーブルヘッダー
    await expect(page.locator('text=順位')).toBeVisible();
    await expect(page.locator('text=プレイヤー名')).toBeVisible();
    await expect(page.locator('text=スコア')).toBeVisible();
    await expect(page.locator('text=正答率')).toBeVisible();
    await expect(page.locator('text=日時')).toBeVisible();
    
    // テーブルが表示される
    await expect(page.locator('table')).toBeVisible();
  });

  test('ランキングデータが正しくソートされる', async ({ page }) => {
    // スコアが高い順に並んでいることを確認
    const scoreElements = page.locator('td:nth-child(3)'); // スコア列
    const scores = await scoreElements.allTextContents();
    
    if (scores.length > 1) {
      for (let i = 0; i < scores.length - 1; i++) {
        const currentScore = parseInt(scores[i]);
        const nextScore = parseInt(scores[i + 1]);
        expect(currentScore).toBeGreaterThanOrEqual(nextScore);
      }
    }
  });

  test('空のランキングでも正常に表示される', async ({ page }) => {
    // データがない場合のメッセージ
    if (await page.locator('text=まだスコアがありません').isVisible()) {
      await expect(page.locator('text=まだスコアがありません')).toBeVisible();
    } else {
      // データがある場合はテーブルが表示される
      await expect(page.locator('table')).toBeVisible();
    }
  });
});
*/
