/**
 * Simple Filter Enhancement
 * Makes filters properly highlight when selected and ensures MixItUp is disabled
 */
document.addEventListener('DOMContentLoaded', function() {
    // Mark that we're using pagination, not direct display
    window.paginationActive = true;
    
    // Get all filter elements
    const filterItems = document.querySelectorAll('.menu-tab ul li.filter');
    
    if (!filterItems.length) return;
    
    // Set up click events for filter items
    filterItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all filters
            filterItems.forEach(filter => filter.classList.remove('active'));
            
            // Add active class to clicked filter
            this.classList.add('active');
        });
    });
    
    // Set initial active state to 'All' filter
    if (filterItems.length > 0) {
        // Find the "All" filter or use the first filter
        const allFilter = Array.from(filterItems).find(item => 
            item.getAttribute('data-filter') && 
            item.getAttribute('data-filter').includes('.all')
        ) || filterItems[0];
        
        allFilter.classList.add('active');
    }
    
    // Disable MixItUp if it's going to be initialized
    // This prevents the initial display of all products
    const menuDish = document.getElementById('menu-dish');
    if (menuDish) {
        // Add a class to mark it as pagination-controlled
        menuDish.classList.add('pagination-controlled');
    }
    
    // Override MixItUp initialization
    if (typeof window.mixitup !== 'undefined') {
        // Store the original mixitup function
        const originalMixItUp = window.mixitup;
        
        // Override with a function that checks if we're using pagination
        window.mixitup = function(container, options) {
            // Check if we're using pagination
            if (window.paginationActive) {
                console.log('Pagination is active, MixItUp disabled');
                return null;
            }
            
            // If not, use the original function
            return originalMixItUp(container, options);
        };
    }
});
