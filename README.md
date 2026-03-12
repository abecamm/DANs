# DAN PDF Extractor

A browser-based tool for extracting data from Wells Fargo Deposit Adjustment Notice (DAN) PDFs and copying it directly into the DAN tracking spreadsheet.

## 🚀 Live Tool

**[Open DAN Extractor →](https://abecamm.github.io/DANs/)**

## What It Does

1. **Drag & drop** one or more DAN PDFs into the browser
2. **Automatically extracts** key fields from each PDF:
   - Notice Date
   - Deposit Date
   - Reference Number
   - Customer Sequence Number
   - Adjustment Amount
   - Adjustment Reason (mapped to spreadsheet dropdown values)
   - Check Number (when available)
   - Adjustment Type (Debit/Credit)
3. **One-click copy** — "Copy All Rows" copies tab-separated data
4. **Paste into Google Sheets** — data flows across all columns (A→N) perfectly

## Supported Reason Types

| PDF Language | → Spreadsheet Dropdown |
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

## How to Use

1. Open the tool in any browser
2. Drag DAN PDFs onto the drop zone (or click to select files)
3. Review the extracted data in the table
4. Click **"Copy All Rows"** to copy all data
5. Go to the Google Sheet → click cell A in the first empty row → Cmd+V
6. Data fills across columns A through N automatically

## Tech

- Pure HTML/CSS/JavaScript — no server required
- Uses [PDF.js](https://mozilla.github.io/pdf.js/) for client-side PDF parsing
- All processing happens in the browser — no data leaves your machine
- Hosted on GitHub Pages

## Roadmap

- [ ] GMB Token + Unit Token lookup integration
- [ ] Regulator adjustment automation
- [ ] Email generation for Salesforce communications
