   // --- TWIN VISUALIZER SCRIPT ---


        function twin_init() {
            // All the original script from Twin.html goes here, with element IDs prefixed with `twin_` to avoid conflicts.
            const dataInput = document.getElementById('twin_data-input'); const clearBtn = document.getElementById('twin_clear-btn'); const gridContainer = document.getElementById('twin_grid-container'); const initialMessage = document.getElementById('twin_initial-message'); const loader = document.getElementById('twin_loader'); const controls = document.getElementById('twin_controls'); const resetBtn = document.getElementById('twin_reset-btn'); const movesLog = document.getElementById('twin_moves-log'); const movesList = document.getElementById('twin_moves-list'); const upgradeOutliersBtn = document.getElementById('twin_upgrade-outliers-btn'); const showConflictsBtn = document.getElementById('twin_show-conflicts-btn'); const zoomInBtn = document.getElementById('twin_zoom-in-btn'); const zoomOutBtn = document.getElementById('twin_zoom-out-btn'); const zoomLevelText = document.getElementById('twin_zoom-level-text');
            let originalBookings = []; let currentBookings = []; let allBookings = []; let showNonTwinBookings = false; let originalRoomColorMap = {}; const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500', 'bg-pink-500']; 
            
            // --- NEW: Use current date for highlighting and locking ---
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0); // Set to midnight UTC for accurate date-only comparisons
            
            const zoomLevels = [{ name: 'Compact', padding: 'px-1', text: 'text-[10px]' }, { name: 'Small', padding: 'px-2', text: 'text-xs' }, { name: 'Medium', padding: 'px-3', text: 'text-xs' }, { name: 'Large', padding: 'px-4', text: 'text-sm' }]; let currentZoomIndex = 2;
            const roomGroups = { 'Large Rooms': ['119', '120', '207', '208', '219', '220'], 'Accessible Rooms': ['107', '108', '118'], 'Medium Rooms': ['101', '102', '105', '106', '111', '112', '114', '115', '121', '123', '124', '125', '126', '201', '202', '205', '206', '218', '221', '224', '225'] }; let roomToCategoryMap = {};
            (function initializeApp() { for (const category in roomGroups) { roomGroups[category].forEach(room => { roomToCategoryMap[room] = category; }); } dataInput.addEventListener('input', debounce(handleProcessData, 500)); clearBtn.addEventListener('click', handleClear); upgradeOutliersBtn.addEventListener('click', handleUpgradeOutliers); showConflictsBtn.addEventListener('click', handleShowConflicts); resetBtn.addEventListener('click', handleReset); zoomInBtn.addEventListener('click', handleZoomIn); zoomOutBtn.addEventListener('click', handleZoomOut); updateZoomDisplay(); addDragDropListeners(); addPanningListeners(); movesList.addEventListener('change', handleLockMove); gridContainer.addEventListener('click', handleGridClick); })();
            function handleProcessData() { const rawData = dataInput.value; if (!rawData || !rawData.trim()) return; initialMessage.classList.add('hidden'); gridContainer.classList.add('hidden'); controls.classList.add('hidden'); movesLog.classList.add('hidden'); loader.classList.remove('hidden'); setTimeout(() => { try { allBookings = processAllData(rawData); originalBookings = allBookings.filter(b => b.isTwin); if (originalBookings.length > 0) { const allOriginalRooms = [...new Set(originalBookings.map(b => b.originalRoom))].sort((a, b) => parseInt(a) - parseInt(b)); originalRoomColorMap = allOriginalRooms.reduce((map, room, index) => { map[room] = colors[index % colors.length]; return map; }, {}); currentBookings = JSON.parse(JSON.stringify(originalBookings)); renderGrid(currentBookings); controls.classList.remove('hidden'); resetBtn.classList.remove('hidden'); } else { showError("No twin room bookings found."); } } catch (error) { showError("Could not process data."); } finally { loader.classList.add('hidden'); } }, 50); }
            function handleClear() { dataInput.value = ''; originalBookings = []; currentBookings = []; allBookings = []; showNonTwinBookings = false; showConflictsBtn.textContent = 'Show Non-Twins'; showConflictsBtn.classList.toggle('bg-amber-500', !showNonTwinBookings); showConflictsBtn.classList.toggle('bg-violet-600', showNonTwinBookings); refreshGrid(); gridContainer.classList.add('hidden'); controls.classList.add('hidden'); movesLog.classList.add('hidden'); initialMessage.classList.remove('hidden'); loader.classList.add('hidden'); }
            function handleShowConflicts() { showNonTwinBookings = !showNonTwinBookings; showConflictsBtn.textContent = showNonTwinBookings ? 'Hide Non-Twins' : 'Show Non-Twins'; showConflictsBtn.classList.toggle('bg-amber-500', !showNonTwinBookings); showConflictsBtn.classList.toggle('bg-violet-600', showNonTwinBookings); refreshGrid(); }
            function handleGridClick(e) { const lockIcon = e.target.closest('.lock-icon'); if (lockIcon) { const bookingId = lockIcon.closest('.booking-bar').id; const booking = allBookings.find(b => b.id === bookingId); if (booking && booking.locked) { booking.locked = false; const bookingInCurrent = currentBookings.find(b => b.id === bookingId); if(bookingInCurrent) bookingInCurrent.locked = false; refreshGrid(); updateAndDisplayChangeLog(); } } }
            function handleLockMove(e) { if (e.target.classList.contains('lock-move-checkbox')) { const bookingId = e.target.dataset.bookingId; const booking = allBookings.find(b => b.id === bookingId); if (booking) { booking.locked = e.target.checked; const bookingInCurrent = currentBookings.find(b => b.id === bookingId); if(bookingInCurrent) bookingInCurrent.locked = e.target.checked; refreshGrid(); updateAndDisplayChangeLog(); } } }
            function handleUpgradeOutliers() { const bookingsToUpgrade = showNonTwinBookings ? allBookings : currentBookings; const { upgradedBookings } = upgradeOutliers(JSON.parse(JSON.stringify(bookingsToUpgrade))); upgradedBookings.forEach(upgradedBooking => { const current = currentBookings.find(b => b.id === upgradedBooking.id); if(current) Object.assign(current, upgradedBooking); const all = allBookings.find(b => b.id === upgradedBooking.id); if(all) Object.assign(all, upgradedBooking); }); refreshGrid(); updateAndDisplayChangeLog(); resetBtn.classList.remove('hidden'); }
            function handleReset() { allBookings = processAllData(dataInput.value); originalBookings = allBookings.filter(b => b.isTwin); currentBookings = JSON.parse(JSON.stringify(originalBookings)); refreshGrid(); updateAndDisplayChangeLog(); resetBtn.classList.add('hidden'); }
            function handleZoomIn() { if (currentZoomIndex < zoomLevels.length - 1) { currentZoomIndex++; updateZoomDisplay(); refreshGrid(); } }
            function handleZoomOut() { if (currentZoomIndex > 0) { currentZoomIndex--; updateZoomDisplay(); refreshGrid(); } }
            function updateZoomDisplay() { zoomLevelText.textContent = zoomLevels[currentZoomIndex].name; zoomOutBtn.disabled = currentZoomIndex === 0; zoomInBtn.disabled = currentZoomIndex === zoomLevels.length - 1; }
            function processAllData(rawText) {
                const bookings = [];
                const startIndex = rawText.indexOf('Reservations');
                if (startIndex === -1) return [];
                let dataText = rawText.substring(startIndex);
                const firstRecordMatch = dataText.match(/\n\d{3}[A-Za-z\s]/);
                if (firstRecordMatch) {
                    dataText = dataText.substring(firstRecordMatch.index).trim();
                } else {
                    const inlineRecordMatch = dataText.match(/\d{3}[A-Za-z\s]/);
                    if(inlineRecordMatch) dataText = dataText.substring(inlineRecordMatch.index).trim(); else return [];
                }
                const bookingChunks = dataText.split(/\n(?=\d{3})/).map(chunk => chunk.trim());
                const recordRegex = /(\d{3})(.+?)(\d{2}\/\d{2}\s*-\s*\d{2}\/\d{2})/;
                const dateRegex = /(\d{1,2}\/\d{1,2})\s*-\s*(\d{1,2}\/\d{1,2})/;
                let bookingIdCounter = 0;
                for (const chunk of bookingChunks) {
                    const recordMatch = chunk.replace(/\n/g, ' ').match(recordRegex); // Search entire chunk
                    if (recordMatch) {
                        try {
                            const room = recordMatch[1].trim();
                            const customer = recordMatch[2].trim();
                            const dateRangeStr = recordMatch[3];
                            const isTwin = /(?<!or\s)twin/i.test(chunk) || chunk.toLowerCase().includes('2 single') || chunk.toLowerCase().includes('twin beds');
                            const dateMatch = dateRangeStr.match(dateRegex);
                            if (dateMatch) {
                                const startDate = parseDate(dateMatch[1]);
                                const endDate = parseDate(dateMatch[2]);
                                if (endDate < startDate) endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);
                                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                                    const booking = { id: `booking-${bookingIdCounter++}`, room: room, originalRoom: room, customer: customer, start: startDate.toISOString(), end: endDate.toISOString(), notes: chunk, isTwin: isTwin, locked: false, isUpgraded: false };
                                    
                                    // --- NEW: Smart locking logic ---
                                    if (startDate.getTime() < today.getTime()) {
                                        booking.locked = true;
                                    }
                                    
                                    bookings.push(booking);
                                }
                            }
                        } catch(e) { console.warn(`Could not parse booking chunk:`, chunk, e); }
                    }
                }
                return bookings;
            }
            function refreshGrid() { let bookingsToRender = showNonTwinBookings ? [...allBookings] : [...currentBookings]; renderGrid(bookingsToRender); }
            function renderGrid(bookings) {
                if (!bookings || bookings.length === 0) { showError("No bookings found."); return; }
                let roomsToDisplay = [...new Set(originalBookings.map(b => b.originalRoom))];
                if (showNonTwinBookings) {
                    const nonTwinRooms = allBookings.filter(b => !b.isTwin).map(b => b.room);
                    roomsToDisplay.push(...nonTwinRooms);
                }
                const allRenderedRooms = [...new Set(roomsToDisplay)];
                const bookingDates = allBookings.flatMap(b => [new Date(b.start), new Date(b.end)]);
                let minDate = bookingDates.length > 0 ? new Date(Math.min(...bookingDates)) : new Date();
                let maxDate = bookingDates.length > 0 ? new Date(Math.max(...bookingDates)) : new Date();
                maxDate.setUTCDate(maxDate.getUTCDate() + 1);
                const dates = [];
                for (let d = new Date(minDate); d <= maxDate; d.setUTCDate(d.getUTCDate() + 1)) { dates.push(new Date(d)); }
                const zoom = zoomLevels[currentZoomIndex];
                const categorizedRooms = categorizeRooms(allRenderedRooms);
                const categoryOrder = ['Large Rooms', 'Accessible Rooms', 'Medium Rooms', 'Outliers'];
                let html = '<table class="w-full text-sm text-left text-slate-500"><thead><tr><th scope="col" class="py-3 px-6 w-24">Room #</th>';
                dates.forEach(date => {
                    const day = date.toLocaleString('en-GB', { day: 'numeric', timeZone: 'UTC' });
                    const dayOfWeek = date.toLocaleString('en-GB', { weekday: 'short', timeZone: 'UTC' });
                    const month = date.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' });
                    const isToday = date.getTime() === today.getTime();
                    const headerClass = isToday ? 'today-header' : '';
                    html += `<th scope="col" class="py-3 text-center ${headerClass} ${zoom.padding} ${zoom.text}">${dayOfWeek}<br>${day} ${month}</th>`;
                });
                html += '</tr></thead><tbody>';
                categoryOrder.forEach(category => {
                    const roomsInCategory = categorizedRooms[category];
                    if (roomsInCategory.length > 0) {
                        html += `<tr class="group-header"><td colspan="${dates.length + 1}" class="py-2 px-4 bg-violet-200 font-bold text-lg text-violet-900">${category}</td></tr>`;
                        roomsInCategory.forEach(room => {
                            html += `<tr><td data-room="${room}" class="py-4 px-6 font-medium text-slate-900">${room}</td>`;
                            for(let i = 0; i < dates.length; i++) {
                                const date = dates[i];
                                const isTodayCell = date.getTime() === today.getTime();
                                const todayClass = isTodayCell ? 'today-cell' : '';
                                const booking = bookings.find(b => b.room === room && new Date(b.start).getTime() === date.getTime());
                                if (booking) {
                                    const duration = getDaysDifference(booking.start, booking.end);
                                    if(duration > 0) {
                                        const color = originalRoomColorMap[booking.originalRoom] || 'bg-gray-400';
                                        const originalBookingState = allBookings.find(b => b.id === booking.id);
                                        const movedClass = (originalBookingState && booking.room !== originalBookingState.originalRoom) ? 'moved-booking' : '';
                                        const lockedClass = booking.locked ? 'locked-booking' : '';
                                        const upgradedClass = booking.isUpgraded ? 'upgraded-booking' : '';
                                        const nonTwinClass = !booking.isTwin ? 'non-twin-booking' : '';
                                        // --- NEW: Added full booking notes to title attribute for hover tooltip ---
                                        html += `<td colspan="${duration}" class="p-1 ${todayClass}" data-room="${room}" data-date="${date.toISOString()}"><div id="${booking.id}" draggable="${!booking.locked}" class="${color} ${movedClass} ${lockedClass} ${upgradedClass} ${nonTwinClass} booking-bar" title="${booking.notes}"><span class="font-semibold truncate pointer-events-none">${booking.customer}</span><svg class="star-icon hidden w-4 h-4 text-yellow-300 absolute top-1 left-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg><svg class="lock-icon hidden w-4 h-4 text-white absolute top-1 right-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" /></svg></div></td>`;
                                        i += duration - 1;
                                    }
                                } else {
                                    html += `<td class="p-1 ${todayClass}" data-room="${room}" data-date="${date.toISOString()}"></td>`;
                                }
                            }
                            html += '</tr>';
                        });
                    }
                });
                html += '</tbody></table>';
                gridContainer.innerHTML = html;
                gridContainer.classList.remove('hidden');
            }
            function updateAndDisplayChangeLog() { movesList.innerHTML = ''; const moves = []; allBookings.forEach(cb => { if (cb.room !== cb.originalRoom || cb.isUpgraded) { moves.push({ id: cb.id, customer: cb.customer, fromRoom: cb.originalRoom, toRoom: cb.room, start: cb.start, upgrade: cb.isUpgraded, locked: cb.locked }); } }); moves.sort((a, b) => new Date(a.start) - new Date(b.start)); if (moves.length === 0) { movesLog.classList.add('hidden'); return; } const movesByDate = moves.reduce((groups, move) => { const date = new Date(move.start).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }); if (!groups[date]) groups[date] = []; groups[date].push(move); return groups; }, {}); for (const date in movesByDate) { const dateHeader = document.createElement('h4'); dateHeader.className = 'text-md font-semibold text-slate-700 pt-4 border-t first:pt-0'; dateHeader.textContent = `Arrivals for ${date}`; movesList.appendChild(dateHeader); movesByDate[date].forEach(move => { const li = document.createElement('li'); li.className = 'flex items-center justify-between p-3 bg-violet-100 rounded-2xl'; let moveText = `<span class="font-semibold">${move.customer}</span> moved from ${move.fromRoom} to ${move.toRoom}.`; if (move.upgrade) { moveText += ` <span class="font-bold text-rose-600">(Upgrade)</span>`; } li.innerHTML = `<div>${moveText}</div><div class="flex items-center"><input type="checkbox" id="lock-${move.id}" data-booking-id="${move.id}" class="lock-move-checkbox h-4 w-4 rounded" ${move.locked ? 'checked' : ''}><label for="lock-${move.id}" class="ml-2 text-sm">Lock</label></div>`; movesList.appendChild(li); }); } movesLog.classList.remove('hidden'); }
            function showError(message) { gridContainer.innerHTML = `<div class="text-center bg-white p-12 rounded-3xl"><h3 class="mt-2 text-sm font-medium">An Error Occurred</h3><p class="mt-1 text-sm">${message}</p></div>`; gridContainer.classList.remove('hidden'); initialMessage.classList.add('hidden'); loader.classList.add('hidden'); }
            function addPanningListeners() { const slider = gridContainer; let isDown = false, startX, scrollLeft; slider.addEventListener('mousedown', (e) => { if (e.target.closest('.booking-bar')) return; isDown = true; slider.classList.add('grabbing'); startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; }); slider.addEventListener('mouseleave', () => { isDown = false; slider.classList.remove('grabbing'); }); slider.addEventListener('mouseup', () => { isDown = false; slider.classList.remove('grabbing'); }); slider.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - slider.offsetLeft; slider.scrollLeft = scrollLeft - (x - startX); }); }
            function addDragDropListeners() { let draggedBookingId = null; gridContainer.addEventListener('dragstart', e => { if (e.target.classList.contains('booking-bar') && e.target.draggable) { draggedBookingId = e.target.id; e.dataTransfer.effectAllowed = 'move'; setTimeout(() => e.target.style.visibility = 'hidden', 0); } else { e.preventDefault(); } }); gridContainer.addEventListener('dragend', e => { if (e.target.classList.contains('booking-bar')) e.target.style.visibility = 'visible'; }); gridContainer.addEventListener('dragover', e => { e.preventDefault(); const targetEl = e.target.closest('.booking-bar') || e.target.closest('td'); document.querySelectorAll('.swap-target, .drop-target').forEach(el => el.classList.remove('swap-target', 'drop-target')); if(targetEl && draggedBookingId) { if (targetEl.classList.contains('booking-bar')) targetEl.classList.add('swap-target'); else if (targetEl.tagName === 'TD' && !targetEl.hasChildNodes()) targetEl.classList.add('drop-target'); } }); gridContainer.addEventListener('dragleave', e => { const targetEl = e.target.closest('.booking-bar') || e.target.closest('td'); if(targetEl) targetEl.classList.remove('swap-target', 'drop-target'); }); gridContainer.addEventListener('drop', e => { e.preventDefault(); document.querySelectorAll('.swap-target, .drop-target').forEach(el => el.classList.remove('swap-target', 'drop-target')); if (!draggedBookingId) return; const sourceBooking = allBookings.find(b => b.id === draggedBookingId); draggedBookingId = null; if (!sourceBooking) return; const dropTarget = e.target.closest('.booking-bar'); const emptyCellTarget = e.target.closest('td'); if (dropTarget) { const targetBooking = allBookings.find(b => b.id === dropTarget.id); if (!targetBooking || targetBooking.id === sourceBooking.id || targetBooking.locked || sourceBooking.locked) { refreshGrid(); return; } const sourceCategory = roomToCategoryMap[sourceBooking.room] || 'Outliers'; const targetCategory = roomToCategoryMap[targetBooking.room] || 'Outliers'; if (sourceCategory === targetCategory || sourceCategory === 'Outliers' || targetCategory === 'Outliers') { [sourceBooking.room, targetBooking.room] = [targetBooking.room, sourceBooking.room]; sourceBooking.locked = true; targetBooking.locked = true; const sourceInCurrent = currentBookings.find(b => b.id === sourceBooking.id); if(sourceInCurrent) { sourceInCurrent.room = sourceBooking.room; sourceInCurrent.locked = true; } const targetInCurrent = currentBookings.find(b => b.id === targetBooking.id); if(targetInCurrent) { targetInCurrent.room = targetBooking.room; targetInCurrent.locked = true; } resetBtn.classList.remove('hidden'); refreshGrid(); updateAndDisplayChangeLog(); } else { alert('Swap failed: Bookings can only be swapped within the same category, or with an Outlier.'); refreshGrid(); } } else if (emptyCellTarget && !emptyCellTarget.querySelector('.booking-bar')) { const targetRoom = emptyCellTarget.dataset.room; const sourceCategory = roomToCategoryMap[sourceBooking.room] || 'Outliers'; const targetCategory = roomToCategoryMap[targetRoom] || 'Outliers'; if (sourceCategory !== 'Outliers' && sourceCategory !== targetCategory) { alert('Move failed: Bookings can only be moved to rooms in the same category.'); refreshGrid(); return; } const sourceEndDate = new Date(sourceBooking.start); sourceEndDate.setUTCDate(sourceEndDate.getUTCDate() + getDaysDifference(sourceBooking.start, sourceBooking.end)); const conflictingBookings = allBookings.filter(b => b.id !== sourceBooking.id && b.room === targetRoom && new Date(b.start) < sourceEndDate && new Date(b.end) > new Date(sourceBooking.start)); conflictingBookings.forEach(conflict => { conflict.room = conflict.originalRoom; const conflictInCurrent = currentBookings.find(b => b.id === conflict.id); if (conflictInCurrent) conflictInCurrent.room = conflict.originalRoom; if (roomToCategoryMap[conflict.originalRoom]){ conflict.isUpgraded = true; if(conflictInCurrent) conflictInCurrent.isUpgraded = true; } }); sourceBooking.room = targetRoom; sourceBooking.locked = true; const sourceInCurrent = currentBookings.find(b => b.id === sourceBooking.id); if(sourceInCurrent) { sourceInCurrent.room = sourceBooking.room; sourceInCurrent.locked = true; } if (sourceCategory === 'Outliers' && targetCategory !== 'Outliers') { sourceBooking.isUpgraded = true; if (sourceInCurrent) sourceInCurrent.isUpgraded = true; } resetBtn.classList.remove('hidden'); refreshGrid(); updateAndDisplayChangeLog(); } else { refreshGrid(); } }); }
            function upgradeOutliers(bookings) { const bookingsToUpgrade = bookings.filter(b => !b.locked && (roomToCategoryMap[b.room] === 'Outliers' || !roomToCategoryMap[b.room])); const mediumRooms = roomGroups['Medium Rooms']; const bookingsByRoom = allBookings.reduce((acc, b) => { (acc[b.room] = acc[b.room] || []).push(b); return acc; }, {}); const isSlotAvailable = (room, start, end, bookingId) => !(bookingsByRoom[room] || []).some(b => b.id !== bookingId && new Date(b.start) < new Date(end) && new Date(b.end) > new Date(start)); bookingsToUpgrade.sort((a,b) => new Date(a.start) - new Date(b.start)); bookingsToUpgrade.forEach(bookingToMove => { for (const targetRoom of mediumRooms) { if (isSlotAvailable(targetRoom, bookingToMove.start, bookingToMove.end, bookingToMove.id)) { bookingToMove.room = targetRoom; bookingToMove.isUpgraded = true; const bookingInAll = allBookings.find(b => b.id === bookingToMove.id); if(bookingInAll) { bookingInAll.room = targetRoom; bookingInAll.isUpgraded = true; } break; } } }); return { upgradedBookings: bookings }; }
            function debounce(func, delay) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; }
            function parseDate(dateStr, year = 2025) { const [day, month] = dateStr.split('/'); if (!day || !month) throw new Error(`Invalid date: ${dateStr}`); return new Date(Date.UTC(year, parseInt(month, 10) - 1, parseInt(day, 10))); }
            function getDaysDifference(start, end) { return Math.round((new Date(end) - new Date(start)) / 86400000); }
            function categorizeRooms(allRooms) { const categorized = { 'Large Rooms': new Set(), 'Accessible Rooms': new Set(), 'Medium Rooms': new Set(), 'Outliers': new Set() }; allRooms.forEach(room => { const category = roomToCategoryMap[room] || 'Outliers'; categorized[category].add(room); }); for (const category in categorized) { categorized[category] = Array.from(categorized[category]).sort((a, b) => parseInt(a) - parseInt(b)); } return categorized; }
        }
