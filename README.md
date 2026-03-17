# DAN PDF Extractor

A browser-based automation tool for processing Wells Fargo Deposit Adjustment Notices (DANs). Replaces a fully manual PDF-to-spreadsheet workflow with drag-and-drop extraction, one-click token lookup, and automated email generation.

## 🚀 Live Tool

**[Open DAN Extractor →](https://abecamm.github.io/DANs/)**

---

## The Problem

Processing DANs was a fully manual, repetitive workflow:

1. Open each PDF individually and read through it
2. Manually identify 8+ fields and type them into the tracking spreadsheet
3. Navigate to Toolbox, paste the sequence number, click "Get Check"
4. Copy GMB Token, Unit Token, amount, and check number **one at a time** into the sheet
5. Double-check everything for typos
6. Generate a seller communication email (previously locked behind an inaccessible Google Apps Script)

**~5 minutes per DAN × 10–20 DANs/week = 50–100 minutes of manual data entry per week.**

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

### 4. Email Generation (Google Apps Script)
Rebuilt Google Apps Script bound to the DAN tracking sheet:
- **DAN Tools → Generate Email** menu in the spreadsheet
- Reads the selected row and generates the appropriate **Debit** or **Credit** email template
- Creates a Google Doc with the formatted email
- One-click copy for pasting into Salesforce
- Stores agent name for reuse across sessions

---

## Time Savings

| Metric | Before (Manual) | After (DAN Extractor) | Savings |
|---|---|---|---|
| **Per DAN** | ~5 minutes | ~30 seconds | **~4.5 min (90%)** |
| **Weekly (10 DANs)** | ~50 minutes | ~5 minutes | **~45 min** |
| **Weekly (20 DANs)** | ~100 minutes | ~10 minutes | **~90 min** |
| **Monthly estimate** | ~5.5 hours | ~33 minutes | **~3+ hours** |

### Additional Benefits
- **Zero typos** — no manual transcription of reference numbers, tokens, or amounts
- **Automated reason mapping** — PDF language is mapped to exact spreadsheet dropdown values
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

### Email Generation
12. In the Google Sheet, click on the row you need to email about
13. Go to **DAN Tools → Generate Email**
14. Copy the generated email from the popup → paste into Salesforce

---

## Bookmarklet Installation

1. Open the [DAN Extractor](https://abecamm.github.io/DANs/)
2. Find the **"Grab DAN Tokens"** button in the setup section
3. Drag it to your Chrome bookmarks bar
4. Use it on any Toolbox check deposit page

> **Note:** If the bookmarklet is updated on the site, you'll need to delete the old bookmark and re-drag the new one.

---

## Google Sheet Columns (A–N)

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

---

## Tech Stack

- **Pure HTML/CSS/JavaScript** — no server, no build step
- **[PDF.js](https://mozilla.github.io/pdf.js/)** — client-side PDF parsing (CDN-hosted)
- **Google Apps Script** — email generation bound to the tracking sheet
- **GitHub Pages** — static hosting
- **All processing happens in the browser** — no data leaves your machine

---

## Changelog

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
- [ ] Regulator adjustment automation (deferred — React form blocking)
