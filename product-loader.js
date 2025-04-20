// Improved product loader script with 3D card design and image path fixes

document.addEventListener('DOMContentLoaded', function() {
    const menuDish = document.getElementById('menu-dish');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noProductsMessage = document.getElementById('no-products-message');
    
    // Function to create a product card with 3D styling
    function createProductCard(product) {
        // Check if product has valid category for filtering
        if (!product.category && !product.categories) {
            console.warn('Product missing category:', product.name);
            // Instead of skipping, assign a default category
            product.category = "all";
        }

        const productCard = document.createElement('div');
        
        // If product has categories array, use that, otherwise use single category
        let categoryClasses = product.categories ? 
            product.categories.join(' ') : 
            (product.category ? product.category : 'all');
            
        productCard.className = `dish-box-wp ${categoryClasses} all`;
        
        // Add any additional filter classes if present
        if (product.filter) {
            productCard.classList.add(product.filter);
        }
        if (product.filters && Array.isArray(product.filters)) {
            product.filters.forEach(filter => productCard.classList.add(filter));
        }
        
        // Keep the image path as is - don't try to "fix" it
        let imagePath = product.image || '';
        
        // Format dimensions display
        let dimensionsDisplay = '';
        if (product.dimensions) {
            if (Array.isArray(product.dimensions)) {
                // If dimensions is an array, show first few items
                const maxToShow = 3;
                let displayDimensions = product.dimensions.slice(0, maxToShow);
                if (product.dimensions.length > maxToShow) {
                    displayDimensions.push('...');
                }
                dimensionsDisplay = displayDimensions.join(', ');
            } else if (typeof product.dimensions === 'object') {
                // If dimensions is an object, format it properly
                dimensionsDisplay = Object.entries(product.dimensions)
                    .map(([key, value]) => {
                        if (Array.isArray(value)) {
                            return `${key}: ${value.slice(0, 2).join(', ')}${value.length > 2 ? '...' : ''}`;
                        } else {
                            return `${key}: ${value}`;
                        }
                    })
                    .join('<br>');
            } else {
                dimensionsDisplay = product.dimensions;
            }
        } else if (product.dimension) {
            // Handle alternate dimensions field name
            dimensionsDisplay = Array.isArray(product.dimension) ? 
                product.dimension.slice(0, 3).join(', ') : product.dimension;
        }
        
        // Check availability (handle different property names)
        const isAvailable = product.availability === true || 
                           product.availability === "Available" || 
                           product.available === true;
        
        productCard.innerHTML = `
            <div class="dish-box">
                <div class="dist-img">
                    <img src="${imagePath}" alt="${product.name}" onerror="this.src='assets/images/product-placeholder.png'">
                </div>
                <div class="dish-title">
                    <h3 class="h3-title">${product.name}</h3>
                    <p>${dimensionsDisplay}</p>
                </div>
                <div class="dish-info">
                    <ul>
                        <li>
                            <p>Category</p>
                            <b>${product.category || 'General'}</b>
                        </li>
                        <li>
                            <p>Type</p>
                            <b>${product.filter || 'Standard'}</b>
                        </li>
                    </ul>
                </div>
                <div class="dist-bottom-row">
                    <ul>
                        <li>
                            <div class="availability-container ${isAvailable ? '' : 'not-available'}">
                                <span class="available-text">${isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                            </div>
                        </li>
                        <li>
                            <b>${product.code || ''}</b>
                        </li>
                    </ul>
                </div>
            </div>
        `;
        
        // Add 3D effect with mouse movement
        const dishBox = productCard.querySelector('.dish-box');
        
        productCard.addEventListener('mousemove', function(e) {
            const card = dishBox;
            const cardRect = card.getBoundingClientRect();
            
            // Calculate mouse position relative to card
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            const mouseX = e.clientX - cardCenterX;
            const mouseY = e.clientY - cardCenterY;
            
            // Calculate rotation (limited range)
            const rotateY = mouseX / 20;
            const rotateX = -mouseY / 20;
            
            // Apply transformation
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        productCard.addEventListener('mouseleave', function() {
            // Reset transformation when mouse leaves
            dishBox.style.transform = '';
            
            // Add transition only on mouse out for smooth reset
            dishBox.style.transition = 'transform 0.5s ease';
            
            // Remove transition after animation completes
            setTimeout(() => {
                dishBox.style.transition = '';
            }, 500);
        });
        
        return productCard;
    }
    
    // Function to display products
    function displayProducts(products) {
        // Hide loading spinner
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        // Clear existing content except spinner and no products message
        const existingProducts = menuDish.querySelectorAll('.dish-box-wp');
        existingProducts.forEach(product => {
            product.remove();
        });
        
        // Filter out invalid products and create cards
        const productCards = products
            .map(product => createProductCard(product))
            .filter(card => card !== null);
        
        // Show no products message if there are no products
        if (!productCards || productCards.length === 0) {
            if (noProductsMessage) {
                noProductsMessage.style.display = 'block';
            }
            return;
        }
        
        // Hide no products message
        if (noProductsMessage) {
            noProductsMessage.style.display = 'none';
        }
        
        // Add products
        productCards.forEach(card => {
            menuDish.appendChild(card);
        });
        
        // Re-initialize mixitup if available
        if (typeof mixitup !== 'undefined') {
            try {
                var mixer = mixitup('#menu-dish', {
                    selectors: {
                        target: '.dish-box-wp'
                    },
                    animation: {
                        duration: 300,
                        effects: 'fade translateZ(-100px)'
                    }
                });
            } catch (error) {
                console.warn('MixItUp initialization error:', error);
            }
        }
    }
    
    // Add demo fallback products if fetch fails
    function loadFallbackProducts() {
        console.log('Loading fallback products');
        
        // Demo products when JSON fetch fails
        const fallbackProducts = [
            {
                name: "Tôle Acier Galvanisé",
                description: "Tôle en acier galvanisé pour diverses applications industrielles et de construction.",
                image: "assets/images/dish/4.png",
                category: "Toles",
                dimensions: ["2000x1000mm"],
                code: "TAG-2010",
                availability: true
            },
            {
                name: "Fer UPN 80",
                description: "Profilé UPN pour structures métalliques et constructions.",
                image: "assets/images/dish/2.png",
                category: "Fer_Marchands",
                dimensions: ["80mm"],
                code: "UPN-80",
                availability: true
            },
            {
                name: "Tube Carré 40x40",
                description: "Tube carré en acier pour structures et mobilier.",
                image: "assets/images/dish/1.png",
                category: "Tubes",
                dimensions: ["40x40mm"],
                code: "TC-4040",
                availability: true
            }
        ];
        
        displayProducts(fallbackProducts);
    }
    
    // Function to load products from products.json
    function loadProducts() {
        // Show loading spinner
        if (loadingSpinner) {
            loadingSpinner.style.display = 'flex';
        }
        
        // Fetch products with cache busting to ensure latest version
        fetch('products.json?v=' + new Date().getTime())
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Products loaded:', data.length);
                if (!data || data.length === 0) {
                    throw new Error('No products found in data');
                }
                displayProducts(data);
            })
            .catch(error => {
                console.error('Error loading products:', error);
                
                // Try loading fallback products instead of showing an error
                loadFallbackProducts();
                
                // If there's a serious error, still show the message
                if (error.message.includes('JSON')) {
                    if (loadingSpinner) {
                        loadingSpinner.style.display = 'none';
                    }
                    if (noProductsMessage) {
                        noProductsMessage.style.display = 'block';
                        noProductsMessage.innerHTML = `
                            <h3>Error Loading Products</h3>
                            <p>Please check your connection and refresh.</p>
                            <p class="small text-muted">${error.message}</p>
                        `;
                    }
                }
            });
    }
    
    // Create product placeholder directory structure if needed
    function ensurePlaceholderImage() {
        const img = new Image();
        img.onerror = function() {
            console.warn("Product placeholder not found, using fallback");
            // Will use inline fallback in onerror handler
        };
        img.src = 'assets/images/product-placeholder.png';
    }
    
    // Make sure placeholder exists
    ensurePlaceholderImage();
    
    // Start loading products
    loadProducts();
});