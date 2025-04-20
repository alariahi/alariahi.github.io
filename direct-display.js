// Direct display fallback for product loading - deactivated when pagination is active

document.addEventListener('DOMContentLoaded', function() {
    // Check if pagination is active (set by pagination.js)
    if (window.paginationActive) {
        console.log('Pagination is active, direct display disabled');
        return;
    }
    
    // Check if menu-dish is marked as pagination-controlled
    const menuDish = document.getElementById('menu-dish');
    if (menuDish && menuDish.classList.contains('pagination-controlled')) {
        console.log('Menu is pagination controlled, direct display disabled');
        return;
    }
    
    console.log('No pagination active, initializing direct display as fallback');
    
    // Wait a bit to ensure pagination had time to initialize if it's going to
    setTimeout(function() {
        // Final check for pagination
        if (window.paginationActive || document.querySelector('.pagination-container')) {
            console.log('Pagination detected on delayed check, direct display disabled');
            return;
        }
        
        // If we got here, initialize direct display as fallback
        loadProductsDirect();
    }, 1000);
    
    // Function to render a product card
    function renderProductCard(product) {
        // Create dimensions preview text
        let dimensionsPreview = '';
        if (product.dimensions) {
            if (Array.isArray(product.dimensions)) {
                dimensionsPreview = product.dimensions.slice(0, 3).join(', ');
                if (product.dimensions.length > 3) {
                    dimensionsPreview += ` and ${product.dimensions.length - 3} more...`;
                }
            } else if (typeof product.dimensions === 'object') {
                dimensionsPreview = 'Multiple options available';
            } else {
                dimensionsPreview = product.dimensions;
            }
        } else if (product.thickness) {
            dimensionsPreview = `Thickness: ${product.thickness}`;
        } else if (product.diamètre || product.diameter) {
            dimensionsPreview = `Diameter: ${product.diamètre || product.diameter}`;
        }

        // Create availability status
        const isAvailable = product.availability || product.available;
        
        return `
            <div class="dish-box-wp ${product.category} mix">
                <div class="dish-box">
                    <div class="dist-img">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="dish-rating">
                        <div class="star-rating-wp">
                            <div class="star-rating">
                                <div class="star-rating__fill" style="width: ${(product.rating || 5) * 20}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="dish-title">
                        <h3 class="h3-title">${product.name}</h3>
                        <p>${product.category ? product.category.replace(/_/g, ' ') : ''}</p>
                    </div>
                    <div class="dish-info">
                        <ul>
                            <li>
                                <p>Dimensions</p>
                                <b>${dimensionsPreview || 'Contact for info'}</b>
                            </li>
                        </ul>
                        <div class="dimensions-preview">
                            Dimensions: ${dimensionsPreview || 'Contact for details'}
                        </div>
                    </div>
                    <div class="view-details-btn-container">
                        <button class="view-details-btn">View Details</button>
                    </div>
                    <div class="dist-bottom-row">
                        <ul>
                            <li>
                                <div class="availability-container">
                                    <span class="available-text">
                                        ${isAvailable ? 'Available' : 'Out of Stock'}
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    // Function to load and display products if pagination isn't active
    function loadProductsDirect() {
        if (window.paginationActive) return;
        
        const menuDish = document.getElementById('menu-dish');
        if (!menuDish) return;
        
        // Show loading spinner
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
        
        fetch('products.json')
            .then(response => response.json())
            .then(products => {
                // Hide loading spinner
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                
                // Display no products message if empty
                const noProductsMessage = document.getElementById('no-products-message');
                if (products.length === 0) {
                    if (noProductsMessage) noProductsMessage.style.display = 'block';
                    return;
                } else {
                    if (noProductsMessage) noProductsMessage.style.display = 'none';
                }
                
                // Render products
                let html = '';
                products.forEach(product => {
                    html += renderProductCard(product);
                });
                
                menuDish.innerHTML = html;
                
                // Make sure "View Details" buttons work
                addViewDetailsButtons(products);
                
                // Initialize MixItUp if not already initialized
                initMixItUp();
            })
            .catch(error => {
                console.error('Error loading products:', error);
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                const noProductsMessage = document.getElementById('no-products-message');
                if (noProductsMessage) noProductsMessage.style.display = 'block';
            });
    }
    
    // Helper to add click handlers to view details buttons
    function addViewDetailsButtons(products) {
        const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
        
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productBox = this.closest('.dish-box');
                if (!productBox) return;
                
                const productName = productBox.querySelector('.h3-title').textContent;
                const product = products.find(p => p.name === productName);
                
                if (product) {
                    // Dispatch event for product-modal.js to handle
                    const event = new CustomEvent('openProductModal', { detail: { product } });
                    document.dispatchEvent(event);
                }
            });
        });
    }
    
    // Helper to initialize MixItUp
    function initMixItUp() {
        const menuDish = document.getElementById('menu-dish');
        
        if (!menuDish || menuDish.classList.contains('mixitup-container') || window.paginationActive) {
            return;
        }
        
        if (typeof mixitup !== 'undefined') {
            try {
                mixitup('#menu-dish', {
                    selectors: {
                        target: '.dish-box-wp',
                        filter: '.filter'
                    },
                    animation: {
                        effects: "fade",
                        easing: "ease-in-out"
                    },
                    load: {
                        filter: ".all"
                    }
                });
                menuDish.classList.add('mixitup-container');
            } catch (error) {
                console.error('Error initializing MixItUp:', error);
            }
        }
    }
});