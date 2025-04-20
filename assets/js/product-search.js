/* Product search functionality */
document.addEventListener('DOMContentLoaded', function() {
    // Get references to search elements
    const searchInput = document.getElementById('product-search');
    const searchButton = document.getElementById('search-btn');
    const noResultsDiv = document.getElementById('no-results');
    
    // Function to perform search
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const productCards = document.querySelectorAll('.dish-box-wp');
        let resultsFound = false;
        
        // If search term is empty, show all products
        if (searchTerm === '') {
            productCards.forEach(card => {
                card.style.display = '';
            });
            
            // Reset mixitup if it exists
            if (typeof mixitup !== 'undefined') {
                const mixer = mixitup('#menu-dish');
                mixer.filter('.all');
            }
            
            noResultsDiv.style.display = 'none';
            return;
        }
        
        // Search through each product card
        productCards.forEach(card => {
            // Skip spinner
            if (card.id === 'loading-spinner') return;
            
            const productName = card.querySelector('.h3-title')?.textContent.toLowerCase() || '';
            const productCategory = card.className.toLowerCase();
            
            // Check if product name or category contains search term
            if (productName.includes(searchTerm) || productCategory.includes(searchTerm)) {
                card.style.display = '';
                resultsFound = true;
            } else {
                // Check dimensions tags
                const dimensionTags = card.querySelectorAll('.dimension-tag');
                let foundInDimensions = false;
                dimensionTags.forEach(tag => {
                    if (tag.textContent.toLowerCase().includes(searchTerm)) {
                        foundInDimensions = true;
                    }
                });
                
                if (foundInDimensions) {
                    card.style.display = '';
                    resultsFound = true;
                } else {
                    card.style.display = 'none';
                }
            }
        });
        
        // Show/hide no results message
        noResultsDiv.style.display = resultsFound ? 'none' : 'block';
    }
    
    // Add event listeners
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Add live search (after a slight delay for performance)
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    });
});