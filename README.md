# Progress Tracker

個人學習與運動追蹤 App，支援 Udemy 課程進度記錄與運動健身日誌。

## 功能

- **課程追蹤**：新增課程、每日記錄進度百分比、趨勢圖表、備註
- **多課程比較**：獨立比較頁，疊加折線圖
- **運動追蹤**：Log / Dashboard / History 子頁籤
  - 支援多種運動類型（跑步、健身、游泳等）
  - 健身 Workout 支援 Push / Pull / Legs 分類 + 動作/重量/組數/次數記錄
  - 週間堆疊長條圖（可前後翻頁）
  - Workout Progress 總覽表（可依動作篩選）
- **資料同步**：localStorage + SQLite API 雙向同步
- **JSON 匯出/匯入**：一鍵備份還原
- **Basic Auth**：帳號密碼保護（環境變數設定）

## 技術棧

- Next.js 16、React 19、TypeScript 5、Tailwind CSS 4
- Recharts（圖表）、better-sqlite3（資料庫）
- Docker 多階段建置、Railway 部署

## 開發

```bash
npm install
npm run dev
```

## 環境變數

| 變數 | 說明 | 預設值 |
|---|---|---|
| `BASIC_AUTH_USER` | Basic Auth 帳號 | `admin` |
| `BASIC_AUTH_PASS` | Basic Auth 密碼 | `changeme` |
| `DB_PATH` | SQLite 資料庫路徑 | `./progress_data.db` |

## 部署（Railway）

1. 推送到 GitHub
2. Railway → New Project → Deploy from GitHub
3. 設定環境變數（`BASIC_AUTH_USER`、`BASIC_AUTH_PASS`、`DB_PATH=/data/progress.db`）
4. 新增 Volume，掛載到 `/data`
5. Generate Domain 取得公開 URL
