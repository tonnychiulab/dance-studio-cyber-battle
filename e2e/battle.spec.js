import { test, expect } from '@playwright/test';

test.describe('「要打去練舞室打」全功能端到端 (E2E) 測試', () => {

  test('首頁渲染與三種模式卡片選擇', async ({ page }) => {
    await page.goto('/');

    // 驗證標題與首頁元素
    await expect(page.locator('h1')).toContainText('「要打去練舞室打」');
    await expect(page.getByText('之紅藍對抗篇')).toBeVisible();

    // 驗證三種陣營/模式選擇卡片皆存在
    const redCard = page.getByText('🔴 扮演紅隊 (滲透方)');
    const blueCard = page.getByText('🔵 扮演藍隊 (守備方)');
    const spectatorCard = page.getByText('👁️ 白隊總裁判 (全自動)');

    await expect(redCard).toBeVisible();
    await expect(blueCard).toBeVisible();
    await expect(spectatorCard).toBeVisible();

    // 點擊紅隊卡片
    await redCard.click();
    await expect(page.getByRole('button', { name: /開始戰情室對抗/ })).toBeVisible();

    // 點擊白隊總裁判卡片
    await spectatorCard.click();
    await expect(page.getByRole('button', { name: /開啟白隊總裁判觀戰席/ })).toBeVisible();
  });

  test('模式一：紅隊手動對決出牌與回合流轉', async ({ page }) => {
    await page.goto('/');

    // 選擇紅隊並進入遊戲
    await page.getByText('🔴 扮演紅隊 (滲透方)').click();
    await page.getByRole('button', { name: /開始戰情室對抗/ }).click();

    // 驗證已進入戰情室介面
    await expect(page.getByText('企業防禦 HP')).toBeVisible();
    await expect(page.getByText('滲透突破進度')).toBeVisible();

    // 驗證玩家手牌區有 4 張卡 (使用語意化 aria-label)
    const playableCards = page.locator('[role="button"][aria-label*="消耗行動點數"]');
    await expect(playableCards).toHaveCount(4);

    // 點擊第一張手牌出牌
    await playableCards.first().click();

    // 驗證終端機 Log 出現出牌或防禦紀錄
    const terminal = page.locator('aside');
    await expect(terminal).toContainText('發動');

    // 結束本回合按鈕
    const endTurnBtn = page.getByRole('button', { name: /結束本回合/ });
    if (await endTurnBtn.isVisible()) {
      await endTurnBtn.click();
      await expect(terminal).toContainText('戰術主動權轉移至對手');
    }
  });

  test('模式二：藍隊防禦守備出牌與修復加固', async ({ page }) => {
    await page.goto('/');

    // 選擇藍隊並進入遊戲
    await page.getByText('🔵 扮演藍隊 (守備方)').click();
    await page.getByRole('button', { name: /開始戰情室對抗/ }).click();

    // 驗證已進入戰情室介面
    await expect(page.getByText('企業防禦 HP')).toBeVisible();

    // 驗證玩家手牌區有 4 張卡
    const playableCards = page.locator('[role="button"][aria-label*="消耗行動點數"]');
    await expect(playableCards).toHaveCount(4);

    // 點擊第一張手牌部署防禦
    await playableCards.first().click();

    // 驗證終端機 Log 出現藍隊部署紀錄
    const terminal = page.locator('aside');
    await expect(terminal).toContainText('部署');
  });

  test('模式三：白隊裁判觀戰模式、AI vs AI 自主攻防與裁判強制干預', async ({ page }) => {
    await page.goto('/');

    // 選擇白隊總裁判並進入觀戰席
    await page.getByText('👁️ 白隊總裁判 (全自動)').click();
    await page.getByRole('button', { name: /開啟白隊總裁判觀戰席/ }).click();

    // 驗證裁判專屬標頭與控制列
    await expect(page.getByText('WHITE ARBITER')).toBeVisible();
    await expect(page.getByRole('button', { name: /暫停自動對戰/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /單步推進下一回合/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /切換對戰速度/ })).toBeVisible();

    // 驗證紅藍雙方手牌皆公開展示
    await expect(page.getByText('🔵 藍隊 SOC 邊緣 Agent 牌庫')).toBeVisible();
    await expect(page.getByText('🔴 紅隊 APT 邊緣 Agent 牌庫')).toBeVisible();

    // 驗證終端機有裁判進駐訊息
    const terminal = page.locator('aside');
    await expect(terminal).toContainText('白隊總裁判長進駐戰情室');

    // 測試裁判最高權限：🚨 白隊裁判強制介入：要打去練舞室打！
    const interveneBtn = page.getByRole('button', { name: '白隊裁判強制介入：要打去練舞室打！' });
    await expect(interveneBtn).toBeVisible();
    await interveneBtn.click();

    // 驗證彈出「戰情室過熱警報：尬舞能量破表」迷因彈窗
    await expect(page.getByText('戰情室過熱警報')).toBeVisible();

    // 點擊關閉彈窗按鈕
    const dismissBtn = page.getByRole('button', { name: /全體移駕練舞室尬舞/ });
    await expect(dismissBtn).toBeVisible();
    await dismissBtn.click();

    // 驗證彈窗關閉
    await expect(page.getByText('戰情室過熱警報')).not.toBeVisible();

    // 測試暫停按鈕
    const pauseBtn = page.getByRole('button', { name: /暫停自動對戰/ });
    await pauseBtn.click();
    await expect(page.getByRole('button', { name: /繼續自動對戰/ })).toBeVisible();

    // 測試單步推進
    const stepBtn = page.getByRole('button', { name: /單步推進下一回合/ });
    await expect(stepBtn).toBeEnabled();
    await stepBtn.click();

    // 測試切換速度
    const speedBtn = page.getByRole('button', { name: /切換對戰速度/ });
    await speedBtn.click();
    await expect(speedBtn).toContainText('2x');
  });

});
