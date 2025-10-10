// --- NEW: DYNAMIC CONTENT LOADER & NAVIGATION ---
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('#main-nav .nav-button');
    const contentArea = document.getElementById('content-area');

    // Maps the fragment name to its initialization function
    const appInitializers = {
        'home.html': master_init,
        'breakfast.html': breakfast_init,
        'kitchen.html': kitchen_init,
        'hk.html': hk_init,
        'twin.html': twin_init
    };

    const dynamicHeaderInitializers = {
        'kitchen.html': () => initializeDynamicHeader('kitchen', 'Daily Kitchen Products'),
        'hk.html': () => initializeDynamicHeader('hk', 'HK Arrival & Departure List'),
        'twin.html': () => initializeDynamicHeader('twin', 'Twin List (10 day forecast)')
    };
    
    // Function to fetch and load a fragment
    const loadFragment = async (fragmentName) => {
        try {
            contentArea.innerHTML = '<p>Loading...</p>';
            const response = await fetch(fragmentName);
            if (!response.ok) {
                throw new Error('Content could not be loaded.');
            }
            const content = await response.text();
            contentArea.innerHTML = content;

            // Run the specific initializer function for the loaded app
            if (appInitializers[fragmentName]) {
                appInitializers[fragmentName]();
            }
            // Run any dynamic header initializers needed
            if (dynamicHeaderInitializers[fragmentName]) {
                dynamicHeaderInitializers[fragmentName]();
            }

        } catch (error) {
            console.error('Failed to load fragment:', error);
            contentArea.innerHTML = `<p class="text-red-500 text-center">${error.message}</p>`;
        }
    };

    // Add click listeners to navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const fragment = button.dataset.fragment;
            
            // Update active button style
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Load the new content
            loadFragment(fragment);
            
            // Update URL for history
            history.pushState({ fragment }, '', button.href);
        });
    });

    // Load the initial 'home' app
    loadFragment('home.html');
});


// --- ORIGINAL APP SCRIPTS (UNCHANGED) ---

// --- DYNAMIC HEADER SCRIPT ---
function initializeDynamicHeader(appPrefix, reportName) {
    const datePicker = document.getElementById(`${appPrefix}-date-picker`);
    const reportLink = document.getElementById(`${appPrefix}-report-link`);
    if (!datePicker || !reportLink) {
        console.error(`Missing elements for app header: ${appPrefix}`);
        return;
    }
    const updateLink = () => {
        const selectedDateString = datePicker.value;
        if (!selectedDateString) return;
        const reportTemplate = MASTER_REPORT_LINKS.find(link => link.name === reportName);
        if (!reportTemplate) {
            console.error(`Report template not found: ${reportName}`);
            reportLink.href = '#';
            return;
        }
        const newUrlDate = master_formatDateForUrl(selectedDateString);
        const newEncodedDate = newUrlDate.replace(/\//g, '%2F');
        let daysToAdd = 0;
        if (reportTemplate.name === "Daily Kitchen Products") daysToAdd = 5;
        if (reportTemplate.name === "Twin List (10 day forecast)") daysToAdd = 10;
        
        let endDateToUse = newEncodedDate;
        if (daysToAdd > 0) {
            const futureDateString = master_addDaysToDate(selectedDateString, daysToAdd);
            const futureUrlDate = master_formatDateForUrl(futureDateString);
            endDateToUse = futureUrlDate.replace(/\//g, '%2F');
        }
        let updatedUrl = reportTemplate.url;
        updatedUrl = updatedUrl.replace(/Start\.Date=.*?&/, `Start.Date=${newEncodedDate}&`);
        updatedUrl = updatedUrl.replace(/End\.Date=.*?(&|$)/, `End.Date=${endDateToUse}$1`);
        reportLink.href = updatedUrl;
    };
    datePicker.value = master_getCurrentDateString();
    datePicker.addEventListener('change', updateLink);
    updateLink();
}

// --- MASTER HUB SCRIPT ---
function master_init() {
    const dateInput = document.getElementById('date-input');
    dateInput.value = master_getCurrentDateString();
    master_updateLinks();
}
const MASTER_REPORT_LINKS = [
    { name: "Breakfast List", url: "https://app.mews.com/Commander/7cad25ef-cd74-451c-a19d-b31300863d83/ProductCheckList/Index?Start.Date=01%2F01%2F2025&End.Date=01%2F01%2F2025" },
    { name: "HK Arrival & Departure List", url: "https://app.mews.com/Commander/7cad25ef-cd74-451c-a19d-b31300863d83/GuestInHouseReport/Index?EnterpriseId=7cad25ef-cd74-451c-a19d-b31300863d83&__AntiforgeryToken=Y1Y56hYrf0yrPJU47OLcpKXI5z4t%2BzcoGt7Q61lKfeAd%2Bj%2BN%2BgXCFZ4XnJ1i11ss0ztnQ3bnCsc%2F3dHNIoys9Q%3D%3D&Custom=True&Service.Id=88229245-b44c-496d-a9a9-b3130086af01&Start.Date=02%2F10%2F2025&Start.Time=00%3A15&End.Date=02%2F10%2F2025&End.Time=23%3A00&States.CheckedIn=true&States.CheckedOut=true&States.Confirmed=true&States.Optional=true&DisplayOptions.AllProducts=true&DisplayOptions.Balance=false&DisplayOptions.CarRegistrationNumber=false&DisplayOptions.Classifications=false&DisplayOptions.CompanionLoyalty=false&DisplayOptions.CustomerNotes=true&DisplayOptions.Loyalty=false&DisplayOptions.ProductsConsumedInInterval=false&DisplayOptions.ReservationNotes=true&Customer.Id=&CustomerClassifications.Airline=false&CustomerClassifications.Blacklist=false&CustomerClassifications.Cashlist=false&CustomerClassifications.DisabledPerson=false&CustomerClassifications.FriendOrFamily=false&CustomerClassifications.HealthCompliant=false&CustomerClassifications.Important=false&CustomerClassifications.InRoom=false&CustomerClassifications.LoyaltyProgram=false&CustomerClassifications.Media=false&CustomerClassifications.Military=false&CustomerClassifications.PaymasterAccount=false&CustomerClassifications.PreviousComplaint=false&CustomerClassifications.Problematic=false&CustomerClassifications.Returning=false&CustomerClassifications.Staff=false&CustomerClassifications.Student=false&CustomerClassifications.TopManagement=false&CustomerClassifications.VeryImportant=false&CustomerClassifications.WaitingForRoom=false&Products.Id%5B%5D=6cd0bc5c-3791-4374-91d9-b31d00c70668&Products.Id%5B%5D=e733dbc5-4390-49ba-a0fb-b332013785c3&Products.Id%5B%5D=cc1852b3-79d1-4c39-8ffb-b31d00cae6cc&Products.Id%5B%5D=d2dfa1b7-9ab1-4082-ae6d-b331009aadc8&Products.Id%5B%5D=1361dd09-fda3-45bc-8eda-b3320138a0c2&Products.Id%5B%5D=a82741ff-fc39-441f-8674-b33201383d08&Products.Id%5B%5D=7a596bbb-d9d5-4cc1-8175-b31d00c88137&Products.Id%5B%5D=eaddb778-b118-42ca-8ae6-b3130086b7ac&Products.Id%5B%5D=3ee7b1a8-ab89-48d9-8072-b3130086b7ac&Products.Id%5B%5D=9b739fc6-388c-4bab-aceb-b3130086b8d7&Products.Id%5B%5D=a53b8385-028a-463a-bc54-b3130086b7ac&Products.Id%5B%5D=7b22d4cb-18d1-40b6-953c-b3130086b7ac&Products.Id%5B%5D=5dc46a03-3547-4199-af68-b3130086b7ac&Products.Id%5B%5D=0480db35-1ab3-426b-ba5f-b3130086b7ac&Products.Id%5B%5D=5e9f32e0-1b09-45b0-b526-b3130086b7ac&Products.Id%5B%5D=20a3a8aa-e90a-4078-a051-b3130086b7ac&Products.Id%5B%5D=c8c8e9b0-0408-4fb0-bcb2-b3130086b7ac&Products.Id%5B%5D=23296dd9-ea30-467a-bbe2-b3130086b7ac&Products.Id%5B%5D=f073df1c-00cd-4ae4-a41b-b3130086b7ac&Ordering=Space" },
    { name: "HK Arrival List", url: "https://app.mews.com/Commander/7cad25ef-cd74-451c-a19d-b31300863d83/GuestInHouseReport/Index?EnterpriseId=7cad25ef-cd74-451c-a19d-b31300863d83&__AntiforgeryToken=sWUWx2zOZ6811Pj06PV%2BbygRMCYhWY1ahifzUnVMZPEJN4m1qeMRo3jDIwGPnRZl85TAWPdle%2Belh5StIEsBLg%3D%3D&Custom=True&Service.Id=88229245-b44c-496d-a9a9-b3130086af01&Start.Date=22%2F08%2F2025&Start.Time=13%3A00&End.Date=22%2F08%2F2025&End.Time=23%3A00&States.CheckedIn=false&States.CheckedOut=false&States.Confirmed=true&States.Optional=false&DisplayOptions.AllProducts=true&DisplayOptions.Balance=false&DisplayOptions.CarRegistrationNumber=false&DisplayOptions.Classifications=false&DisplayOptions.CompanionLoyalty=false&DisplayOptions.CustomerNotes=true&DisplayOptions.Loyalty=false&DisplayOptions.ProductsConsumedInInterval=false&DisplayOptions.ReservationNotes=true&Customer.Id=&CustomerClassifications.Airline=false&CustomerClassifications.Blacklist=false&CustomerClassifications.Cashlist=false&CustomerClassifications.DisabledPerson=false&CustomerClassifications.FriendOrFamily=false&CustomerClassifications.HealthCompliant=false&CustomerClassifications.Important=false&CustomerClassifications.InRoom=false&CustomerClassifications.LoyaltyProgram=false&CustomerClassifications.Media=false&CustomerClassifications.Military=false&CustomerClassifications.PaymasterAccount=false&CustomerClassifications.PreviousComplaint=false&CustomerClassifications.Problematic=false&CustomerClassifications.Returning=false&CustomerClassifications.Staff=false&CustomerClassifications.Student=false&CustomerClassifications.TopManagement=false&CustomerClassifications.VeryImportant=false&CustomerClassifications.WaitingForRoom=false&Products.Id%5B%5D=6cd0bc5c-3791-4374-91d9-b31d00c70668&Products.Id%5B%5D=e733dbc5-4390-49ba-a0fb-b332013785c3&Products.Id%5B%5D=cc1852b3-79d1-4c39-8ffb-b31d00cae6cc&Products.Id%5B%5D=d2dfa1b7-9ab1-4082-ae6d-b331009aadc8&Products.Id%5B%5D=1361dd09-fda3-45bc-8eda-b3320138a0c2&Products.Id%5B%5D=a82741ff-fc39-441f-8674-b33201383d08&Products.Id%5B%5D=7a596bbb-d9c5-4cc1-8175-b31d00c88137&Products.Id%5B%5D=eaddb778-b118-42ca-8ae6-b3130086b7ac&Products.Id%5B%5D=3ee7b1a8-ab89-48d9-8072-b3130086b7ac&Products.Id%5B%5D=9b739fc6-388c-4bab-aceb-b3130086b8d7&Products.Id%5B%5D=a53b8385-028a-463a-bc54-b3130086b7ac&Products.Id%5B%5D=7b22d4cb-18d1-40b6-953c-b3130086b7ac&Products.Id%5B%5D=5dc46a03-3547-4199-af68-b3130086b7ac&Products.Id%5B%5D=0480db35-1ab3-426b-ba5f-b3130086b7ac&Products.Id%5B%5D=5e9f32e0-1b09-45b0-b526-b3130086b7ac&Products.Id%5B%5D=20a3a8aa-e90a-4078-a051-b3130086b7ac&Products.Id%5B%5D=c8c8e9b0-0408-4fb0-bcb2-b3130086b7ac&Products.Id%5B%5D=23296dd9-ea30-467a-bbe2-b3130086b7ac&Products.Id%5B%5D=f073df1c-00cd-4ae4-a41b-b3130086b7ac&Ordering=Space" },
    { name: "Daily Kitchen Products", url: "https://app.mews.com/Commander/7cad25ef-cd74-451c-a19d-b31300863d83/ProductReport/Index?EnterpriseId=7cad25ef-cd74-451c-a19d-b31300863d83&__AntiforgeryToken=48GCTq5A9MQFKMrnIkEBSfjC9%2FWYfeWnR7D86g6npV8TmAtICmaM4T1euQ%2Bb8YIvidmVrPt%2BTFk5lwwtI0olVQ%3D%3D&Custom=True&Service.Id=88229245-b44c-496d-a9a9-b3130086af01&Start.Date=22%2F08%2F2025&Start.Time=00%3A00&End.Date=04%2F09%2F2025&End.Time=00%3A00&Products.Id%5B%5D=1a82d4e5-236e-4b13-be2c-b3130086b7ac&Products.Id%5B%5D=ce211e37-1ed7-4574-a1d5-b31d00d740dd" },
    { name: "Twin List (10 day forecast)", url: "https://app.mews.com/Commander/7cad25ef-cd74-451c-a19d-b31300863d83/GuestInHouseReport/Index?EnterpriseId=7cad25ef-cd74-451c-a19d-b31300863d83&__AntiforgeryToken=Y1Y56hYrf0yrPJU47OLcpKXI5z4t%2BzcoGt7Q61lKfeAd%2Bj%2BN%2BgXCFZ4XnJ1i11ss0ztnQ3bnCsc%2F3dHNIoys9Q%3D%3D&Custom=True&Service.Id=88229245-b44c-496d-a9a9-b3130086af01&Start.Date=02%2F10%2F2025&Start.Time=00%3A15&End.Date=12%2F10%2F2025&End.Time=23%3A00&States.CheckedIn=true&States.CheckedOut=true&States.Confirmed=true&States.Optional=true&DisplayOptions.AllProducts=true&DisplayOptions.Balance=false&DisplayOptions.CarRegistrationNumber=false&DisplayOptions.Classifications=false&DisplayOptions.CompanionLoyalty=false&DisplayOptions.CustomerNotes=true&DisplayOptions.Loyalty=false&DisplayOptions.ProductsConsumedInInterval=false&DisplayOptions.ReservationNotes=true&Customer.Id=&CustomerClassifications.Airline=false&CustomerClassifications.Blacklist=false&CustomerClassifications.Cashlist=false&CustomerClassifications.DisabledPerson=false&CustomerClassifications.FriendOrFamily=false&CustomerClassifications.HealthCompliant=false&CustomerClassifications.Important=false&CustomerClassifications.InRoom=false&CustomerClassifications.LoyaltyProgram=false&CustomerClassifications.Media=false&CustomerClassifications.Military=false&CustomerClassifications.PaymasterAccount=false&CustomerClassifications.PreviousComplaint=false&CustomerClassifications.Problematic=false&CustomerClassifications.Returning=false&CustomerClassifications.Staff=false&CustomerClassifications.Student=false&CustomerClassifications.TopManagement=false&CustomerClassifications.VeryImportant=false&CustomerClassifications.WaitingForRoom=false&Products.Id%5B%5D=6cd0bc5c-3791-4374-91d9-b31d00c70668&Products.Id%5B%5D=e733dbc5-4390-49ba-a0fb-b332013785c3&Products.Id%5B%5D=cc1852b3-79d1-4c39-8ffb-b31d00cae6cc&Products.Id%5B%5D=d2dfa1b7-9ab1-4082-ae6d-b331009aadc8&Products.Id%5B%5D=1361dd09-fda3-45bc-8eda-b3320138a0c2&Products.Id%5B%5D=a82741ff-fc39-441f-8674-b33201383d08&Products.Id%5B%5D=7a596bbb-d9d5-4cc1-8175-b31d00c88137&Products.Id%5B%5D=eaddb778-b118-42ca-8ae6-b3130086b7ac&Products.Id%5B%5D=3ee7b1a8-ab89-48d9-8072-b3130086b7ac&Products.Id%5B%5D=9b739fc6-388c-4bab-aceb-b3130086b8d7&Products.Id%5B%5D=a53b8385-028a-463a-bc54-b3130086b7ac&Products.Id%5B%5D=7b22d4cb-18d1-40b6-953c-b3130086b7ac&Products.Id%5B%5D=5dc46a03-3547-4199-af68-b3130086b7ac&Products.Id%5B%5D=0480db35-1ab3-426b-ba5f-b3130086b7ac&Products.Id%5B%5D=5e9f32e0-1b09-45b0-b526-b3130086b7ac&Products.Id%5B%5D=20a3a8aa-e90a-4078-a051-b3130086b7ac&Products.Id%5B%5D=c8c8e9b0-0408-4fb0-bcb2-b3130086b7ac&Products.Id%5B%5D=23296dd9-ea30-467a-bbe2-b3130086b7ac&Products.Id%5B%5D=f073df1c-00cd-4ae4-a41b-b3130086b7ac&Ordering=Space" },
];
function master_formatDateForUrl(dateString) { const [year, month, day] = dateString.split('-'); return `${day}/${month}/${year}`; }
function master_getCurrentDateString() { const today = new Date(); const year = today.getFullYear(); const month = String(today.getMonth() + 1).padStart(2, '0'); const day = String(today.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }
function master_addDaysToDate(dateString, days) { const date = new Date(dateString + 'T00:00:00Z'); date.setUTCDate(date.getUTCDate() + days); const year = date.getUTCFullYear(); const month = String(date.getUTCMonth() + 1).padStart(2, '0'); const day = String(date.getUTCDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }
function master_updateLinks() {
    const dateInput = document.getElementById('date-input');
    const linksContainer = document.getElementById('links-container');
    const selectedDateString = dateInput.value;
    if (!selectedDateString) { linksContainer.innerHTML = '<p class="text-red-500">Please select a valid date.</p>'; document.getElementById('current-date-display').textContent = ''; return; }
    const newUrlDate = master_formatDateForUrl(selectedDateString);
    const newEncodedDate = newUrlDate.replace(/\//g, '%2F');
    document.getElementById('current-date-display').textContent = `Links are currently set for: ${newUrlDate}`;
    linksContainer.innerHTML = '';
    MASTER_REPORT_LINKS.forEach(linkTemplate => {
        let updatedUrl = linkTemplate.url;
        let endDateToUse = newEncodedDate;
        let daysToAdd = 0;
        let subtext = '';
        if (linkTemplate.name === "HK Arrival & Departure List") { subtext = '*to be used with Housekeeping Plan'; } 
        else if (linkTemplate.name === "HK Arrival List") { subtext = '*to be printed normally'; } 
        else if (linkTemplate.name === "Daily Kitchen Products") { daysToAdd = 5; subtext = '*to be used with Kitchen List'; } 
        else if (linkTemplate.name === "Twin List (10 day forecast)") { daysToAdd = 10; subtext = '*to be used with twin room visualizer'; }
        if (daysToAdd > 0) { const futureDateString = master_addDaysToDate(selectedDateString, daysToAdd); const futureUrlDate = master_formatDateForUrl(futureDateString); endDateToUse = futureUrlDate.replace(/\//g, '%2F'); }
        updatedUrl = updatedUrl.replace(/Start\.Date=.*?&/, `Start.Date=${newEncodedDate}&`);
        updatedUrl = updatedUrl.replace(/End\.Date=.*?(&|$)/, `End.Date=${endDateToUse}$1`);
        const linkElement = document.createElement('a');
        linkElement.href = updatedUrl;
        linkElement.target = "_blank";
        linkElement.className = "flex items-center justify-between p-4 bg-violet-50 hover:bg-violet-100 rounded-xl transition duration-200 ease-in-out border border-violet-200 group";
        let linkNameHtml = subtext ? `<div class="flex flex-col items-start"><span class="text-violet-700 font-medium">${linkTemplate.name}</span><p class="text-xs text-gray-500 italic mt-0.5">${subtext}</p></div>` : `<span class="text-violet-700 font-medium truncate">${linkTemplate.name}</span>`;
        linkElement.innerHTML = `${linkNameHtml}<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-violet-500 group-hover:text-violet-600 ml-3 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>`;
        linksContainer.appendChild(linkElement);
    });
}
    
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
