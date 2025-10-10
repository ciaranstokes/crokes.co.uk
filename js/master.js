// --- DYNAMIC HEADER SCRIPT ---
function initializeDynamicHeader(appPrefix, reportName) {
    const datePicker = document.getElementById(`${appPrefix}-date-picker`);
    const reportLink = document.getElementById(`${appPrefix}-report-link`);
    if (!datePicker || !reportLink) {
        return;
    }
    const updateLink = () => {
        const selectedDateString = datePicker.value;
        if (!selectedDateString) return;
        const reportTemplate = MASTER_REPORT_LINKS.find(link => link.name === reportName);
        if (!reportTemplate) {
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
    if(dateInput) {
        dateInput.value = master_getCurrentDateString();
        master_updateLinks();
    }
}

const MASTER_REPORT_LINKS = [
    { name: "Breakfast List", url: "https://app.mews.com/Commander/7cad25ef-cd74-451c-a19d-b31300863d83/ProductCheckList/Index?Start.Date=01%2F01%2F2025&End.Date=01%2F01%2F2025" },
    { name: "HK Arrival & Departure List", url: "https://app.mews.com/Commander/7cad25ef-cd74-451c-a19d-b31300863d83/GuestInHouseReport/Index?EnterpriseId=7cad25ef-cd74-451c-a19d-b31300863d83&Custom=True&Service.Id=88229245-b44c-496d-a9a9-b3130086af01&Start.Date=02%2F10%2F2025&Start.Time=00%3A15&End.Date=02%2F10%2F2025&End.Time=23%3A00" },
    { name: "HK Arrival List", url: "https://app.mews.com/Commander/7cad25ef-cd74-451c-a19d-b31300863d83/GuestInHouseReport/Index?EnterpriseId=7cad25ef-cd74-451c-a19d-b31300863d83&Custom=True&Service.Id=88229245-b44c-496d-a9a9-b3130086af01&Start.Date=22%2F08%2F2025&Start.Time=13%3A00&End.Date=22%2F08%2F2025&End.Time=23%3A00" },
    { name: "Daily Kitchen Products", url: "https://app.mews.com/Commander/7cad25ef-cd74-451c-a19d-b31300863d83/ProductReport/Index?EnterpriseId=7cad25ef-cd74-451c-a19d-b31300863d83&Custom=True&Service.Id=88229245-b44c-496d-a9a9-b3130086af01&Start.Date=22%2F08%2F2025&Start.Time=00%3A00&End.Date=04%2F09%2F2025&End.Time=00%3A00" },
    { name: "Twin List (10 day forecast)", url: "https://app.mews.com/Commander/7cad25ef-cd74-451c-a19d-b31300863d83/GuestInHouseReport/Index?EnterpriseId=7cad25ef-cd74-451c-a19d-b31300863d83&Custom=True&Service.Id=88229245-b44c-496d-a9a9-b3130086af01&Start.Date=02%2F10%2F2025&Start.Time=00%3A15&End.Date=12%2F10%2F2025&End.Time=23%3A00" },
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
