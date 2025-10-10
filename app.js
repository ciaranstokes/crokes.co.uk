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


// --- ORIGINAL APP SCRIPTS (WITH CORRECTIONS) ---

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
    dateInput.value = master_
