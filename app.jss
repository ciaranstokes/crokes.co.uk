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
// (The rest of your original script goes here...)
// NOTE: I've omitted the rest of the 1000+ lines of your app-specific JS for brevity,
// but you should paste ALL your original JavaScript functions below this line.
