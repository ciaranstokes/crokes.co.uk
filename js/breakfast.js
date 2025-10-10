// --- BREAKFAST TRACKER SCRIPT ---
        let breakfast_detectedDate = null; // Variable to store the date for the print function

        function breakfast_init() {
            // Set a static link on load, as this report URL doesn't use dynamic dates.
            const reportLink = document.getElementById('breakfast-report-link');
            const reportTemplate = MASTER_REPORT_LINKS.find(link => link.name === 'Breakfast List');
            if(reportLink && reportTemplate) {
                reportLink.href = reportTemplate.url;
            }
        }
        function breakfast_formatDateForButton(date) { const day = date.getDate(); let suffix = 'th'; if (day % 10 === 1 && day !== 11) suffix = 'st'; else if (day % 10 === 2 && day !== 12) suffix = 'nd'; else if (day % 10 === 3 && day !== 13) suffix = 'rd'; const month = date.toLocaleDateString('en-GB', { month: 'short' }); return `${day}${suffix} ${month}`; }
        function breakfast_calculateTotal() {
            let data = document.getElementById('orderData').value;

            // Auto-detect and set date from pasted data
            const dateMatch = data.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (dateMatch) {
                const [fullMatch, day, month, year] = dateMatch;
                // Store date object for printing
                breakfast_detectedDate = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day)));
            }
            
            const tableBody = document.getElementById('ordersTableBody');
            tableBody.innerHTML = '';
            let totalBreakfasts = 0;
            const filterStartIndex = data.indexOf('Filter\n');
            if (filterStartIndex !== -1) { data = data.substring(0, filterStartIndex); }
            const lines = data.split('\n').map(line => line.trim()).filter(line => line);
            const breakfastIndices = [];
            lines.forEach((line, index) => { if (line.toLowerCase().includes('breakfast')) { breakfastIndices.push(index); } });
            if (breakfastIndices.length === 0) { tableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-12 text-center text-gray-500"><span>No breakfast orders found.</span></td></tr>`; document.getElementById('totalAmount').textContent = '0'; return; }
            let searchBoundary = -1;
            breakfastIndices.forEach(bIndex => {
                let owner = 'N/A'; let ownerIndex = -1;
                for (let i = bIndex - 1; i > searchBoundary; i--) { const line = lines[i]; if (!/^\d{3}$/.test(line) && !/^\d$/.test(line) && line !== '‐') { owner = line; ownerIndex = i; break; } }
                let amountStr = 'N/A'; let amount = 0; const lineAfter1 = lines[bIndex + 1] || ''; const lineAfter2 = lines[bIndex + 2] || ''; const combinedAmountStr = (lineAfter1 + lineAfter2).replace(/\s/g, ''); const amountMatch = combinedAmountStr.match(/(\d+)\/(\d+)/); if (amountMatch) { amountStr = `${amountMatch[1]} / ${amountMatch[2]}`; amount = parseInt(amountMatch[2], 10) || 0; }
                let space = 'N/A'; const startSearchForSpace = (ownerIndex !== -1) ? ownerIndex - 1 : bIndex - 1; for (let i = startSearchForSpace; i > searchBoundary; i--) { if (/^\d{3}$/.test(lines[i])) { space = lines[i]; break; } }
                totalBreakfasts += amount;
                const row = document.createElement('tr');
                row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${space}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${owner}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${amountStr}</td>`;
                tableBody.appendChild(row);
                searchBoundary = bIndex;
            });
            document.getElementById('totalAmount').textContent = totalBreakfasts;
            if (tableBody.innerHTML === '') { tableBody.innerHTML = `<tr><td colspan="3" class="px-6 py-12 text-center text-gray-500"><span>Could not parse data.</span></td></tr>`; }
        }
        function breakfast_clearData() { document.getElementById('orderData').value = ''; document.getElementById('totalAmount').textContent = '0'; document.getElementById('ordersTableBody').innerHTML = `<tr><td colspan="3" class="px-6 py-12 text-center text-gray-500"><span>No data processed yet.</span></td></tr>`; }
        
        function breakfast_print() {
            // Use the date detected from the pasted data, or fallback to the current date.
            const printDate = breakfast_detectedDate || new Date();
            breakfast_printTable(printDate);
        }

        function breakfast_formatDateWithSuffix(date) { const day = date.getUTCDate(); let suffix = 'th'; if (day % 10 === 1 && day !== 11) suffix = 'st'; else if (day % 10 === 2 && day !== 12) suffix = 'nd'; else if (day % 10 === 3 && day !== 13) suffix = 'rd'; const weekday = date.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' }); const month = date.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' }); const year = date.getUTCFullYear(); return `${weekday}, ${day}${suffix} ${month} ${year}`; }
        
        function breakfast_printTable(date) {
            const tableContainer = document.querySelector('#breakfast-app .overflow-auto');
            if (!tableContainer || document.getElementById('ordersTableBody').children[0].textContent.includes('No data')) { return; }
            const totalBreakfasts = document.getElementById('totalAmount').textContent;
            const tableToPrint = tableContainer.querySelector('table').cloneNode(true);
            tableToPrint.querySelector('thead').classList.remove('sticky');
            const formattedDate = breakfast_formatDateWithSuffix(date);
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`<html><head><title>Printable Breakfast Orders</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><style>@media print{@page{size: A4; margin: 15mm;}}body{font-family: 'Inter', sans-serif; font-size: 8pt;}h1{text-align: center; font-size: 14pt; font-weight: 600; margin-bottom: 5px;}h2{text-align: center; font-size: 12pt; font-weight: 600; margin-bottom: 15px;}h3{text-align: center; font-size: 11pt; font-weight: 500; margin-bottom: 10px; color: #4b5563;}table{width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);}th, td{border-top: 1px solid #e5e7eb; padding: 4px; text-align: left;}td{border-left: 1px solid #e5e7eb;}td:first-child{border-left: none;}th{background-color: #f9fafb; font-weight: 600;}th:first-child, td:first-child{text-align: center;}th:last-child, td:last-child{width: 25%;}body{-webkit-print-color-adjust: exact; print-color-adjust: exact;}</style></head><body>`);
            printWindow.document.write(`<h1>Breakfast List</h1><h3>${formattedDate}</h3><h2>Total Breakfasts: ${totalBreakfasts}</h2>`);
            printWindow.document.write(tableToPrint.outerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
        }
