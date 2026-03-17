// DAN Email Generator Bookmarklet
// Runs on the Google Sheets DAN tracking spreadsheet
// Reads the selected row and generates a Salesforce email message

javascript:void(function(){
  try {
    // Get agent name — store in sessionStorage so it persists across clicks
    var agentName = sessionStorage.getItem('danAgentName');
    if (!agentName) {
      agentName = prompt('Enter your name (for the email signature):', '');
      if (!agentName) return;
      sessionStorage.setItem('danAgentName', agentName);
    }

    // Get the selected cell to determine the row
    // Google Sheets exposes the cell reference in the Name Box (top-left)
    var nameBox = document.querySelector('.jfk-textinput-label') 
      || document.querySelector('[aria-label="Name Box"]')
      || document.querySelector('.waffle-name-box input');
    
    // Try to get selected cell info from the formula bar area
    var cellRef = '';
    var nameBoxInput = document.querySelector('#t-name-box') 
      || document.querySelector('.jfk-textinput')
      || document.querySelector('[aria-label="Name Box"]');
    
    if (nameBoxInput) {
      cellRef = nameBoxInput.value || nameBoxInput.textContent || '';
    }

    // Extract row number from cell reference (e.g., "O5" -> 5)
    var rowMatch = cellRef.match(/(\d+)/);
    if (!rowMatch) {
      alert('Could not determine the selected row. Please click on a cell in the row you want to generate an email for.');
      return;
    }
    var rowNum = parseInt(rowMatch[1]);

    // Read cell values from the visible spreadsheet
    // Google Sheets renders cells in a grid — we need to find the right row
    // Column mapping: A=Notice Date, B=Deposit Date, H=Submitted$, J=Adj Amount, K=Reason, L=Check#, N=Adj Type
    
    function getCellText(col, row) {
      // Try using the Google Sheets API through the DOM
      // Cells are in a table with class "waffle"
      var table = document.querySelector('.waffle');
      if (!table) return '';
      var rows = table.querySelectorAll('tr');
      // Row index in DOM (row 1 = header, row 2 = first data row, etc.)
      if (row >= rows.length) return '';
      var cells = rows[row].querySelectorAll('td, th');
      if (col >= cells.length) return '';
      return (cells[col].textContent || '').trim();
    }

    // Column indices (0-based): A=0, B=1, ... H=7, J=9, K=10, L=11, N=13
    var noticeDate = getCellText(0, rowNum);   // A - Notice Date
    var depositDate = getCellText(1, rowNum);  // B - Deposit Date
    var submittedAmt = getCellText(7, rowNum); // H - Submitted $ Amount
    var adjAmount = getCellText(9, rowNum);    // J - Adjusted $ Amount
    var reason = getCellText(10, rowNum);      // K - Reason
    var checkNum = getCellText(11, rowNum);    // L - Check Number
    var adjType = getCellText(13, rowNum);     // N - Adjustment Type

    // Clean up amounts — ensure $ prefix
    function fmtAmt(val) {
      if (!val) return '$0.00';
      val = val.replace(/[^0-9.,]/g, '');
      var num = parseFloat(val.replace(/,/g, ''));
      if (isNaN(num)) return '$' + val;
      return '$' + num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }

    var subDisplay = fmtAmt(submittedAmt);
    var adjDisplay = fmtAmt(adjAmount);
    var isDebit = adjType.toLowerCase().indexOf('debit') > -1;

    var message = '';
    if (isDebit) {
      message = 'My name is ' + agentName + ' with Square. I am reaching out to you today regarding a check you deposited into your account.\n\n' +
        'Thank you for using our mobile check deposit feature. On ' + noticeDate + ' we received a notice about an issue with a recent mobile check deposit of ' + checkNum + ' for ' + subDisplay + ' submitted to your account on ' + depositDate + '. Upon researching this issue, we have determined an overage of funds was paid to you due to ' + reason + '. As a result we have deducted ' + adjDisplay + ' from your account.\n\n' +
        'If you have any additional questions please don\'t hesitate to reach out. We do apologize for the inconvenience.\n\n' +
        'Square Account Services';
    } else {
      message = 'My name is ' + agentName + ' with Square. I am reaching out to you today regarding a check you deposited into your account.\n\n' +
        'Thank you for using our mobile check deposit feature. It was found that check number ' + checkNum + ' deposited on ' + depositDate + ' for ' + subDisplay + ' was processed for the incorrect amount. As a result, we have credited your account ' + adjDisplay + '.\n\n' +
        'We are extremely sorry about the delay in receiving your funds and we do apologize for the inconvenience.\n\n' +
        'If you have any additional questions please don\'t hesitate to reach out. We are here to help!\n\n' +
        'Square Account Services';
    }

    // Create overlay popup
    var overlay = document.createElement('div');
    overlay.id = 'dan-email-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999999;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,-apple-system,sans-serif;';

    var popup = document.createElement('div');
    popup.style.cssText = 'background:#1a1a2e;color:#f0f0f0;border-radius:12px;width:600px;max-height:80vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);border:1px solid #333;';

    // Header
    var header = document.createElement('div');
    header.style.cssText = 'background:linear-gradient(135deg,' + (isDebit ? '#dc2626,#b91c1c' : '#00d632,#00b82a') + ');padding:14px 20px;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span style="font-weight:700;font-size:15px;color:white;">DAN ' + (isDebit ? 'Debit' : 'Credit') + ' Email — Check ' + checkNum + '</span><button id="dan-email-close" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;padding:0 4px;">✕</button>';

    // Body
    var body = document.createElement('div');
    body.style.cssText = 'padding:20px;';

    // Info bar
    var info = document.createElement('div');
    info.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;';
    info.innerHTML = '<span style="background:rgba(59,130,246,0.1);color:#3b82f6;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;">Row ' + rowNum + '</span>' +
      '<span style="background:rgba(59,130,246,0.1);color:#3b82f6;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;">Check #' + checkNum + '</span>' +
      '<span style="background:rgba(59,130,246,0.1);color:#3b82f6;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;">' + adjDisplay + '</span>' +
      '<span style="background:rgba(59,130,246,0.1);color:#3b82f6;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:600;">' + reason + '</span>';

    // Message area
    var msgArea = document.createElement('div');
    msgArea.style.cssText = 'background:#0d0d1a;border:1px solid #333;border-radius:8px;padding:16px;white-space:pre-wrap;font-size:13px;line-height:1.7;max-height:300px;overflow-y:auto;margin-bottom:16px;color:#e0e0e0;';
    msgArea.textContent = message;

    // Buttons
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;';
    btnRow.innerHTML = '<button id="dan-email-change-name" style="background:rgba(255,255,255,0.05);border:1px solid #444;color:#a0a0a0;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:500;">Change Name</button>' +
      '<button id="dan-email-copy" style="background:#00d632;color:#000;padding:10px 28px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:700;">Copy Message</button>';

    body.appendChild(info);
    body.appendChild(msgArea);
    body.appendChild(btnRow);
    popup.appendChild(header);
    popup.appendChild(body);
    overlay.appendChild(popup);

    // Remove existing overlay if present
    var existing = document.getElementById('dan-email-overlay');
    if (existing) existing.remove();
    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById('dan-email-close').onclick = function() { overlay.remove(); };
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

    document.getElementById('dan-email-copy').onclick = function() {
      navigator.clipboard.writeText(message).then(function() {
        var btn = document.getElementById('dan-email-copy');
        btn.textContent = '✓ Copied!';
        btn.style.background = '#00b82a';
        setTimeout(function() { btn.textContent = 'Copy Message'; btn.style.background = '#00d632'; }, 1500);
      }).catch(function() {
        // Fallback
        var ta = document.createElement('textarea');
        ta.value = message;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        var btn = document.getElementById('dan-email-copy');
        btn.textContent = '✓ Copied!';
        setTimeout(function() { btn.textContent = 'Copy Message'; }, 1500);
      });
    };

    document.getElementById('dan-email-change-name').onclick = function() {
      var newName = prompt('Enter your name:', agentName);
      if (newName) {
        sessionStorage.setItem('danAgentName', newName);
        overlay.remove();
        // Re-run with new name (user clicks bookmarklet again)
        alert('Name updated to: ' + newName + '. Click the bookmarklet again to regenerate.');
      }
    };

  } catch(e) {
    alert('DAN Email Generator Error: ' + e.message);
  }
})();
