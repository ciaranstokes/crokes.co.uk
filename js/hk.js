// --- HK CLEANING PLAN SCRIPT ---
        function hk_init() {
            const dataTextInput = document.getElementById('dataText');
            const printBtn = document.getElementById('printBtn');
            const clearDataBtn = document.getElementById('clearDataBtn');
            const outputContainer = document.getElementById('output-container');
            const printTableContainer = document.getElementById('print-table-container');
            const statusDiv = document.getElementById('status');
            const placeholder = document.getElementById('placeholder');
            const reportDateInput = document.getElementById('reportDate');
            
            const showUsedLastNightRowCheckbox = document.getElementById('showUsedLastNightRow');
            const showArrivingTodayRowCheckbox = document.getElementById('showArrivingTodayRow');
            const showGuestsRowCheckbox = document.getElementById('showGuestsRow'); 
            const showPetRowCheckbox = document.getElementById('showPetRow');
            const showTwinRowCheckbox = document.getElementById('showTwinRow');
            const showDaybedRowCheckbox = document.getElementById('showDaybedRow');
            const showTrundleRowCheckbox = document.getElementById('showTrundleRow');
            const showExtrasRowCheckbox = document.getElementById('showExtrasRow'); // NEW Checkbox
            const showStayingRoomsListCheckbox = document.getElementById('showStayingRoomsList');
            const showPetRoomsListCheckbox = document.getElementById('showPetRoomsList');
            const showTwinRoomsListCheckbox = document.getElementById('showTwinRoomsList');
            const showExtrasRoomsListCheckbox = document.getElementById('showExtrasRoomsList'); // NEW LIST CHECKBOX
            const showDepartingRoomInfoCheckbox = document.getElementById('showDepartingRoomInfo');
            const showStayingRoomInfoCheckbox = document.getElementById('showStayingRoomInfo');

            const changeTickBtn = document.getElementById('changeTickBtn');
            const currentTickEmojiSpan = document.getElementById('currentTickEmoji');
            const petEmojiDisplay = document.getElementById('petEmojiDisplay'); 
            const sparkleModeTitle = document.getElementById('sparkleModeTitle'); 
            const sparkleOptionsContainer = document.getElementById('sparkleOptionsContainer'); 

            let processedRooms = [];
            const tickEmojis = ['✔️', '✅', '🟢', '⭐', '✨', '💜', '💙'];
            let currentTickIndex = 0;
            let isSparkleMode = false;

            // --- HK EXTRA PRODUCTS CONSTANT ---
            const HK_EXTRA_PRODUCTS = [
                // MODIFIED: condition changed to 'DepartureDay'
                { name: 'Late Check Out', key: 'LateCheckOut', emoji: '✈️', condition: 'DepartureDay', hasValue: false }, 
                { name: 'Early Check In', key: 'EarlyCheckIn', emoji: '🛬', condition: 'ArrivalDay', hasValue: false }, // Plane landing emoji
                { name: 'Cot', key: 'Cot', emoji: '🛏️', condition: 'Arrival', hasValue: false }, // Cot/Bed emoji
                // MODIFIED: Bareca Voucher now tracks count AND value
                { name: 'Bareca Voucher', key: 'BarecaVoucher', emoji: '💵', condition: 'Arrival', hasValue: true }, // Money emoji
                { name: 'Picnic', key: 'Picnic', emoji: '🧺', condition: 'Arrival', hasValue: false }, // Picnic basket emoji
                { name: 'Prosecco', key: 'Prosecco', emoji: '🍾', condition: 'Arrival', hasValue: false }, // Champagne emoji
                { name: 'Selection of 6 IPA\'s', key: 'Selectionof6IPAs', emoji: '🍺', condition: 'Arrival', hasValue: false } // Beer emoji
            ];

            // --- NEW HELPER: Get value per unit from product name (e.g., gets 25 from Bareca Voucher (£25 Per Head)) ---
            function getExtraValue(keyword, cleanedText) {
                // Find the specific product line that includes the value in parentheses.
                // Regex to find the value associated with the keyword, assuming format (VALUE Per Head)
                const keywordBase = keyword.replace(/ \(\£.*?\)/, '').toLowerCase();
                
                // FIX: Corrected regex definition to use template literals and backslashes correctly
                const valueRegex = new RegExp(`${keywordBase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*\\(\\s*£(\\d+)\\s*Per Head\\)`, 'i');
                const match = cleanedText.match(valueRegex);
                
                return match ? parseInt(match[1], 10) : 0; // Returns the integer value (e.g., 25)
            }
            
            // Helper to determine stay duration
            function getStayDuration(dateRangeStr, reportDate) {
                const dateMatch = dateRangeStr.match(/(\d{2})\/(\d{2})\s*-\s*(\d{2})\/(\d{2})/);
                if (!dateMatch) return 0;
                
                const [, startDay, startMonth, endDay, endMonth] = dateMatch; 
                const year = reportDate.getFullYear(); 

                let startDate = new Date(year, parseInt(startMonth, 10) - 1, parseInt(startDay, 10)); 
                let endDate = new Date(year, parseInt(endMonth, 10) - 1, parseInt(endDay, 10));
                
                if (endDate < startDate) { 
                    const reportMonth = reportDate.getMonth(); 
                    if(reportMonth < 6 && parseInt(startMonth, 10) > 6) {
                        startDate.setFullYear(year - 1);
                    }
                    endDate.setFullYear(startDate.getFullYear() + (parseInt(endMonth, 10) < parseInt(startMonth, 10) ? 1 : 0)); 
                }
                
                // Calculate duration in days (including end day, then subtract 1 for nights)
                const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                return diffDays;
            }

            // Helper to get formatted date string for matching purposes
            function getFormattedDate(date) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                return `${day}/${month}`;
            }

            // NEW HELPER: Extracts and cleans the Bed Preference from notes
            function extractBedPreference(cleanedBlock) {
                // Regex to find "BED PREFERENCE:" and capture the text after the *last* colon, up to a line break or end of string.
                // Note: We search the whole block, not just the single line
                const bedPrefMatch = cleanedBlock.match(/BED PREFERENCE:(.*?)(\n|$)/i);
                
                if (bedPrefMatch && bedPrefMatch[1]) {
                    let rawPreference = bedPrefMatch[1].trim();
                    
                    // Look for the last occurrence of the colon (which separates boilerplate from preference)
                    // This handles cases like "Standard Double or Twin Room: 1 extra-large double - Standard Double or Twin Room: 1 extra-large double"
                    const lastColonIndex = rawPreference.lastIndexOf(':');
                    
                    if (lastColonIndex !== -1) {
                        // Return everything after the last colon and trim whitespace
                        return rawPreference.substring(lastColonIndex + 1).trim();
                    }
                    // If no colon after "BED PREFERENCE:", return the raw text
                    return rawPreference;
                }

                // If "BED PREFERENCE:" is not found, return null
                return null; 
            }
            
            // --- NEW: Robust Item Counter for the new columnar format ---
            function getItemCount(keyword, cleanedBlock, dateRangeStr, reportDate) { 
                let total = 0;
                const keywordBase = keyword.replace(/ \(\£.*?\)/, '').toLowerCase(); // Remove price info for matching

                // 1. Look for explicit "X x Keyword" in the cleaned block (Products column)
                // This regex is flexible to handle the "X x Product Name (price)" structure.
                const productRegex = new RegExp(`(\\d+)\\s*x\\s+${keywordBase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'ig'); 
                let match;
                
                let productCount = 0;
                while ((match = productRegex.exec(cleanedBlock.toLowerCase())) !== null) {
                    productCount += parseInt(match[1], 10);
                }
                
                // Special case: Pet Guests (Your specific request)
                if (keywordBase.includes('pet guest')) {
                    // Check for explicit "Second Pet" product, which overrides simple per-night logic if found.
                    const secondPetRegex = new RegExp(`(second\\s*pet\\s*guest)|(2nd\\s*pet)`, 'ig');
                    if (secondPetRegex.test(cleanedBlock.toLowerCase())) {
                         // If a second pet product is explicitly listed, assume 2 pets.
                         return 2; 
                    }
                    
                    // If no explicit "Second Pet", check if the purchased count matches the stay duration.
                    if (dateRangeStr) {
                        const duration = getStayDuration(dateRangeStr, reportDate);
                        
                        // If the total product count (e.g., 2 x Pet Guest) equals the duration (2 nights), 
                        // it signifies 1 pet charged per night.
                        if (productCount > 0 && productCount === duration) {
                            return 1;
                        } 
                        
                        // If the product count is greater than duration, it suggests multiple pets.
                        if (productCount > duration) {
                             // Assuming any excess is due to a second pet charged per night.
                             // Example: 4 x Pet Guest (2 nights). Duration is 2. 4/2 = 2 pets.
                             // Since the data format is inconsistent, we stick to checking for the divisor.
                             if (duration > 0 && productCount % duration === 0) {
                                 return productCount / duration;
                             }
                        }
                    }
                    
                    // Fallback: If any pet product is listed, assume 1 pet is present today, unless overridden by the logic above.
                    if (productCount > 0) return 1;
                    
                    return 0;
                }

                // Default logic for other products: use direct count accumulated above
                total = productCount;
                
                // 2. Look for implicit keyword mentions (fallback for non-pet products)
                if (total === 0) {
                     // Check for simple mentions, excluding the "X x " prefix
                    const implicitRegex = new RegExp(`(?!\\d\\s*x\\s*)\\b${keywordBase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'ig');
                    if (implicitRegex.test(cleanedBlock.toLowerCase())) {
                        if (keywordBase.includes('twin') || keywordBase.includes('zedbed') || keywordBase.includes('daybed') || keywordBase.includes('trundle')) {
                            total = 1;
                        } else if (!keywordBase.includes('pet guest')) {
                            total = 1;
                        }
                    }
                }
                
                // Special case for Twin Beds, check for TWIN BEDS in caps in notes (overrides previous total if it was 0)
                if (keywordBase.includes('twin') && cleanedBlock.toUpperCase().includes('TWIN BEDS')) {
                    if (total === 0) total = 1; 
                }
                
                // Special case for ZedBed/Daybed
                if (keywordBase.includes('zedbed') && (cleanedBlock.toUpperCase().includes('ZEDBED') || cleanedBlock.toLowerCase().includes('daybed'))) {
                    if (total === 0) total = 1;
                }

                return total;
            }

            // --- NEW: Extracts extra product counts and values ---
            function extractExtraProducts(cleanedBlock, dateRangeStr, reportDate) {
                const extras = {};
                HK_EXTRA_PRODUCTS.forEach(item => {
                    // Pass date info for pet logic
                    const count = getItemCount(item.name, cleanedBlock, dateRangeStr, reportDate);
                    extras[item.key] = count;
                    
                    if (item.hasValue) {
                        if (count > 0) {
                            const pricePerUnit = getExtraValue(item.name, cleanedBlock);
                            // Store the total value (Count * PricePerUnit)
                            extras[`${item.key}Value`] = count * pricePerUnit; 
                        } else {
                            extras[`${item.key}Value`] = 0; // Ensure property exists even if count is zero
                        }
                    }
                });
                return extras;
            }
            
            // --- NEW: Core Parsing Logic for the new columnar format ---
            function parseBlock(block, reportDate) {
                const lines = block.split('\n');
                const firstLine = lines[0].trim();
                
                // Capture Room, Customer/Notes snippet, and Date Range from the first line
                // The regex looks for: (Room#) (Customer Name/Notes...) (Date Range)
                const primaryMatch = firstLine.match(/^(\d{3})\s+(.*?)\s+(\d{2}\/\d{2}\s*-\s*\d{2}\/\d{2})/);

                if (!primaryMatch) return null;

                const room = primaryMatch[1];
                const dateRangeStr = primaryMatch[3]; 
                
                // 1. Extract Customer Name
                let customerName = 'Unknown Guest';
                const customerNameMatch = primaryMatch[2].match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/);
                if (customerNameMatch) {
                    customerName = customerNameMatch[1].trim();
                } else {
                    const fallbackMatch = primaryMatch[2].match(/^(\w+\s+\w+)/);
                    if (fallbackMatch) customerName = fallbackMatch[1].trim();
                }
                
                let guestCount = 2; // Default
                let productsAndNotes = '';

                // Find the Companions column (e.g., '2 ×')
                const wholeBlockContent = block.replace(/\n/g, ' '); // Flatten the entire block for searching
                const countMatch = wholeBlockContent.match(/(\d+)\s*×/g);
                if (countMatch && countMatch.length > 0) {
                     // Get the last count, which is most likely the Companion count
                    guestCount = parseInt(countMatch[countMatch.length - 1], 10);
                }

                productsAndNotes = wholeBlockContent;
                
                // Initialize start/end dates for extra product checks later
                let startDate = null;
                let endDate = null;

                const roomData = { 
                    room: room, 
                    status: 'Stay', 
                    pet: 0, 
                    twin: 0, 
                    double: 0, 
                    daybed: 0, 
                    trundle: 0, 
                    customerName: customerName, 
                    guests: guestCount,
                    // Initialize value field manually
                    BarecaVoucherValue: 0,
                    // Bed preference will store the cleaned string here
                    bedPreference: extractBedPreference(block) 
                };
                
                // Date Range Parsing
                const dateMatch = dateRangeStr.match(/(\d{2})\/(\d{2})\s*-\s*(\d{2})\/(\d{2})/);
                if (dateMatch) {
                    const [, startDay, startMonth, endDay, endMonth] = dateMatch; 
                    const year = reportDate.getFullYear(); 
                    startDate = new Date(year, parseInt(startMonth, 10) - 1, parseInt(startDay, 10)); 
                    endDate = new Date(year, parseInt(endMonth, 10) - 1, parseInt(endDay, 10));
                    
                    if (endDate < startDate) { 
                        const reportMonth = reportDate.getMonth(); 
                        if(reportMonth < 6 && parseInt(startMonth, 10) > 6) {
                            startDate.setFullYear(year - 1);
                        }
                        endDate.setFullYear(startDate.getFullYear() + (parseInt(endMonth, 10) < parseInt(startMonth, 10) ? 1 : 0)); 
                    }

                    const reportDateMidnight = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate()).getTime();
                    const startDayMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
                    const endDayMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
                    
                    if (startDayMidnight === reportDateMidnight) {
                        roomData.status = 'Arrival';
                    } else if (endDayMidnight === reportDateMidnight) {
                        roomData.status = 'Depart';
                    } else if (reportDateMidnight > startDayMidnight && reportDateMidnight < endDayMidnight) {
                        roomData.status = 'Stay';
                    } else { 
                        return null;
                    }

                    // Store dates as formatted strings for comparison in isRelevant logic
                    roomData.startDateFormatted = getFormattedDate(startDate);
                    roomData.endDateFormatted = getFormattedDate(endDate);
                    roomData.reportDateFormatted = getFormattedDate(reportDate);

                } else { 
                    roomData.status = 'Check'; 
                }
                
                const cleanedBlock = productsAndNotes;
                
                // Room Type/Extras Parsing using new `getItemCount`
                
                // MODIFIED PET LOGIC: Pass dateRangeStr and reportDate for duration check
                roomData.pet = getItemCount('Pet Guest', cleanedBlock, dateRangeStr, reportDate);
                
                // Step 1: Initial Twin check (may incorrectly match "Standard Double or Twin Room")
                roomData.twin = getItemCount('Twin Beds', cleanedBlock, dateRangeStr, reportDate) + getItemCount('Twin', cleanedBlock, dateRangeStr, reportDate);

                // Step 2: OVERRIDE TWIN/DOUBLE BASED ON CLEANED BED PREFERENCE
                if (roomData.bedPreference) {
                    const preference = roomData.bedPreference.toLowerCase();
                    
                    if (preference.includes('double') || preference.includes('extra-large double') || preference.includes('queen') || preference.includes('king')) {
                        // Preference explicitly states a non-twin setup (e.g., "1 extra-large double")
                        roomData.twin = 0;
                        roomData.double = 1; 
                    } else if (preference.includes('twin') || preference.includes('single')) {
                        // Preference explicitly states a twin/single setup (e.g., "2 single beds")
                        roomData.twin = 1;
                        roomData.double = 0;
                    }
                    // If preference is vague or null (like "BED PREFERENCE: N/A"), it keeps the calculated roomData.twin/double from Step 1/3
                }
                
                // Consolidate Daybed/ZedBed count (no duration check needed)
                roomData.daybed = getItemCount('ZedBed', cleanedBlock, dateRangeStr, reportDate) + getItemCount('Daybed', cleanedBlock, dateRangeStr, reportDate);
                
                roomData.trundle = getItemCount('Trundle', cleanedBlock, dateRangeStr, reportDate);
                
                // Step 3: Final fallback for generic twin/double rooms with no explicit preference match
                if (roomData.twin === 0) roomData.double = 1;
                
                // NEW: Extra product counts and values
                // Pass date info for Bareca duration check (though typically Bareca won't use this logic)
                Object.assign(roomData, extractExtraProducts(cleanedBlock, dateRangeStr, reportDate)); 
                
                return roomData;
            }
            
            // --- Original function for Turnaround logic (relies on correct parseBlock output) ---
            function processTurnarounds(rooms) {
                const roomsByNumber = {}; rooms.forEach(room => { if (!roomsByNumber[room.room]) roomsByNumber[room.room] = []; roomsByNumber[room.room].push(room); });
                const finalRooms = [];
                for (const roomNumber in roomsByNumber) {
                    const entries = roomsByNumber[roomNumber];
                    if (entries.length > 1) { const departure = entries.find(r => r.status === 'Depart'); const arrival = entries.find(r => r.status === 'Arrival'); if (departure && arrival) { if (departure.customerName.toLowerCase() === arrival.customerName.toLowerCase()) { finalRooms.push({ ...arrival, status: 'Stay' }); } else { finalRooms.push({ ...arrival, status: 'Depart/Arrive', isTwinTurnaround: departure.twin > 0 && arrival.twin > 0 }); } } else { finalRooms.push(...entries); } } else { finalRooms.push(entries[0]); }
                }
                return finalRooms.sort((a,b) => parseInt(a.room) - parseInt(b.room));
            }


            dataTextInput.addEventListener('input', () => { autoDetectReportDate(); if (dataTextInput.value.trim().length > 5) { parseAndGenerate(); } else { clearOutput(); } });
            clearDataBtn.addEventListener('click', clearData); 

            printBtn.addEventListener('click', () => {
                const landscapeStyle = document.createElement('style');
                landscapeStyle.id = 'hk-landscape-style';
                landscapeStyle.innerHTML = '@page { size: A4 landscape; margin: 0.5in; }';
                document.head.appendChild(landscapeStyle);
                
                window.print();
                
                window.onafterprint = function() {
                    const styleElement = document.getElementById('hk-landscape-style');
                    if (styleElement) {
                        styleElement.remove();
                    }
                    window.onafterprint = null;
                };

                setTimeout(() => {
                    const styleElement = document.getElementById('hk-landscape-style');
                    if (styleElement) {
                        styleElement.remove();
                    }
                }, 1000);
            });

            sparkleModeTitle.addEventListener('click', () => { isSparkleMode = !isSparkleMode; updateSparkleMode(isSparkleMode); });
            changeTickBtn.addEventListener('click', () => { if (isSparkleMode) { currentTickIndex = (currentTickIndex + 1) % tickEmojis.length; currentTickEmojiSpan.textContent = tickEmojis[currentTickIndex]; if (processedRooms.length > 0) renderOutput(processedRooms); } });
            
            function setupAutoGenerateListeners() {
                const allCheckboxes = [...(document.getElementById('rowCheckboxes')?.querySelectorAll('input[type="checkbox"]') || []), ...(document.getElementById('listCheckboxes')?.querySelectorAll('input[type="checkbox"]') || [])];
                allCheckboxes.forEach(checkbox => checkbox.addEventListener('change', () => { if (processedRooms.length > 0) { renderOutput(processedRooms); updateStatus('Print options updated.', 'success'); } else { updateStatus('Please paste data first.', 'default'); } }));
            }
            setupAutoGenerateListeners();

            function clearData() { dataTextInput.value = ''; reportDateInput.value = ''; processedRooms = []; clearOutput(); updateStatus('Data cleared.', 'default'); }
            function clearOutput() { outputContainer.innerHTML = ''; outputContainer.appendChild(placeholder); printTableContainer.innerHTML = ''; }
            
            function autoDetectReportDate() {
                const rawText = dataTextInput.value; const dateMatch = rawText.match(/(\d{2}\/\d{2}\/(\d{4}|\d{2}))/i);
                if (dateMatch) { let [full, dateStr, year] = dateMatch; let [day, month] = dateStr.split('/'); if (year.length === 2) year = '20' + year; reportDateInput.value = `${year}-${month}-${day}`; updateStatus(`Date auto-detected: ${dateStr}.`, 'success'); } 
                else if (!reportDateInput.value) { updateStatus('Date not found.', 'error'); }
            }

            function updateSparkleMode(isSparkle) {
                sparkleModeTitle.textContent = isSparkle ? '✨Sparkle Mode✨' : 'Work Mode';
                sparkleOptionsContainer.classList.toggle('hidden', !isSparkle);
                if (!isSparkle) { currentTickIndex = 0; currentTickEmojiSpan.textContent = tickEmojis[0]; }
                if (processedRooms.length > 0) { renderOutput(processedRooms); updateStatus(`Mode changed.`, 'success'); }
            }
            
            function parseAndGenerate() {
                const rawText = dataTextInput.value; const reportDateStr = reportDateInput.value;
                if (!reportDateStr || !rawText.trim()) { updateStatus('Please select a date and paste data.', 'error'); return; }
                updateStatus('Parsing...', 'loading');
                const reportDate = new Date(reportDateStr + 'T00:00:00'); 
                
                // Split logic adjusted for new format: look for Room ID at the start of a line
                const blocks = rawText.split(/^\s*(?=\d{3})/m).filter(block => block.trim() !== "");
                
                if (blocks.length === 0) { updateStatus('No valid room data found. Check data is correct.', 'error'); return; }
                const allRoomsRaw = blocks.map(block => parseBlock(block, reportDate)).filter(Boolean); 
                processedRooms = processTurnarounds(allRoomsRaw);
                
                if (processedRooms.length > 0) { 
                    renderOutput(processedRooms); 
                    updateStatus(`Generated plan for ${processedRooms.length} rooms.`, 'success'); 
                } else { 
                    clearOutput(); 
                    updateStatus('No reservations found for date.', 'error'); 
                }
            }
            function renderOutput(rooms) { generateReportView(rooms); generatePrintView(rooms); }

            function getActiveExtras(rooms) {
                const activeExtras = {};
                HK_EXTRA_PRODUCTS.forEach(item => {
                    const key = item.key;
                    if (rooms.some(room => {
                        const status = room.status;
                        
                        // NEW LOGIC: Checks if the extra is relevant for today's tasks
                        let isRelevant = false;
                        if (item.condition === 'DepartureDay') {
                            // Late Check Out is only relevant on the exact day of departure
                            isRelevant = room.reportDateFormatted === room.endDateFormatted;
                        } else if (item.condition === 'ArrivalDay') {
                            // Early Check In is only relevant on the exact day of arrival
                            isRelevant = room.reportDateFormatted === room.startDateFormatted;
                        } else if (item.condition === 'Arrival') {
                            // Other arrival-based products (Bareca, Cot, Picnic, etc.) are relevant on Arrival or Depart/Arrive
                            isRelevant = status === 'Arrival' || status === 'Depart/Arrive';
                        }
                        
                        return (room[key] > 0 && isRelevant);
                    })) {
                        activeExtras[key] = item;
                    }
                });
                return activeExtras;
            }
            
            // --- UPDATED generateReportView: Dynamic Key and Consolidated Extras Row (Screen) ---
            function generateReportView(rooms) {
                outputContainer.innerHTML = ''; 
                const needsAlertKey = rooms.some(room => room.guests >= 3 && room.daybed === 0 && room.trundle === 0); 
                const hasTwinTurnaround = rooms.some(room => room.isTwinTurnaround);
                const activeExtras = getActiveExtras(rooms);
                const keyContainer = document.createElement('div'); 
                keyContainer.className = 'bg-sky-50 p-4 sm:p-6 rounded-2xl border-2 border-sky-200 mb-8 shadow-md';
                
                // --- Basic Status Key ---
                let keyHtml = `<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-semibold text-slate-700">
                    <div class="flex items-center"><span class="inline-block w-5 h-5 mr-2 rounded bg-purple-200"></span>Depart/Arrive</div>
                    <div class="flex items-center"><span class="inline-block w-5 h-5 mr-2 rounded bg-green-200"></span>Arrival</div>
                    <div class="flex items-center"><span class="inline-block w-5 h-5 mr-2 rounded bg-red-200"></span>Depart</div>
                    <div class="flex items-center"><span class="inline-block w-5 h-5 mr-2 rounded bg-blue-200"></span>Stay</div>
                </div>`;
                
                // --- Alert and Extras Key ---
                let detailsHtml = ''; 
                let extrasHtml = '';

                // 1. Alerts
                if (needsAlertKey) detailsHtml += `<div class="flex items-center text-slate-700 font-semibold text-sm"><span class="text-xl mr-2">⚠️</span>Missing Daybed/Trundle</div>`; 
                if (hasTwinTurnaround) detailsHtml += `<div class="flex items-center text-slate-700 font-semibold text-sm"><span class="text-xl mr-2">⭐</span>Twin Turnaround</div>`;
                
                // 2. Extras (Dynamic - uses activeExtras array)
                const renderedExtras = Object.values(activeExtras);
                const isExtrasRowVisible = showExtrasRowCheckbox.checked; // Check toggle status here

                if (isExtrasRowVisible && renderedExtras.length > 0) {
                    extrasHtml = `<h4 class="col-span-2 text-base font-bold text-sky-700 mt-2">Product Key (Extras)</h4>`;
                    renderedExtras.forEach(item => {
                        let name = item.name;
                        // ADDED: Show (Total Value) if the item tracks a value
                        if (item.hasValue) {
                           name += ' (Total Value)'; 
                        }
                        extrasHtml += `<div class="flex items-center text-slate-700 font-semibold text-sm"><span class="text-xl mr-2">${item.emoji}</span>${name}</div>`;
                    });
                }

                // Combine alerts and extras
                if (detailsHtml || extrasHtml) {
                    keyHtml += `<div class="grid grid-cols-2 gap-4 pt-3 mt-3 border-t">`;
                    if (detailsHtml) {
                        keyHtml += `<div class="col-span-2 sm:col-span-1 space-y-2"><h4 class="text-base font-bold text-sky-700">Alerts</h4>${detailsHtml}</div>`;
                        keyHtml += `<div class="col-span-2 sm:col-span-1 space-y-2">${extrasHtml}</div>`;
                    } else if (extrasHtml) { // Only show extras block if there are extras and no alerts block
                        // If no alerts, use full width for extras grid
                        keyHtml += `<div class="col-span-2 space-y-2 grid grid-cols-2 gap-4">${extrasHtml}</div>`;
                    }
                    keyHtml += `</div>`;
                }
                
                keyContainer.innerHTML = keyHtml; 
                outputContainer.appendChild(keyContainer);
                
                const floors = [{ title: 'Ground Floor', rooms: rooms.filter(r => parseInt(r.room) <= 6) }, { title: 'First Floor', rooms: rooms.filter(r => parseInt(r.room) >= 101 && parseInt(r.room) <= 130) }, { title: 'Second Floor', rooms: rooms.filter(r => parseInt(r.room) >= 201 && parseInt(r.room) <= 230) }];
                floors.forEach(floor => { if (floor.rooms.length > 0) { const floorContainer = document.createElement('div'); floorContainer.className = 'mb-10'; floorContainer.innerHTML = `<h2 class="text-2xl font-bold text-sky-800 mb-3">${floor.title}</h2>`; floorContainer.appendChild(createScreenTableForRooms(floor.rooms)); outputContainer.appendChild(floorContainer); } });
                
                const listContainer = document.createElement('div'); listContainer.className = 'mt-10 pt-6 border-t-2'; 
                
                // Staying Rooms List: Comma-separated
                if (showStayingRoomsListCheckbox.checked) { 
                    const staying = rooms.filter(r => r.status === 'Stay').map(r => r.room); 
                    if (staying.length > 0) listContainer.appendChild(createScreenListSection('Staying Rooms List', staying.join(', '))); 
                } 
                
                if (showPetRoomsListCheckbox.checked) { const pets = rooms.filter(r => r.pet > 0).map(r => r.room); if (pets.length > 0) listContainer.appendChild(createScreenListSection('Pet Rooms List', pets.join(', '))); } 
                if (showTwinRoomsListCheckbox.checked) { const twins = rooms.filter(r => r.twin > 0).map(r => r.room); if (twins.length > 0) listContainer.appendChild(createScreenListSection('Twin Rooms List', twins.join(', '))); } 
                
                // Extras List: Itemized (complex content)
                if (showExtrasRoomsListCheckbox.checked) { 
                    const extraRooms = rooms.filter(room => {
                        return HK_EXTRA_PRODUCTS.some(item => {
                            const key = item.key;
                            // NEW LOGIC: Checks if the extra is relevant for today's tasks
                            let isRelevant = false;
                            if (item.condition === 'DepartureDay') {
                                isRelevant = room.reportDateFormatted === room.endDateFormatted;
                            } else if (item.condition === 'ArrivalDay') {
                                isRelevant = room.reportDateFormatted === room.startDateFormatted;
                            } else if (item.condition === 'Arrival') {
                                isRelevant = room.status === 'Arrival' || room.status === 'Depart/Arrive';
                            }
                            return (room[key] > 0 && isRelevant);
                        });
                    });

                    if (extraRooms.length > 0) {
                        const listItems = extraRooms.map(room => {
                            const activeItems = HK_EXTRA_PRODUCTS.filter(item => {
                                const key = item.key;
                                // NEW LOGIC: Checks if the extra is relevant for today's tasks
                                let isRelevant = false;
                                if (item.condition === 'DepartureDay') {
                                    isRelevant = room.reportDateFormatted === room.endDateFormatted;
                                } else if (item.condition === 'ArrivalDay') {
                                    isRelevant = room.reportDateFormatted === room.startDateFormatted;
                                } else if (item.condition === 'Arrival') {
                                    isRelevant = room.status === 'Arrival' || room.status === 'Depart/Arrive';
                                }
                                return (room[key] > 0 && isRelevant);
                            }).map(item => {
                                let label = item.name;
                                // ADDED: Value logic for screen list
                                if (item.hasValue && room[`${item.key}Value`] > 0) {
                                    label += ` (£${room[`${item.key}Value`]} Total)`;
                                } else if (item.hasValue && room[item.key] > 0) {
                                    // Should not happen if parsing is correct, but safer to include
                                    label += ` (Price N/A)`;
                                }

                                return `${item.emoji} ${label}`;
                            });
                            return `${room.room}: ${activeItems.join(', ')}`;
                        });
                        listContainer.appendChild(createScreenListSection('Extra List', listItems));
                    }
                }
                
                if (listContainer.hasChildNodes()) outputContainer.appendChild(listContainer);
            }
            
            // --- UPDATED createScreenTableForRooms: Consolidated Extras Row Logic (Value Removed from Cell) ---
            function createScreenTableForRooms(rooms) {
                const tableWrapper = document.createElement('div'); tableWrapper.className = 'bg-white rounded-3xl shadow-lg border overflow-x-auto'; 
                const table = document.createElement('table'); table.className = 'w-full';
                let headerHtml = '<thead><tr class="divide-x"><th class="sticky left-0 z-20 p-4 bg-sky-100/70"></th>'; 
                rooms.forEach(room => { let screenColor = 'bg-blue-100'; if (room.status === 'Arrival') screenColor = 'bg-green-100'; if (room.status === 'Depart') screenColor = 'bg-red-100'; if (room.status === 'Depart/Arrive') screenColor = 'bg-purple-100'; headerHtml += `<th class="p-3 font-extrabold text-center ${screenColor}">${room.room}</th>`; }); 
                headerHtml += '</tr></thead>';
                
                const tbody = document.createElement('tbody'); tbody.className = 'divide-y'; 
                const rows = []; 
                if (showUsedLastNightRowCheckbox.checked) rows.push('Used Last Night'); 
                if (showArrivingTodayRowCheckbox.checked) rows.push('Arriving Today'); 
                if (showGuestsRowCheckbox.checked) rows.push('Guests'); 
                if (showPetRowCheckbox.checked) rows.push('Pet'); 
                if (showTwinRowCheckbox.checked) rows.push('Twin'); 
                if (showDaybedRowCheckbox.checked) rows.push('Daybed'); 
                if (showTrundleRowCheckbox.checked) rows.push('Trundle');
                
                // Check if the 'Extras' toggle is on
                const isExtrasRowVisible = showExtrasRowCheckbox.checked;

                // Check if any extra product is present in data for the relevant status
                const hasExtraProducts = rooms.some(room => 
                    HK_EXTRA_PRODUCTS.some(item => {
                        const key = item.key;
                        // NEW LOGIC: Checks if the extra is relevant for today's tasks
                        let isRelevant = false;
                        if (item.condition === 'DepartureDay') {
                            isRelevant = room.reportDateFormatted === room.endDateFormatted;
                        } else if (item.condition === 'ArrivalDay') {
                            isRelevant = room.reportDateFormatted === room.startDateFormatted;
                        } else if (item.condition === 'Arrival') {
                            isRelevant = room.status === 'Arrival' || room.status === 'Depart/Arrive';
                        }
                        return (room[key] > 0 && isRelevant);
                    })
                );

                // Add consolidated 'Extra' row ONLY IF toggle is ON AND products are present
                if (isExtrasRowVisible && hasExtraProducts) {
                    rows.push('Extra');
                }

                rows.forEach(feature => {
                    let rowHtml = '';

                    if (feature === 'Extra') {
                        // --- Consolidated Extra Row (Screen) - Fixed logic and sizing ---
                        // Feature header: Same as other rows (using 'font-semibold')
                        let rowContentHtml = `<tr class="group divide-x"><td class="sticky left-0 z-10 bg-white group-hover:bg-sky-50/70 p-3 pl-6 font-semibold text-gray-800">${feature}</td>`;
                        
                        rooms.forEach(room => {
                            let extraItems = [];
                            HK_EXTRA_PRODUCTS.forEach(item => {
                                const key = item.key;
                                // NEW LOGIC: Checks if the extra is relevant for today's tasks
                                let isRelevant = false;
                                if (item.condition === 'DepartureDay') {
                                    isRelevant = room.reportDateFormatted === room.endDateFormatted;
                                } else if (item.condition === 'ArrivalDay') {
                                    isRelevant = room.reportDateFormatted === room.startDateFormatted;
                                } else if (item.condition === 'Arrival') {
                                    isRelevant = room.status === 'Arrival' || room.status === 'Depart/Arrive';
                                }
                                
                                // Now checking for count for all products, and no value added
                                if (room[item.key] > 0 && isRelevant) {
                                    let content = item.emoji;
                                    // REMOVED: Value display for Bareca here (per user request)
                                    extraItems.push(`<span>${content}</span>`); 
                                }
                            });
                            
                            const cellContent = extraItems.join(' '); // Use space separator
                            // ADDED: compact-display class to the TD for generic styling control
                            rowContentHtml += `<td class="p-3 text-center font-bold group-hover:bg-sky-50/70 compact-display">${cellContent}</td>`;
                        });
                        
                        rowHtml = rowContentHtml + '</tr>';

                    } else {
                        // --- Regular Rows (Pet, Twin, Daybed, etc.) ---
                        rowHtml = `<tr class="group divide-x"><td class="sticky left-0 z-10 bg-white group-hover:bg-sky-50/70 p-3 pl-6 font-semibold">${feature}</td>`;
                        
                        rooms.forEach(room => {
                            let value = ''; 
                            const needsAlert = room.guests >= 3 && room.daybed === 0 && room.trundle === 0; 
                            const alertClass = needsAlert ? 'bg-yellow-100/50' : '';
                            
                            // Existing logic for core rows
                            if (!((room.status === 'Stay' && !showStayingRoomInfoCheckbox.checked) || (room.status === 'Depart' && !showDepartingRoomInfoCheckbox.checked))) {
                                const isUsed = room.status === 'Stay' || room.status === 'Depart' || room.status === 'Depart/Arrive'; 
                                const isArriving = room.status === 'Arrival' || room.status === 'Depart' || room.status === 'Depart/Arrive'; 
                                let tickValue = isSparkleMode ? tickEmojis[currentTickIndex] : '✓'; 
                                let petValue = room.pet > 0 ? (isSparkleMode ? '🐶'.repeat(room.pet) : room.pet) : '';

                                switch (feature) { 
                                    case 'Used Last Night': value = isUsed ? tickValue : ''; break; 
                                    case 'Arriving Today': value = isArriving ? tickValue : ''; break; 
                                    case 'Guests': value = room.guests > 0 ? room.guests : ''; break; 
                                    case 'Pet': value = petValue; break; 
                                    case 'Twin': value = room.twin > 0 ? (tickValue + (room.isTwinTurnaround ? '⭐' : '')) : ''; break; 
                                    case 'Daybed': value = (room.daybed > 0 ? tickValue : '') + (needsAlert ? ' ⚠️' : ''); break; 
                                    case 'Trundle': value = (room.trundle > 0 ? tickValue : '') + (needsAlert ? ' ⚠️' : ''); break; 
                                }
                            }
                            
                            rowHtml += `<td class="p-3 text-center font-bold group-hover:bg-sky-50/70 ${alertClass}">${value}</td>`;
                        });
                        
                        rowHtml += '</tr>';
                    }

                    tbody.innerHTML += rowHtml;
                });

                table.innerHTML = headerHtml; table.appendChild(tbody); tableWrapper.appendChild(table); return tableWrapper;
            }
            // Update createScreenListSection to handle simple string/comma separation or itemized list
            function createScreenListSection(title, content) { 
                const container = document.createElement('div'); 
                container.className = 'mb-4 bg-white p-4 rounded-2xl shadow-sm border'; 
                
                let listContent;
                if (Array.isArray(content)) {
                    // Itemized list for complex content (e.g., Extras List)
                    listContent = content.map(item => `<li>${item}</li>`).join(''); 
                    container.innerHTML = `<h3 class="text-lg font-bold text-sky-800 mb-2">${title}</h3><ul class="list-none space-y-1 text-base">${listContent}</ul>`;
                } else {
                    // Simple string/comma-separated list (e.g., Staying Rooms)
                    container.innerHTML = `<h3 class="text-lg font-bold text-sky-800 mb-2">${title}</h3><p class="text-base">${content}</p>`;
                }

                return container; 
            }
            
            // --- UPDATED generatePrintView: Consolidated Key Structure for Print (FINAL FIX) ---
            function generatePrintView(rooms) {
                printTableContainer.innerHTML = ''; 
                const needsAlertKey = rooms.some(room => room.guests >= 3 && room.daybed === 0 && room.trundle === 0); 
                const hasTwinTurnaround = rooms.some(room => room.isTwinTurnaround);
                
                // --- Extras Key (Dynamic & Conditional) ---
                const renderedExtras = HK_EXTRA_PRODUCTS.filter(item => {
                    return rooms.some(room => {
                        const key = item.key;
                        // NEW LOGIC: Checks if the extra is relevant for today's tasks
                        let isRelevant = false;
                        if (item.condition === 'DepartureDay') {
                            isRelevant = room.reportDateFormatted === room.endDateFormatted;
                        } else if (item.condition === 'ArrivalDay') {
                            isRelevant = room.reportDateFormatted === room.startDateFormatted;
                        } else if (item.condition === 'Arrival') {
                            isRelevant = room.status === 'Arrival' || room.status === 'Depart/Arrive';
                        }
                        return (room[key] > 0 && isRelevant);
                    });
                });

                // --- Build consolidated Extras List items (no wrapping div) ---
                let extrasListHtml = '';
                if (showExtrasRowCheckbox.checked && renderedExtras.length > 0) {
                     extrasListHtml = renderedExtras.map(item => {
                         const name = item.name;
                         const valueText = item.hasValue ? '(Total Value)' : '';
                         // Use a simpler div wrapper for the consolidated item
                         return `<div style="display: flex; align-items: center; white-space: nowrap; margin-right: 1rem;"><span style="font-size: 1.25rem; margin-right: 0.3rem;">${item.emoji}</span><strong>${name}</strong> ${valueText}</div>`;
                     }).join('');
                }


                // --- Build the complete key structure ---
                let keyHtml = `<div style="border: 1px solid #334155; margin-bottom: 0.5rem; background: #f1f5f9; padding: 0.5rem 1rem;">
                         <h4 style="font-size: 1.25rem; font-weight: bold; text-align: center; margin-bottom: 0.5rem;">Housekeeping Key</h4>
                         
                         <!-- Statuses, Alerts, and Extras - ALL IN ONE FLEX ROW -->
                         <div style="display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: center; gap: 0.75rem 1rem;">
                            
                            <!-- 1. Statuses -->
                            <div style="display: flex; flex-wrap: wrap; gap: 0.75rem 1rem; padding-right: 1rem; border-right: 1px solid #ccc;">
                                <div style="display: flex; align-items: center; white-space: nowrap;"><span style="display: inline-block; width: 1rem; height: 1rem; background-color: #d8c9e5; margin-right: 0.5rem; border: 1px solid black;"></span><strong>Depart/Arrive</strong></div>
                                <div style="display: flex; align-items: center; white-space: nowrap;"><span style="display: inline-block; width: 1rem; height: 1rem; background-color: #b3e6c9; margin-right: 0.5rem; border: 1px solid black;"></span><strong>Arrival</strong></div>
                                <div style="display: flex; align-items: center; white-space: nowrap;"><span style="display: inline-block; width: 1rem; height: 1rem; background-color: #e0a6b5; margin-right: 0.5rem; border: 1px solid black;"></span><strong>Depart</strong></div>
                                <div style="display: flex; align-items: center; white-space: nowrap;"><span style="display: inline-block; width: 1rem; height: 1rem; background-color: #c9d8e6; margin-right: 0.5rem; border: 1px solid black;"></span><strong>Stay</strong></div>
                            </div>
                            
                            <!-- 2. Alerts (Twin Turnaround/Capacity) -->
                            <div style="display: flex; flex-wrap: wrap; gap: 0.75rem 1rem; padding-right: 1rem; border-right: 1px solid #ccc;">
                                 ${hasTwinTurnaround ? `<div style="display: flex; align-items: center; white-space: nowrap;"><span style="margin-right: 0.5rem; font-size: 1.25rem;">⭐</span><strong>Twin Turnaround</strong></div>` : ''}
                                 ${needsAlertKey ? `<div style="display: flex; align-items: center; white-space: nowrap;"><span style="margin-right: 0.5rem; font-size: 1.25rem;">⚠️</span><strong>Capacity Alert</strong></div>` : ''}
                            </div>
                            
                            <!-- 3. Extras List -->
                            <div style="display: flex; flex-wrap: wrap; justify-content: flex-start; gap: 0.75rem 1rem; padding-left: 0.5rem;">
                                ${extrasListHtml}
                            </div>
                         </div>
                         
                        </div>`; // Closing the main key box

                printTableContainer.innerHTML += keyHtml;
                
                const floors = [{ title: 'Ground Floor', rooms: rooms.filter(r => parseInt(r.room) <= 6) }, { title: 'First Floor', rooms: rooms.filter(r => parseInt(r.room) >= 101 && parseInt(r.room) <= 130) }, { title: 'Second Floor', rooms: rooms.filter(r => parseInt(r.room) >= 201 && parseInt(r.room) <= 230) }];
                floors.forEach(floor => { if (floor.rooms.length > 0) { const floorContainer = document.createElement('div'); floorContainer.className = 'floor-section-print'; floorContainer.innerHTML = `<h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">${floor.title}</h2>`; floorContainer.appendChild(createClassicPrintTable(floor.rooms)); printTableContainer.appendChild(floorContainer); } });
                
                const listContainer = document.createElement('div'); listContainer.className = "floor-section-print"; 
                
                // Staying Rooms List Print: Comma-separated
                if (showStayingRoomsListCheckbox.checked) { 
                    const staying = rooms.filter(r => r.status === 'Stay').map(r => r.room); 
                    if (staying.length > 0) listContainer.appendChild(createPrintListSection('Staying Rooms List', staying.join(', '))); 
                } 
                
                if (showPetRoomsListCheckbox.checked) { const pets = rooms.filter(r => r.pet > 0).map(r => r.room); if (pets.length > 0) listContainer.appendChild(createPrintListSection('Pet Rooms List', pets.join(', '))); } 
                if (showTwinRoomsListCheckbox.checked) { const twins = rooms.filter(r => r.twin > 0).map(r => r.room); if (twins.length > 0) listContainer.appendChild(createPrintListSection('Twin Rooms List', twins.join(', '))); } 
                
                // Extras List Print: Itemized (complex content)
                if (showExtrasRoomsListCheckbox.checked) { 
                    const extraRooms = rooms.filter(room => {
                        return HK_EXTRA_PRODUCTS.some(item => {
                            const key = item.key;
                            // NEW LOGIC: Checks if the extra is relevant for today's tasks
                            let isRelevant = false;
                            if (item.condition === 'DepartureDay') {
                                isRelevant = room.reportDateFormatted === room.endDateFormatted;
                            } else if (item.condition === 'ArrivalDay') {
                                isRelevant = room.reportDateFormatted === room.startDateFormatted;
                            } else if (item.condition === 'Arrival') {
                                isRelevant = room.status === 'Arrival' || room.status === 'Depart/Arrive';
                            }
                            return (room[key] > 0 && isRelevant);
                        });
                    });

                    if (extraRooms.length > 0) {
                        const listItems = extraRooms.map(room => {
                            const activeItems = HK_EXTRA_PRODUCTS.filter(item => {
                                const key = item.key;
                                // NEW LOGIC: Checks if the extra is relevant for today's tasks
                                let isRelevant = false;
                                if (item.condition === 'DepartureDay') {
                                    isRelevant = room.reportDateFormatted === room.endDateFormatted;
                                } else if (item.condition === 'ArrivalDay') {
                                    isRelevant = room.reportDateFormatted === room.startDateFormatted;
                                } else if (item.condition === 'Arrival') {
                                    isRelevant = room.status === 'Arrival' || room.status === 'Depart/Arrive';
                                }
                                return (room[key] > 0 && isRelevant);
                            }).map(item => {
                                let label = item.name;
                                // ADDED: Value logic for print list
                                if (item.hasValue && room[`${item.key}Value`] > 0) {
                                    label += ` (£${room[`${item.key}Value`]} Total)`;
                                } else if (item.hasValue && room[item.key] > 0) {
                                     label += ` (Price N/A)`;
                                }

                                return `<span style="font-size: 1rem;">${item.emoji}</span> ${label}`; // Reduced emoji size in list item
                            });
                            return `${room.room}: ${activeItems.join(', ')}`;
                        });
                        listContainer.appendChild(createPrintListSection('Extra List', listItems));
                    }
                }

                if (listContainer.hasChildNodes()) printTableContainer.appendChild(listContainer);
            }
            
            // --- UPDATED createClassicPrintTable: Header Aligned & Value Removed from Cell (Print) ---
            function createClassicPrintTable(rooms) {
                const table = document.createElement('table'); table.className = 'print-table-classic'; 
                let headerHtml = '<thead><tr><th></th>'; 
                rooms.forEach(room => { let printBgColor = '#f1f5f9'; if (room.status === 'Arrival') printBgColor = '#b3e6c9'; if (room.status === 'Depart') printBgColor = '#e0a6b5'; if (room.status === 'Depart/Arrive') printBgColor = '#d8c9e5'; if (room.status === 'Stay') printBgColor = '#c9d8e6'; headerHtml += `<th style="background-color: ${printBgColor};">${room.room}</th>`; }); 
                headerHtml += '</tr></thead>';
                
                const tbody = document.createElement('tbody'); 
                const rows = []; 
                if (showUsedLastNightRowCheckbox.checked) rows.push('Used Last Night'); 
                if (showArrivingTodayRowCheckbox.checked) rows.push('Arriving Today'); 
                if (showGuestsRowCheckbox.checked) rows.push('Guests'); 
                if (showPetRowCheckbox.checked) rows.push('Pet'); 
                if (showTwinRowCheckbox.checked) rows.push('Twin'); 
                if (showDaybedRowCheckbox.checked) rows.push('Daybed'); 
                if (showTrundleRowCheckbox.checked) rows.push('Trundle');
                
                // Check if the 'Extras' toggle is on
                const isExtrasRowVisible = showExtrasRowCheckbox.checked;

                // Check if any extra product is present in data for the relevant status
                const hasExtraProducts = rooms.some(room => 
                    HK_EXTRA_PRODUCTS.some(item => {
                        const key = item.key;
                        // NEW LOGIC: Checks if the extra is relevant for today's tasks
                        let isRelevant = false;
                        if (item.condition === 'DepartureDay') {
                            isRelevant = room.reportDateFormatted === room.endDateFormatted;
                        } else if (item.condition === 'ArrivalDay') {
                            isRelevant = room.reportDateFormatted === room.startDateFormatted;
                        } else if (item.condition === 'Arrival') {
                            isRelevant = room.status === 'Arrival' || room.status === 'Depart/Arrive';
                        }
                        return (room[key] > 0 && isRelevant);
                    })
                );

                // Add consolidated 'Extra' row ONLY IF toggle is ON AND products are present
                if (isExtrasRowVisible && hasExtraProducts) {
                    rows.push('Extra');
                }
                
                rows.forEach(feature => {
                    let rowHtml = '';

                    if (feature === 'Extra') {
                        // --- Consolidated Extra Row (Print) - Fixed logic & sizing ---
                        // Ensured font-weight: bold is explicitly set for the 'Extra' header cell.
                        let rowContentHtml = `<tr><td style="font-align: left; padding: 0.5rem; background-color: #f1f5f9; border: 1px solid #334155; font-weight: bold; text-align: left;">Extra</td>`;
                        
                        rooms.forEach(room => {
                            let extraItems = [];
                            HK_EXTRA_PRODUCTS.forEach(item => {
                                const key = item.key;
                                // NEW LOGIC: Checks if the extra is relevant for today's tasks
                                let isRelevant = false;
                                if (item.condition === 'DepartureDay') {
                                    isRelevant = room.reportDateFormatted === room.endDateFormatted;
                                } else if (item.condition === 'ArrivalDay') {
                                    isRelevant = room.reportDateFormatted === room.startDateFormatted;
                                } else if (item.condition === 'Arrival') {
                                    isRelevant = room.status === 'Arrival' || room.status === 'Depart/Arrive';
                                }

                                if (room[item.key] > 0 && isRelevant) {
                                    let content = item.emoji;
                                    // Removed value display from table cells per user request
                                    extraItems.push(`<span>${content}</span>`); 
                                }
                            });
                            
                            // Join all parts with a simple space.
                            const cellContent = extraItems.join(' ');
                            
                            rowContentHtml += `<td style="text-align: center; border: 1px solid #334155; padding: 0.5rem; background-color: #ffffff;">${cellContent}</td>`;
                        });
                        
                        rowHtml = rowContentHtml + '</tr>';
                    } else {
                        // --- Regular Rows (Pet, Twin, Daybed, etc.) ---
                        // Ensure this remains consistent with the standard row style
                        rowHtml = `<tr><td style="text-align: left; font-weight: bold; padding: 0.5rem; background-color: #f1f5f9;">${feature}</td>`;
                        
                        rooms.forEach(room => {
                            let value = ''; 
                            const needsAlert = room.guests >= 3 && room.daybed === 0 && room.trundle === 0; 
                            const printAlertStyle = needsAlert ? 'style="background-color: #fffbe6;"' : '';
                            
                            // Existing logic for core rows
                            if (!((room.status === 'Stay' && !showStayingRoomInfoCheckbox.checked) || (room.status === 'Depart' && !showDepartingRoomInfoCheckbox.checked))) {
                                const isUsed = room.status === 'Stay' || room.status === 'Depart' || room.status === 'Depart/Arrive'; 
                                const isArriving = room.status === 'Arrival' || room.status === 'Depart' || room.status === 'Depart/Arrive'; 
                                const tickValue = '✓';
                                switch (feature) { 
                                    case 'Used Last Night': value = isUsed ? tickValue : ''; break; 
                                    case 'Arriving Today': value = isArriving ? tickValue : ''; break; 
                                    case 'Guests': value = room.guests > 0 ? room.guests : ''; break; 
                                    // MODIFIED PET LOGIC for Print View to show the numerical count (room.pet)
                                    case 'Pet': value = room.pet > 0 ? room.pet : ''; break; 
                                    case 'Twin': value = room.twin > 0 ? (tickValue + (room.isTwinTurnaround ? '⭐' : '')) : ''; break; 
                                    case 'Daybed': value = (room.daybed > 0 ? tickValue : '') + (needsAlert ? ' ⚠️' : ''); break; 
                                    case 'Trundle': value = (room.trundle > 0 ? tickValue : '') + (needsAlert ? ' ⚠️' : ''); break; 
                                }
                            }
                            
                            rowHtml += `<td style="text-align: center; border: 1px solid #334155; padding: 0.5rem;" ${printAlertStyle}>${value}</td>`;
                        });
                        
                        rowHtml += '</tr>';
                    }

                    tbody.innerHTML += rowHtml;
                });
                table.innerHTML = headerHtml; table.appendChild(tbody); return table;
            }
            // Update createPrintListSection to handle simple string/comma separation or itemized list
            function createPrintListSection(title, content) { 
                const container = document.createElement('div'); 
                container.style.marginBottom = '1rem'; 
                
                if (Array.isArray(content)) {
                    // Itemized list for complex content (e.g., Extras List)
                    const listContent = content.map(item => `<li>${item}</li>`).join('');
                    container.innerHTML = `<h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #075985;">${title}</h3><ul style="list-style: none; font-size: 1.1rem; padding-left: 0;">${listContent}</ul>`;
                } else {
                    // Simple string/comma-separated list (e.g., Staying Rooms)
                     container.innerHTML = `<h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #075985;">${title}</h3><p style="font-size: 1.1rem;">${content}</p>`;
                }
                
                return container; 
            }

            function updateStatus(message, type) { statusDiv.textContent = message; statusDiv.className = 'text-center mt-4 font-semibold '; switch (type) { case 'error': statusDiv.classList.add('text-red-600'); break; case 'success': statusDiv.classList.add('text-green-600'); break; default: statusDiv.classList.add('text-gray-600'); break; } }
            updateSparkleMode(isSparkleMode);
        }

