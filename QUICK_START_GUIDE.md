# Quick Start Guide: Financial Year Filtering & Reports

## 🎯 What's New

Your Carpenter Dashboard now has:
1. **Financial Year Filter** - Filter KPI cards by fiscal year
2. **Dynamic FY Selection** - Automatically populated from actual data
3. **Report Generation** - Generate batch-wise reports in Excel, Word, or PDF
4. **Completed Batches Only** - Reports show only COMPLETED training batches

---

## 📊 Using the Financial Year Filter

### Step 1: Locate the FY Dropdown
The Financial Year dropdown appears in the top-right of the Dashboard, next to the Report button.

### Step 2: Select a Financial Year
- **All**: Shows KPIs for all data across all fiscal years
- **2025-26**: Shows KPIs only for FY April 2025 - March 2026
- **Other Years**: Any year that has data in the system

### Step 3: Watch KPI Cards Update
When you select a year, the four KPI cards update immediately:
- **Registration** - Total carpenters registered in that FY
- **Trained** - Carpenters who completed training in that FY
- **Insurance** - Carpenters with insurance in that FY
- **Certificates** - Carpenters with certificates in that FY

> **Note**: The charts and drilldown analytics continue to show all data. Only the KPI cards are filtered.

---

## 📄 Generating Reports

### Step 1: Select Financial Year
Choose the FY you want in the report from the dropdown.

### Step 2: Click "Generate Report"
You'll see a dropdown menu with three options.

### Step 3: Select Report Format

#### Excel Report
- **Use When**: You want to analyze data in a spreadsheet
- **Contains**: 
  - Summary sheet with total batches, trainees, trained count
  - Detailed sheet with all batches and their metrics
- **Columns**: Batch ID, State, District, Location, Date, Trainees, Trained, Insurance, Certificates, Remarks
- **File**: `Batch-Report_[FY]_[Date].xlsx`

#### Word Report
- **Use When**: You want a professional document or need to share with stakeholders
- **Contains**: 
  - Cover page with report metadata
  - Batch details page for each COMPLETED batch
  - Participant list for each batch
  - Photo references for each batch
- **Format**: Professional .docx document
- **File**: `Batch-Report_[FY]_[Date].docx`

#### PDF Report
- **Use When**: You need a view-only format or printing
- **Contains**: Same as Word report but in PDF format
- **Format**: Professional .pdf document with automatic pagination
- **File**: `Batch-Report_[FY]_[Date].pdf`

### Step 4: Check Download
Your browser will download the report file. A success message confirms the download.

---

## 🔍 Understanding the Financial Year

**Financial Year Definition** (Indian FY):
- **Starts**: April (Month 4)
- **Ends**: March (Month 3)
- **Format**: YYYY-YY
  - April 2025 - March 2026 = FY `2025-26`
  - April 2024 - March 2025 = FY `2024-25`

**How FY is Calculated**:
Based on when a carpenter was registered (participant.created_at) or when training occurred (batch.workshop_date).

---

## 📋 What's Included in Reports

### Excel & Word/PDF Reports Include:

For **Each Completed Batch**:
- ✓ Batch ID
- ✓ State & District
- ✓ Training Location
- ✓ Training Date
- ✓ Type of Centre (city/block)
- ✓ Trainer Name & Phone
- ✓ Mobiliser Name
- ✓ Total Trainees
- ✓ Number Trained (with certificate)
- ✓ Insurance Count
- ✓ Certificate Count
- ✓ Participant Names & Training Status (Word/PDF only)
- ✓ Photo References/URLs (Word/PDF only)

### What's NOT Included:
- ❌ PLANNED batches
- ❌ ONGOING batches
- ❌ CANCELLED batches
- ❌ Embedded photos (referenced by URL instead)

---

## ✅ Testing the Features

### Quick Test Checklist

- [ ] **FY Dropdown Works**
  1. Open Dashboard
  2. Wait for "Financial Year" dropdown to appear
  3. Click dropdown
  4. Verify "All" and multiple FY options show
  5. Select a specific FY (e.g., "2025-26")
  6. Verify KPI cards update

- [ ] **KPI Filtering Works**
  1. Select "All" - Note the Registration count
  2. Select a specific FY (e.g., "2025-26") - Count should be lower or same
  3. Select "All" again - Count should return to original

- [ ] **Report Generation Works**
  1. Select a FY with data
  2. Click "Generate Report"
  3. Click "Excel"
  4. File downloads (check Downloads folder)
  5. Repeat for Word and PDF formats
  6. Verify file sizes are not 0 bytes
  7. Open files in corresponding applications

---

## 🚀 Performance Tips

1. **First Load**: FY list fetches once on Dashboard load - wait ~1-2 seconds
2. **Changing FY**: KPIs update within 1-2 seconds
3. **Large Reports**: Reports with 100+ batches may take 3-5 seconds to generate
4. **Multiple Downloads**: You can queue multiple report downloads - they'll process in order

---

## 🔧 Troubleshooting

### "FY Dropdown not showing"
- Ensure Dashboard is fully loaded
- Check browser developer console (F12) for errors
- Refresh the page

### "KPI cards not updating when I change FY"
- Wait a moment for the API request to complete
- Check that you're not offline
- Check browser console for errors
- Refresh and try again

### "Report download failed"
- Verify you have a stable internet connection
- Check that the batch data exists for selected FY
- Try a different report format
- Check browser console for errors
- Refresh and try again

### "Report file won't open"
- Try opening in the correct application (Excel for .xlsx, Word for .docx, PDF reader for .pdf)
- Ensure your application is up to date
- Re-download the file
- Try a different report format

### "Report looks empty or has no data"
- Select "All" FY - if still no data, there may be no COMPLETED batches
- Verify COMPLETED batches exist in your system
- Check that batches have participants assigned
- Contact your system administrator

---

## 📖 For More Information

See **IMPLEMENTATION_SUMMARY.md** in the project root for:
- Technical implementation details
- API endpoint reference
- Database field mappings
- Performance considerations
- Future enhancement ideas

---

## 💡 Tips & Tricks

1. **Comparing Years**: Export reports for multiple FYs and compare in Excel
2. **Printing Reports**: Use Word or PDF format for best printing results
3. **Sharing**: PDF format is best for sharing without recipient needing MS Office
4. **Archive**: Save Excel reports in a folder for historical analysis
5. **Data Entry**: Ensure trainee registration dates are accurate for accurate FY filtering

---

**Version**: 1.0  
**Last Updated**: 2026-09-09  
**Status**: Production Ready
