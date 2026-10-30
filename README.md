# 「要打去練舞室打」之紅藍對抗篇 💃⚔️
*(Cyber Dance Studio: Red vs. Blue Battle)*

[![Cloudflare Security Audit](https://img.shields.io/badge/Cloudflare_Security-Audit_Passed-10B981?style=flat-square&logo=cloudflare)](docs/CLOUDFLARE_SECURITY_AUDIT.md)
[![Vulnerabilities](https://img.shields.io/badge/vulnerabilities-0_confirmed-brightgreen?style=flat-square)](docs/CLOUDFLARE_SECURITY_AUDIT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

> **「住手！你們住手！不要再打了！你們要打去練舞室打！！！」**  
> 一款將臺灣經典偶像劇《紫禁之巔》迷因與企業真實 **MITRE ATT&CK 紅藍資安攻防** 完美結合的回合制卡牌策略對決網頁遊戲！

---

## 🛡️ Cloudflare 資安稽核認證 (Security Audit Status)

本專案已通過遵循 [Cloudflare security-audit-skill](https://github.com/cloudflare/security-audit-skill) 標準之防禦型原始碼資安審查：
- **安全性評級**：**A (卓越 / 0 Confirmed Vulnerabilities)**
- **邊緣防禦**：全面注入 Cloudflare `_headers` 安全標頭（嚴格 CSP、HSTS、`X-Frame-Options: DENY` 防點擊劫持）。
- **完整審查報告**：請參閱 [Cloudflare 資安審查報告 (docs/CLOUDFLARE_SECURITY_AUDIT.md)](docs/CLOUDFLARE_SECURITY_AUDIT.md)。

---

## 🎮 遊戲核心特色

- **🔴 兩大陣營自由切換**：
  - **紅隊 (Red Team / 滲透方)**：手持 SSRF（T1190）、IAM 殘留權限提權（T1078）、CI/CD 依賴毒化（T1195），目標突破企業邊界取得金絲雀 Flag！
  - **藍隊 (Blue Team / 守備方)**：部署 Cloudflare WAF 虛擬補丁、強制啟用 IMDSv2、EDR 主機隔離，目標在 10 回合內壓低 MTTD 守護資安！
- **🕺 練舞室大招機制 (Dance Studio Event)**：
  - 當雙方出牌攻防激烈，中央白隊裁判的「尷尬/尬舞能量條」達到 100% 時，全螢幕警報大響！
  - 白隊裁判強制介入：「不要再打了，要打去練舞室打！」觸發雨中街舞大亂鬥隨機事件！
- **💻 深色戰情室風格 (Dark SOC Dashboard)**：
  - 冷硬終端機監控儀表板、即時資安營運日誌串流、Web Audio API 即時合成復古電子音效（零外部音檔依賴，開箱即響）。
- **🏆 紫隊成熟度評級認證 (Purple Team Certificate)**：
  - 終局結算平均偵測時間（MTTD）、處置時間（MTTR）與 S-Rank 證書，支援一鍵複製戰績！

---

## 🛠️ 技術棧 (Tech Stack)

- **前端框架**：React 19 + Vite 6
- **樣式與動效**：Tailwind CSS v4 + 戰情室 CRT 掃描線光效
- **圖示庫**：Lucide React
- **音效系統**：HTML5 Web Audio API（即時波形合成，體積極小）
- **彩帶特效**：Canvas Confetti
- **部署平台**：Cloudflare Pages / GitHub Pages（純前端靜態輸出，零後端相依，全球 CDN 秒開）

---

## ⚡ 本地快速啟動

```bash
# 1. 複製專案庫
git clone https://github.com/<your-username>/dance-studio-cyber-battle.git
cd dance-studio-cyber-battle

# 2. 安裝依賴
npm install

# 3. 啟動本機開發伺服器
npm run dev

# 4. 生產環境打包 (輸出至 dist/)
npm run build
```

---

## ☁️ 佈署到 Cloudflare Pages 教學

本專案專為 **Cloudflare Pages** 量身打造，部署只需 1 分鐘：

### 方法 A：GitHub 關聯自動部署（推薦）
1. 將本專案 Push 至您的 GitHub 帳號。
2. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ 點選 **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**。
3. 選擇本專案儲存庫，設定建置指令與輸出目錄：
   - **Framework preset**：`Vite`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
4. 點選 **Save and Deploy**，即可獲得專屬的免費全域 CDN 網址（例如：`https://dance-studio-battle.pages.dev`）！

### 方法 B：使用 Wrangler CLI 命令行部署
```bash
npx wrangler pages deploy dist --project-name dance-studio-cyber-battle
```

---

## 📜 開源授權

本專案基於 [MIT License](LICENSE) 開源發行。歡迎任何資安同好與迷因愛好者 Fork、提出 Pull Request 或新增更多有趣的卡牌與台詞！
