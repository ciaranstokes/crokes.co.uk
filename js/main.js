document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('#main-nav .nav-button');
    const contentArea = document.getElementById('content-area');
    const loadedScripts = new Set(); // Keep track of loaded scripts

    // Maps fragment names to their JS file and init function
    const appConfig = {
        'home.html': { script: 'js/master.js', init: 'master_init' },
        'breakfast.html': { script: 'js/breakfast.js', init: 'breakfast_init' },
        'kitchen.html': { script: 'js/kitchen.js', init: 'kitchen_init' },
        'hk.html': { script: 'js/hk.js', init: 'hk_init' },
        'twin.html': { script: 'js/twin.js', init: 'twin_init' }
    };

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            // Don't load the same script twice
            if (loadedScripts.has(src)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                loadedScripts.add(src);
                resolve();
            };
            script.onerror = () => reject(new Error(`Script load error for ${src}`));
            document.body.appendChild(script);
        });
    };

    const loadFragment = async (fragmentName) => {
        try {
            contentArea.innerHTML = '<p>Loading...</p>';
            
            // 1. Fetch and display the HTML
            const response = await fetch(`fragments/${fragmentName}`);
            if (!response.ok) throw new Error('Content not found.');
            const content = await response.text();
            contentArea.innerHTML = content;

            // 2. Load the required JavaScript file
            const config = appConfig[fragmentName];
            if (config) {
                await loadScript(config.script);
                // 3. Run the initializer function for that app
                if (window[config.init]) {
                    window[config.init]();
                }
            }
        } catch (error) {
            console.error('Failed to load fragment:', error);
            contentArea.innerHTML = `<p class="text-red-500 text-center">${error.message}</p>`;
        }
    };

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const fragment = button.dataset.fragment;
            
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            loadFragment(fragment);
            history.pushState({ fragment }, '', button.href);
        });
    });

    // Load initial app
    loadFragment('home.html');
});
