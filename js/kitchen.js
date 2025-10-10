 // --- KITCHEN PRODUCTS SCRIPT ---
        function kitchen_init() {
            const mainPrintBtn = document.getElementById('kitchen_mainPrintBtn');
            const clearBtn = document.getElementById('kitchen_clearBtn');
            const rawDataInput = document.getElementById('kitchen_rawData');
            mainPrintBtn.addEventListener('click', () => { if (!document.querySelector('#kitchen-app #results').innerHTML.trim()) { alert("Please paste data to generate a report before printing."); } else { window.print(); } });
            clearBtn.addEventListener('click', () => { rawDataInput.value = ''; kitchen_clearReportView(); rawDataInput.focus(); });
            rawDataInput.addEventListener('input', kitchen_processDataAndDisplay);
        }
        const KITCHEN_BREAKFAST_EMOJIS = ['🥞', '🍳', '🥓', '🥐', '🧇', '🥣', '🍊', '☕️', '🍩', '🥑'];
        
        function kitchen_parseData(text) {
            const dateRegex = /\d{2}\/\d{2}\/\d{4}/g;
            let dates = text.match(dateRegex) || [];
            if (dates.length === 0) return null;

            dates = [...new Set(dates)].sort((a, b) => {
                const [dayA, monthA, yearA] = a.split('/');
                const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
                const [dayB, monthB, yearB] = b.split('/');
                const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
                return dateA - dateB;
            });

            if (dates.length === 0) return null;

            let guestCounts = [];
            let breakfastCounts = [];
            const lines = text.split('\n');

            for (const line of lines) {
                const cleanedLine = line.replace(/\u00A0/g, ' ').trim();
                const lowerLine = cleanedLine.toLowerCase();

                if (lowerLine.startsWith('guests') && guestCounts.length === 0) {
                    const parts = cleanedLine.split(/\s+/).filter(p => !isNaN(parseInt(p)));
                    if (parts.length >= dates.length) {
                        guestCounts = parts.slice(-dates.length).map(Number);
                    }
                }
                
                if (lowerLine.startsWith('all products') && breakfastCounts.length === 0) {
                    const parts = cleanedLine.split(/\s+/).filter(p => !isNaN(parseInt(p)));
                    if (parts.length >= dates.length) {
                        breakfastCounts = parts.slice(-dates.length).map(Number);
                    }
                }
                else if (lowerLine.startsWith('breakfast') && breakfastCounts.length === 0) {
                     const parts = cleanedLine.split(/\s+/).filter(p => !isNaN(parseInt(p)));
                     if (parts.length >= dates.length) {
                        breakfastCounts = parts.slice(-dates.length).map(Number);
                    }
                }
            }

            if (dates.length === 0 || guestCounts.length !== dates.length || breakfastCounts.length !== dates.length) {
                return null;
            }

            return dates.map((date, index) => {
                const [day, month, year] = date.split('/');
                const dateObj = new Date(`${year}-${month}-${day}T00:00:00Z`);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
                return { date: date, day: dayName, guests: guestCounts[index] || 0, breakfasts: breakfastCounts[index] || 0 };
            });
        }

        function kitchen_displayReport(data) {
            const resultsDiv = document.querySelector('#kitchen-app #results');
            const reportTitle = document.querySelector('#kitchen-app #reportTitle');
            resultsDiv.innerHTML = ''; reportTitle.classList.remove('hidden');
            const table = document.createElement('table'); table.className = 'min-w-full bg-white border-separate border-spacing-0';
            table.innerHTML = `<thead class="bg-fuchsia-100"><tr><th class="px-6 py-3 text-center text-l font-bold text-purple-900 uppercase tracking-wider rounded-tl-2xl">Date</th><th class="px-6 py-3 text-center text-l font-bold text-purple-900 uppercase tracking-wider">Day</th><th class="px-6 py-3 text-center text-l font-bold text-purple-900 uppercase tracking-wider">Guests</th><th class="px-6 py-3 text-center text-l font-bold text-purple-900 uppercase tracking-wider rounded-tr-2xl">Breakfasts</th></tr></thead>
                <tbody>${data.map((row, index) => `<tr class="hover:bg-fuchsia-50"><td class="px-6 py-4 text-center text-lg font-normal border-b border-fuchsia-100">${row.date}</td><td class="px-6 py-4 text-center text-lg font-semibold border-b border-fuchsia-100">${row.day}</td><td class="px-6 py-4 text-center text-lg font-semibold border-b border-fuchsia-100">${row.guests}</td><td class="px-6 py-4 text-center border-b border-fuchsia-100"><div class="flex items-center justify-center"><span class="text-lg font-bold text-fuchsia-600">${row.breakfasts}</span><span class="text-2xl ml-2">${KITCHEN_BREAKFAST_EMOJIS[Math.floor(Math.random() * KITCHEN_BREAKFAST_EMOJIS.length)]}</span></div></td></tr>`).join('')}</tbody>`;
            resultsDiv.appendChild(table);
        }
        function kitchen_clearReportView() {
            const reportTitle = document.querySelector('#kitchen-app #reportTitle');
            const resultsDiv = document.querySelector('#kitchen-app #results');
            const errorMessage = document.getElementById('kitchen_error-message');

            if (reportTitle) reportTitle.classList.add('hidden');
            if (resultsDiv) resultsDiv.innerHTML = '';
            if (errorMessage) errorMessage.classList.add('hidden');
        }
        function kitchen_processDataAndDisplay() { 
            const rawText = document.getElementById('kitchen_rawData').value; 
            kitchen_clearReportView(); 
            if (!rawText.trim()) return; 
            const data = kitchen_parseData(rawText); 
            if (data) {
                kitchen_displayReport(data);
            } else {
                 document.getElementById('kitchen_error-message').classList.remove('hidden');
            }
        }
