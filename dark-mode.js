document.addEventListener('DOMContentLoaded', function() {
    // Get dark mode toggle button and icon elements
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // If theme is saved in local storage, use that
    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        updateIcon(savedTheme === 'dark');
    } 
    // Otherwise, apply dark mode based on device preference
    else if (prefersDarkMode) {
        document.body.classList.add('dark-mode');
        updateIcon(true);
        localStorage.setItem('theme', 'dark');
    }
    
    // Add click event to dark mode toggle
    darkModeToggle.addEventListener('click', function() {
        // Toggle dark mode class on body
        document.body.classList.toggle('dark-mode');
        
        // Save user preference to localStorage
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        
        // Update the icon
        updateIcon(isDarkMode);
    });
    
    // Function to update the icon based on theme
    function updateIcon(isDarkMode) {
        // Remove all icon classes
        darkModeIcon.className = '';
        
        // Add appropriate icon class
        if (isDarkMode) {
            darkModeIcon.classList.add('uil', 'uil-sun');
        } else {
            darkModeIcon.classList.add('uil', 'uil-moon');
        }
    }
});
