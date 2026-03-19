# DAN PDF Extractor & Adjustment Tool

A browser-based automation suite for processing Wells Fargo Deposit Adjustment Notices (DANs). Replaces a fully manual PDF-to-spreadsheet-to-Regulator workflow with drag-and-drop extraction, one-click token lookup, automated Regulator form filling, and email generation.

## 🚀 Live Tools

- **[DAN Extractor →](https://abecamm.github.io/DANs/)** — PDF extraction, token lookup, spreadsheet copy
- **[Adjustment Tool →](https://abecamm.github.io/DANs/adjust.html)** — Regulator adjustment automation

---

## The Problem

Processing DANs was a fully manual, repetitive workflow:

1. Open each PDF individually and read through it
2. Manually identify 8+ fields and type them into the tracking spreadsheet
3. Navigate to Toolbox, paste the sequence number, click "Get Check"
4. Copy GMB Token, Unit Token, amount, and check number **one at a time** into the sheet
5. Double-check everything for typos
6. Copy the Unit Token, search it in Regulator, click the correct adjustment tier
7. Manually fill in amount, credit/debit, type, and reason in the Regulator form
8. Go back to the sheet, mark column P as "Yes"
9. Generate a seller communication email (previously locked behind an inaccessible Google Apps Script)

**~7–8 minutes per DAN × 10–20 DANs/week = 70–160 minutes of manual work per week.**

---

## The Solution

### 1. Batch PDF Extraction
Drag and drop one or more DAN PDFs into the browser. All key fields are extracted instantly:

| Field | Source |
|---|---|
| Notice Date | Letter date at top of PDF |
| Deposit Date | "Deposit date:" field |
| Reference Number | "Reference #: A-XXXXXXXXXX" |
| Customer Sequence Number | "Customer sequence number:" (leading zeros stripped) |
| Adjustment Amount | "Subject: Adjustment of $X,XXX.XX" |
| Adjustment Reason | Parsed from explanation paragraph, mapped to dropdown values |
| Check Number | From "check #XXXX" in paragraph text |
| Adjustment Type | Debit or Credit (detected from "deducted" vs "credited" language) |

### 2. Toolbox Token Lookup (Bookmarklet)
One-click **"Grab DAN Tokens"** bookmarklet captures from the Toolbox check deposit page:
- GMB Token
- Unit Token
- USD Amount
- Check Number (prompted)
- Approving Agent (if manual review)

All copied as tab-separated values in a single clipboard action.

### 3. One-Click Paste & Copy
- **Paste Tokens** — fills token columns for each row directly in the extractor
- **Copy All Rows** — copies all extracted data as tab-separated values
- **Paste into Google Sheets** — data flows across columns A→N perfectly

### 4. Regulator Adjustment Automation (Bookmarklets)
Two bookmarklets that work together to auto-fill the Regulator adjustment form:

**Prep DAN Adjustment** (used on Google Sheets):
- Copy a row from the DAN sheet → click bookmarklet → paste into prompt
- Parses all 16 columns, determines the correct adjustment tier (Small/Large/Humongous)
- Shows a summary alert with unit, amount, type, tier, and reason
- Opens Regulator directly to the unit's page
- Copies JSON payload to clipboard for the Fill bookmarklet

**Fill DAN Adjustment** (used on Regulator):
- With the adjustment modal open, click the bookmarklet
- Auto-fills all four form fields:
  - **Adjustment Amount** — via React-compatible `nativeInputValueSetter`
  - **Credit Or Debit** — clicks MUI dropdown, selects correct option
  - **Type** — clicks dropdown, selects `SQUARE_CARD_CLAIMS`
  - **Reason** — fills `Deposit Adjustment Notice {Debit/Credit} - {Reason}`
- Shows a progress toast with ✓/✗ for each field
- You review and click Submit

**Adjustment Tier Logic:**

| Tier | Credit Up To | Debit Up To |
|---|---|---|
| Small | $1,000 | $5,000 |
| Large | $5,000 | $25,000 |
| Humongous | $50,000 | $250,000 |

### 5. Email Generation (Bookmarklet + Google Apps Script)

**Generate DAN Email Bookmarklet** (on Google Sheets):
- Copy a row → click bookmarklet → paste into prompt
- First use: prompts for your name (remembered for the session)
- Auto-selects **Debit** or **Credit** template based on column N
- Generates the full seller communication email
- Copies to clipboard automatically — paste directly into Salesforce

**Google Apps Script** (alternative, bound to the DAN sheet):
- **DAN Tools → Generate Email** menu in the spreadsheet
- Reads the selected row and generates the appropriate email template
- Creates a Google Doc with the formatted email
- One-click copy for pasting into Salesforce

---

## Time Savings

| Metric | Before (Manual) | After (Automated) | Savings |
|---|---|---|---|
| **Per DAN (full cycle)** | ~7–8 minutes | ~1 minute | **~85–90%** |
| **Weekly (10 DANs)** | ~70–80 minutes | ~10 minutes | **~60–70 min** |
| **Weekly (20 DANs)** | ~140–160 minutes | ~20 minutes | **~120–140 min** |
| **Monthly estimate** | ~9–10 hours | ~1 hour | **~8+ hours** |

### Breakdown Per DAN

| Step | Before | After |
|---|---|---|
| Extract PDF data | ~2 min (read + type 8 fields) | ~5 sec (drag & drop) |
| Look up tokens in Toolbox | ~1.5 min (navigate, copy one by one) | ~15 sec (bookmarklet) |
| Paste into spreadsheet | ~1 min (manual entry across 14 cols) | ~5 sec (Copy All Rows → Cmd+V) |
| Regulator adjustment | ~2 min (search, pick tier, fill 4 fields) | ~20 sec (Prep → Fill → Submit) |
| Generate email | ~1 min (locked script workaround) | ~15 sec (DAN Tools menu) |

### Additional Benefits
- **Zero typos** — no manual transcription of reference numbers, tokens, or amounts
- **Automated reason mapping** — PDF language is mapped to exact spreadsheet dropdown values
- **Auto tier selection** — correct adjustment tier determined from amount + debit/credit
- **Team-accessible email generation** — no longer locked behind a single user's script
- **Error reduction** — Amount Mismatch DANs auto-parse submitted vs actual amounts
- **Batch processing** — handle all DANs at once instead of one at a time

---

## Supported Adjustment Reasons

| PDF Language | → Spreadsheet Dropdown Value |
|---|---|
| Duplicate item / same item deposited | Duplicate Presentment |
| Internal duplicate | Internal Duplicate Presentment |
| Written amount ≠ numerical amount (debit) | Negative Adjustment - Amount Mismatch |
| Written amount ≠ numerical amount (credit) | Positive Adjustment - Amount Mismatch |
| Image quality | Image Quality |
| Non-negotiable | Non-Negotiable |
| MICR / unable to locate | MICR Error - Unable to Locate |
| Overlapping items | Multiple Overlapping Items |
| Payer claim | Payer Claim |
| Operator error | Operator Error - Manual Reimbursement |

---

## How to Use

### PDF Extraction
1. Open the [DAN Extractor](https://abecamm.github.io/DANs/)
2. Drag DAN PDFs onto the drop zone (or click to select files)
3. Review the extracted data in the table

### Token Lookup
4. For each row, click **"Look Up"** → Toolbox opens
5. Paste the sequence number → click **"Get Check"**
6. Click the **"Grab DAN Tokens"** bookmarklet in your bookmarks bar
7. Enter the check number when prompted
8. Back in the DAN Extractor, click **"Paste Tokens"** on that row

### Copy to Spreadsheet
9. Click **"Copy All Rows"** to copy all data
10. Go to the Google Sheet → click cell A in the first empty row → **Cmd+V**
11. Data fills across columns A through N automatically

### Regulator Adjustment
12. In the Google Sheet, select the row that needs adjustment
13. **Cmd+C** to copy the row
14. Click the **"Prep DAN Adjustment"** bookmarklet → paste into prompt → OK
15. Regulator opens to the unit's page
16. Click **Actions** → select the tier shown in the alert (Small/Large/Humongous)
17. Once the modal is open, click the **"Fill DAN Adjustment"** bookmarklet
18. Review the auto-filled fields → click **Submit**
19. Back in the sheet, mark column P as **Yes**

### Email Generation (Bookmarklet)
20. In the Google Sheet, select the row → **Cmd+C**
21. Click the **"Generate DAN Email"** bookmarklet
22. First time: enter your name when prompted (remembered for the session)
23. **Cmd+V** to paste the row into the prompt → OK
24. Email is generated and **copied to your clipboard** automatically
25. Go to Salesforce → **Cmd+V** to paste

### Email Generation (Apps Script Alternative)
20. In the Google Sheet, click on the row you need to email about
21. Go to **DAN Tools → Generate Email**
22. Copy the generated email from the popup → paste into Salesforce

---

## Bookmarklet Installation

### DAN Extractor Bookmarklets
1. Open the [DAN Extractor](https://abecamm.github.io/DANs/)
2. Drag **"Grab DAN Tokens"** to your Chrome bookmarks bar
3. Use it on any Toolbox check deposit page

### Adjustment & Email Bookmarklets
1. Open the [Adjustment Tool](https://abecamm.github.io/DANs/adjust.html)
2. Drag **"Prep DAN Adjustment"** to your bookmarks bar — use on Google Sheets
3. Drag **"Fill DAN Adjustment"** to your bookmarks bar — use on Regulator
4. Drag **"Generate DAN Email"** to your bookmarks bar — use on Google Sheets

> **Note:** If bookmarklets are updated on the site, delete the old bookmark and re-drag the new one.

---

## Google Sheet Columns (A–P)

| Column | Field | Source |
|---|---|---|
| A | Notice Date | PDF |
| B | Deposit Date | PDF |
| C | Reference Number | PDF |
| D | Customer Sequence Number | PDF |
| E | Unit Token | Toolbox Bookmarklet |
| F | GMB Token | Toolbox Bookmarklet |
| G | Toolbox Submitted $ Amount | Toolbox Bookmarklet |
| H | Submitted $ Amount | Toolbox / PDF (mismatch cases) |
| I | Actual $ Amount | Toolbox / PDF (mismatch cases) |
| J | Adjusted $ Amount | PDF |
| K | Reason | PDF (mapped to dropdown) |
| L | Check Number | Bookmarklet prompt / PDF |
| M | Agent Error | Toolbox Bookmarklet (if manual review) |
| N | Adjustment Type | PDF (Debit or Credit) |
| O | DAN Adj/Actions Completed | Link to Regulator |
| P | Adjusted (Yes/No) | Manual — triggers email workflow |

---

## Tech Stack

- **Pure HTML/CSS/JavaScript** — no server, no build step
- **[PDF.js](https://mozilla.github.io/pdf.js/)** — client-side PDF parsing (CDN-hosted)
- **Google Apps Script** — email generation bound to the tracking sheet
- **MUI/React form automation** — `nativeInputValueSetter` + programmatic dropdown interaction
- **GitHub Pages** — static hosting
- **All processing happens in the browser** — no data leaves your machine

---

## Changelog

### v4.0 — March 19, 2025
- **NEW: Regulator Adjustment Tool** ([adjust.html](https://abecamm.github.io/DANs/adjust.html))
- Two-bookmarklet system: Prep (Google Sheets) → Fill (Regulator)
- Auto-determines adjustment tier (Small/Large/Humongous) from amount + debit/credit
- Auto-fills all 4 Regulator form fields (Amount, Credit/Debit, Type, Reason)
- React/MUI-compatible form filling using nativeInputValueSetter + click simulation
- **NEW: Generate DAN Email bookmarklet** — auto-generates Debit/Credit seller comms from row data
- Copies email to clipboard for direct paste into Salesforce
- Remembers agent name for the session
- Added "Adjustment Tool" link in DAN Extractor header
- Cleaned up repo: removed backup files and legacy email_bookmarklet.js

### v3.3 — March 17, 2025
- Redesigned UI with Claude/Anthropic-inspired light theme (warm cream, terracotta accents)
- Updated bookmarklet toast styling to match new theme
- Expanded table container width for better column visibility

### v3.2 — March 16, 2025
- Rebuilt Google Apps Script for email generation (Debit + Credit templates)
- Added Toolbox bookmarklet for one-click token/amount/check# capture
- Added per-row Paste Tokens functionality
- Added Amount Mismatch parsing (submitted vs actual amounts)

### v3.0 — March 12, 2025
- Added columns G–I (Toolbox amounts) and column N (Adjustment Type)
- Full 14-column (A–N) coverage for DAN tracking sheet

### v2.0 — March 11, 2025
- Added batch PDF drag-and-drop processing
- Automated reason mapping to spreadsheet dropdown values
- Copy All Rows as tab-separated output

### v1.0 — March 10, 2025
- Initial PDF text extraction proof of concept

---

## Roadmap

- [x] Batch PDF extraction (8 fields)
- [x] Toolbox token lookup bookmarklet
- [x] Per-row paste tokens
- [x] Copy All Rows (tab-separated for Google Sheets)
- [x] Amount Mismatch parsing (submitted vs actual)
- [x] Google Apps Script email generation (Debit + Credit)
- [x] Claude-inspired light theme redesign
- [x] Regulator adjustment automation (Prep + Fill bookmarklets)
- [x] Email generation bookmarklet (prompt-based, clipboard copy)
