document.addEventListener('DOMContentLoaded', function() {
    // Set a global flag to indicate pagination is active
    window.paginationActive = true;
    
    // Pagination configuration
    const ITEMS_PER_PAGE = 8; // Number of products per page
    let currentPage = 1;
    let totalPages = 1;
    let allProducts = [];
    let filteredProducts = [];
    let activeFilter = 'all';
    let currentLanguage = 'fr'; // Default language is now French
    let searchQuery = ''; // Search query for filtering products
    
    // Translation object for product-specific terms
    const productTranslations = {
        en: {
            dimensions: "Dimensions",
            thickness: "Thickness",
            diameter: "Diameter",
            lengths: "Lengths",
            category: "Category",
            availability: "Availability",
            inStock: "In Stock",
            outOfStock: "Out of Stock",
            viewDetails: "View Details",
            contactForInfo: "Contact for info",
            contactForDetails: "Contact for details",
            noProductsFound: "No Products Found",
            tryDifferentSearch: "Try a different category or search term",
            loadingProducts: "Loading products...",
            available: "Available",
            multipleOptions: "Multiple options available",
            andMore: "and {0} more..."
        },
        fr: {
            dimensions: "Dimensions",
            thickness: "Épaisseur",
            diameter: "Diamètre",
            lengths: "Longueurs",
            category: "Catégorie",
            availability: "Disponibilité",
            inStock: "En Stock",
            outOfStock: "Rupture de Stock",
            viewDetails: "Voir Détails",
            contactForInfo: "Contactez pour info",
            contactForDetails: "Contactez pour détails",
            noProductsFound: "Aucun Produit Trouvé",
            tryDifferentSearch: "Essayez une autre catégorie ou terme de recherche",
            loadingProducts: "Chargement des produits...",
            available: "Disponible",
            multipleOptions: "Plusieurs options disponibles",
            andMore: "et {0} autres..."
        }
    };
    
    // Elements
    const menuDish = document.getElementById('menu-dish');
    
    // Create pagination container if it doesn't exist
    let paginationContainer = document.querySelector('.pagination-container');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-container';
        
        // Add pagination container after menu-dish
        if (menuDish) {
            menuDish.parentNode.insertBefore(paginationContainer, menuDish.nextSibling);
        }
    }
    
    // Function to get translated text
    function getTranslatedText(key, replacements = []) {
        if (!productTranslations[currentLanguage] || !productTranslations[currentLanguage][key]) {
            // Fallback to English if translation not found
            if (!productTranslations['en'][key]) return key;
            return productTranslations['en'][key];
        }
        
        let text = productTranslations[currentLanguage][key];
        
        // Replace placeholders like {0}, {1}, etc. with values from replacements array
        for (let i = 0; i < replacements.length; i++) {
            text = text.replace(`{${i}}`, replacements[i]);
        }
        
        return text;
    }
    
    // Function to detect current language and set it
    function detectLanguage() {
        // Always default to French unless explicitly set
        if (window.currentLanguage) {
            currentLanguage = window.currentLanguage;
        } else {
            currentLanguage = 'fr';
        }
        
        // Check if language is supported, otherwise default to French
        if (!productTranslations[currentLanguage]) {
            currentLanguage = 'fr';
        }

        // Update search placeholder
        setTimeout(() => {
            const searchInput = document.getElementById('product-search-input');
            if (searchInput) {
                searchInput.placeholder = currentLanguage === 'fr' ? 'Rechercher des produits...' : 'Search products...';
            }
        }, 0);
    }
    
    // Immediately hide any previously loaded products
    if (menuDish) {
        // Clear any existing products
        menuDish.innerHTML = '';
        
        // Add a loading indicator
        const loadingSpinner = document.createElement('div');
        loadingSpinner.id = 'loading-spinner';
        loadingSpinner.className = 'spinner-container';
        loadingSpinner.innerHTML = `<div class="spinner"></div><p data-filter="loadingProducts">${getTranslatedText('loadingProducts')}</p>`;
        menuDish.appendChild(loadingSpinner);
    }
    
    // Function to load products with pagination
    function loadProducts() {
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
        
        // Update loading text with current language
        const loadingText = loadingSpinner ? loadingSpinner.querySelector('p') : null;
        if (loadingText) {
            loadingText.textContent = getTranslatedText('loadingProducts');
        }
        
        fetch('products.json')
            .then(response => response.json())
            .then(products => {
                allProducts = products;
                
                // Set the 'All' filter as active immediately
                const allFilter = document.querySelector('.filter[data-filter=".all, .Fer_Marchands, .Poutrelles, .Toles, .Inox, .Aluminium, .Panneaux_Sandwich, .Caillebotis, .Tubes, .Lames_Rideaux, .Ressort"]');
                if (allFilter) {
                    // Remove active class from all filters first
                    document.querySelectorAll('.filter').forEach(filter => {
                        filter.classList.remove('active');
                    });
                    
                    // Add active class to the 'All' filter
                    allFilter.classList.add('active');
                }
                
                // Apply initial filter (show all)
                filterProducts('all');
                
                // Hide loading spinner
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                
                // Update filters with proper translations
                updateFilterLabels();
            })
            .catch(error => {
                console.error('Error loading products:', error);
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                
                // Show error message
                const noProductsMessage = document.getElementById('no-products-message');
                if (noProductsMessage) {
                    const h3 = noProductsMessage.querySelector('h3[data-filter="noProductsFound"]');
                    const p = noProductsMessage.querySelector('p[data-filter="tryDifferentSearch"]');
                    
                    if (h3) h3.textContent = getTranslatedText('noProductsFound');
                    if (p) p.textContent = getTranslatedText('tryDifferentSearch');
                    
                    noProductsMessage.style.display = 'block';
                }
            });
    }
    
    // Function to filter products
    function filterProducts(filter, isSearch = false) {
        // Reset to first page when filter changes
        if (activeFilter !== filter && !isSearch) {
            currentPage = 1;
        }
        
        activeFilter = filter;
        
        // Update filter UI - highlight active filter
        const filterItems = document.querySelectorAll('.menu-tab ul li.filter');
        filterItems.forEach(item => {
            const itemFilter = item.getAttribute('data-filter').replace('.', '');
            if ((itemFilter === 'all' && filter === 'all') || 
                (filter !== 'all' && itemFilter === filter)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Apply filter and search
        let baseProducts = (filter === 'all') ? [...allProducts] : allProducts.filter(product => product.category === filter);

        // If searching, filter by product name (and optionally category)
        if (searchQuery) {
            baseProducts = baseProducts.filter(product => {
                const name = getTranslatedProductName(product).toLowerCase();
                const category = formatCategory(product.category).toLowerCase();
                return name.includes(searchQuery) || category.includes(searchQuery);
            });
        }
        filteredProducts = baseProducts;
        
        // Calculate total pages
        totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
        
        // Render products for current page
        renderProducts();
        
        // Update pagination
        renderPagination();
    }
    
    // Function to get translated product name based on current language
    function getTranslatedProductName(product) {
        if (!product || !product.name) return '';
        
        // If we're using English and we have the original name, use it
        if (currentLanguage === 'en') {
            return product.name;
        }
        
        // If we're using French and have name_fr property, use it
        if (currentLanguage === 'fr' && product.name_fr) {
            return product.name_fr;
        }
        
        // Try to find a translation in the translations object
        // First normalize the product name to create a consistent key
        const normalizedName = normalizeProductName(product.name);
        
        // Look for an exact match in translations
        if (window.translations && 
            window.translations[currentLanguage] && 
            window.translations[currentLanguage][normalizedName]) {
            return window.translations[currentLanguage][normalizedName];
        }
        
        // Check if the product name is already a key in translations object
        if (window.translations && 
            window.translations[currentLanguage] && 
            window.translations[currentLanguage][product.name]) {
            return window.translations[currentLanguage][product.name];
        }
        
        // Try matching with spaces removed
        const noSpaceName = product.name.replace(/\s+/g, '');
        if (window.translations && 
            window.translations[currentLanguage] && 
            window.translations[currentLanguage][noSpaceName]) {
            return window.translations[currentLanguage][noSpaceName];
        }
        
        // Look for the product name as a key in the other language
        // This helps when English names are keys in the French section or vice versa
        const otherLang = currentLanguage === 'en' ? 'fr' : 'en';
        const values = window.translations && window.translations[otherLang] ? 
            Object.entries(window.translations[otherLang]) : [];
        
        for (const [key, value] of values) {
            // If we found the product name as a value in the other language, 
            // use the key to look up in current language
            if (value === product.name && window.translations[currentLanguage][key]) {
                return window.translations[currentLanguage][key];
            }
        }
        
        // Fallback to the original name
        return product.name;
    }
    
    // Helper function to normalize product names for consistent key matching
    function normalizeProductName(name) {
        if (!name) return '';
        
        // Remove spaces, convert to lowercase
        return name.toLowerCase()
            .replace(/\s+/g, '')  // Remove all spaces
            .replace(/[éèêë]/g, 'e')  // Normalize French accents
            .replace(/[àâä]/g, 'a')
            .replace(/[ùûü]/g, 'u')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ç]/g, 'c');
    }
    
    // Function to render products for current page
    function renderProducts() {
        if (!menuDish) return;
        
        // Calculate start and end indices
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length);
        
        // Get products for current page
        const currentPageProducts = filteredProducts.slice(startIndex, endIndex);
        
        // Clear menu dish
        menuDish.innerHTML = '';
        
        if (currentPageProducts.length === 0) {
            const noProductsElement = document.createElement('div');
            noProductsElement.className = 'no-products-container';
            noProductsElement.innerHTML = `
                <h3>${getTranslatedText('noProductsFound')}</h3>
                <p>${getTranslatedText('tryDifferentSearch')}</p>
            `;
            menuDish.appendChild(noProductsElement);
            return;
        }
        
        // Create a row wrapper for proper grid alignment
        const rowWrapper = document.createElement('div');
        rowWrapper.className = 'product-grid-row';
        menuDish.appendChild(rowWrapper);
        
        // Render each product
        currentPageProducts.forEach(product => {
            // Create product HTML
            const productElement = document.createElement('div');
            productElement.className = `dish-box-wp ${product.category} mix`;
            productElement.innerHTML = createProductHTML(product);
            rowWrapper.appendChild(productElement);
        });
        
        // Ensure consistent sizing with a small script
        const allDishBoxes = document.querySelectorAll('.dish-box');
        if (allDishBoxes.length > 0) {
            // Force equal height for all product boxes
            let maxHeight = 0;
            allDishBoxes.forEach(box => {
                box.style.height = 'auto'; // Reset height first
                const boxHeight = box.offsetHeight;
                maxHeight = Math.max(maxHeight, boxHeight);
            });
            
            // Apply the max height to all boxes
            if (maxHeight > 0) {
                allDishBoxes.forEach(box => {
                    box.style.height = `${maxHeight}px`;
                });
            }
        }
        
        // Add event listeners to the 'View Details' buttons
        addViewDetailsButtons();
        
        // Trigger event for other scripts to know products have loaded
        document.dispatchEvent(new Event('productCardsLoaded'));
        
        // Scroll to menu section (with offset for header) if changing pages
        if (currentPage > 1) {
            const menuSection = document.getElementById('menu');
            if (menuSection) {
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const scrollToPosition = menuSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: scrollToPosition,
                    behavior: 'smooth'
                });
            }
        }
    }
    
    // Function to create product HTML
    function createProductHTML(product) {
        // Create dimensions preview text
        let dimensionsPreview = '';
        if (product.dimensions) {
            if (Array.isArray(product.dimensions)) {
                dimensionsPreview = product.dimensions.slice(0, 3).join(', ');
                if (product.dimensions.length > 3) {
                    dimensionsPreview += ' ' + getTranslatedText('andMore', [product.dimensions.length - 3]);
                }
            } else if (typeof product.dimensions === 'object') {
                dimensionsPreview = getTranslatedText('multipleOptions');
            } else {
                dimensionsPreview = product.dimensions;
            }
        } else if (product.thickness) {
            dimensionsPreview = `${getTranslatedText('thickness')}: ${product.thickness}`;
        } else if (product.diamètre || product.diameter) {
            dimensionsPreview = `${getTranslatedText('diameter')}: ${product.diamètre || product.diameter}`;
        }

        // Create availability status
        const isAvailable = product.availability || product.available;
        
        // Ensure text length is consistent by truncating if necessary
        const truncateName = name => {
            return name.length > 40 ? name.substring(0, 37) + '...' : name;
        };
        
        // Get translated product name
        const productName = getTranslatedProductName(product);
        
        // Get translated category name
        const categoryName = formatCategory(product.category);
        
        return `
            <div class="dish-box">
                <div class="dist-img">
                    <img src="${product.image}" alt="${productName}">
                </div>
                <div class="dish-rating">
                    <div class="star-rating-wp">
                        <div class="star-rating">
                            <div class="star-rating__fill" style="width: ${(product.rating || 5) * 20}%"></div>
                        </div>
                    </div>
                </div>
                <div class="dish-title">
                    <h3 class="h3-title">${truncateName(productName)}</h3>
                    <p>${categoryName}</p>
                </div>
                <div class="dish-info">
                    <ul>
                        <li>
                            <p>${getTranslatedText('dimensions')}</p>
                            <b>${dimensionsPreview || getTranslatedText('contactForInfo')}</b>
                        </li>
                    </ul>
                    <div class="dimensions-preview">
                        ${getTranslatedText('dimensions')}: ${dimensionsPreview || getTranslatedText('contactForDetails')}
                    </div>
                </div>
                <div class="view-details-btn-container">
                    <button class="view-details-btn">${getTranslatedText('viewDetails')}</button>
                    <div class="availability-badge ${isAvailable ? 'available' : 'unavailable'}">
                        ${isAvailable ? getTranslatedText('available') : getTranslatedText('outOfStock')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Function to add event listeners to the View Details buttons
    function addViewDetailsButtons() {
        const viewDetailsButtons = document.querySelectorAll('.view-details-btn');
        
        viewDetailsButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productBox = this.closest('.dish-box');
                if (!productBox) return;
                
                const productName = productBox.querySelector('.h3-title').textContent;
                
                // Find the product in our data
                const product = filteredProducts.find(p => getTranslatedProductName(p) === productName || p.name === productName);
                if (!product) return;
                
                // Trigger modal opening
                if (typeof openProductModal === 'function') {
                    openProductModal(product);
                } else {
                    // Open modal via custom event if direct function call is not available
                    const event = new CustomEvent('openProductModal', { detail: { product } });
                    document.dispatchEvent(event);
                }
            });
        });
    }
    
    // Function to render pagination
    function renderPagination() {
        // Skip if there are no products or only one page
        if (filteredProducts.length === 0 || totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        // Create pagination HTML
        let paginationHTML = '<ul class="pagination">';
        
        // Previous button
        paginationHTML += `
            <li class="${currentPage === 1 ? 'disabled' : ''}">
                ${currentPage === 1 
                    ? '<span class="pagination-prev"><i class="uil uil-angle-left"></i></span>' 
                    : '<a href="#" class="pagination-prev"><i class="uil uil-angle-left"></i></a>'}
            </li>
        `;
        
        // Page numbers
        const maxVisiblePages = window.innerWidth < 768 ? 3 : 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust start page if end page is at max
        if (endPage === totalPages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // First page link if not visible
        if (startPage > 1) {
            paginationHTML += `
                <li><a href="#" data-page="1">1</a></li>
                ${startPage > 2 ? '<li><span>...</span></li>' : ''}
            `;
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="${i === currentPage ? 'active' : ''}">
                    ${i === currentPage 
                        ? `<span>${i}</span>` 
                        : `<a href="#" data-page="${i}">${i}</a>`}
                </li>
            `;
        }
        
        // Last page link if not visible
        if (endPage < totalPages) {
            paginationHTML += `
                ${endPage < totalPages - 1 ? '<li><span>...</span></li>' : ''}
                <li><a href="#" data-page="${totalPages}">${totalPages}</a></li>
            `;
        }
        
        // Next button
        paginationHTML += `
            <li class="${currentPage === totalPages ? 'disabled' : ''}">
                ${currentPage === totalPages 
                    ? '<span class="pagination-next"><i class="uil uil-angle-right"></i></span>' 
                    : '<a href="#" class="pagination-next"><i class="uil uil-angle-right"></i></a>'}
            </li>
        `;
        
        paginationHTML += '</ul>';
        
        // Update pagination container
        paginationContainer.innerHTML = paginationHTML;
        
        // Add event listeners to pagination controls
        const pageLinks = paginationContainer.querySelectorAll('a[data-page]');
        pageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                currentPage = parseInt(this.getAttribute('data-page'));
                renderProducts();
                renderPagination();
            });
        });
        
        // Previous button
        const prevButton = paginationContainer.querySelector('.pagination-prev');
        if (prevButton && !prevButton.parentElement.classList.contains('disabled')) {
            prevButton.addEventListener('click', function(e) {
                e.preventDefault();
                if (currentPage > 1) {
                    currentPage--;
                    renderProducts();
                    renderPagination();
                }
            });
        }
        
        // Next button
        const nextButton = paginationContainer.querySelector('.pagination-next');
        if (nextButton && !nextButton.parentElement.classList.contains('disabled')) {
            nextButton.addEventListener('click', function(e) {
                e.preventDefault();
                if (currentPage < totalPages) {
                    currentPage++;
                    renderProducts();
                    renderPagination();
                }
            });
        }
    }
    
    // Function to open product modal
    function openProductModal(product) {
        // Create modal if it doesn't exist
        let modalOverlay = document.querySelector('.product-modal-overlay');
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.className = 'product-modal-overlay';
            
            const modalContent = `
                <div class="product-modal">
                    <div class="modal-close"><i class="uil uil-times"></i></div>
                    <div class="product-modal-content"></div>
                </div>
            `;
            modalOverlay.innerHTML = modalContent;
            document.body.appendChild(modalOverlay);
            
            // Add close event handlers
            const closeBtn = modalOverlay.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeProductModal);
            }
            
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === modalOverlay) {
                    closeProductModal();
                }
            });
        }
        
        // Populate modal with product details
        const modalContent = document.querySelector('.product-modal-content');
        if (modalContent) {
            // Get translated product name
            const productName = getTranslatedProductName(product);
            
            // Header with image and title
            let html = `
                <div class="modal-header">
                    <div class="modal-img">
                        <img src="${product.image}" alt="${productName}">
                    </div>
                    <div class="modal-title">
                        <h3>${productName}</h3>
                        <p>${getTranslatedText('category')}: ${formatCategory(product.category)}</p>
                    </div>
                </div>
                <div class="modal-details">`;
            
            // Add dimensions section if available
            if (product.dimensions) {
                html += generateDetailSection(getTranslatedText('dimensions'), product.dimensions);
            }
            
            // Add thickness if available
            if (product.thickness) {
                html += generateDetailSection(getTranslatedText('thickness'), product.thickness);
            }
            
            // Add diameter if available
            if (product.diamètre || product.diameter) {
                html += generateDetailSection(getTranslatedText('diameter'), product.diamètre || product.diameter);
            }
            
            // Add lengths if available
            if (product.lengths) {
                html += generateDetailSection(getTranslatedText('lengths'), product.lengths);
            }
            
            // Add availability status
            const isAvailable = product.availability || product.available;
            html += `
                <div class="detail-group">
                    <span class="detail-label">${getTranslatedText('availability')}</span>
                    <div class="detail-value">
                        <span class="availability-tag ${isAvailable ? 'available' : 'unavailable'}">
                            ${isAvailable ? getTranslatedText('inStock') : getTranslatedText('outOfStock')}
                        </span>
                    </div>
                </div>`;
            
            html += `</div>`;
            
            modalContent.innerHTML = html;
        }
        
        // Open the modal
        modalOverlay.classList.add('active');
        document.querySelector('.product-modal').classList.add('active');
        document.body.classList.add('modal-open');
    }
    
    // Function to close product modal
    function closeProductModal() {
        const modalOverlay = document.querySelector('.product-modal-overlay');
        const modal = document.querySelector('.product-modal');
        
        if (modal) {
            modal.classList.remove('active');
        }
        
        if (modalOverlay) {
            setTimeout(() => {
                modalOverlay.classList.remove('active');
                document.body.classList.remove('modal-open');
            }, 300);
        }
    }
    
    // Format category names for display with translations
    function formatCategory(category) {
        if (!category) return getTranslatedText('uncategorized');
        
        // First check for direct translation with the category key
        if (window.translations && 
            window.translations[currentLanguage] && 
            window.translations[currentLanguage][category]) {
            return window.translations[currentLanguage][category];
        }
        
        // Then try with the category key without underscores
        const categoryKey = category.replace(/_/g, '');
        if (window.translations && 
            window.translations[currentLanguage] && 
            window.translations[currentLanguage][categoryKey]) {
            return window.translations[currentLanguage][categoryKey];
        }
        
        // Next, check if there's a translation for the display format (spaces instead of underscores)
        const displayCategory = category.replace(/_/g, ' ');
        if (window.translations && 
            window.translations[currentLanguage] && 
            window.translations[currentLanguage][displayCategory]) {
            return window.translations[currentLanguage][displayCategory];
        }
        
        // Fallback to standard formatting if no translation found
        return displayCategory
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    // Function to generate detail sections
    function generateDetailSection(label, data) {
        let html = `
            <div class="detail-group">
                <span class="detail-label">${label}</span>
                <div class="detail-value">`;
        
        if (Array.isArray(data)) {
            // For array data, show each item as a chip/badge
            data.forEach(item => {
                html += `<span class="dimension-item">${item}</span>`;
            });
        } else if (typeof data === 'object') {
            // For object data, show each property and its values
            for (const [key, value] of Object.entries(data)) {
                const translatedKey = key.charAt(0).toUpperCase() + key.slice(1);
                
                if (Array.isArray(value)) {
                    html += `<div><strong>${translatedKey}:</strong></div>`;
                    value.forEach(item => {
                        html += `<span class="dimension-item">${item}</span>`;
                    });
                } else {
                    html += `<span class="dimension-item"><strong>${translatedKey}:</strong> ${value}</span>`;
                }
            }
        } else {
            // For simple string/number data
            html += `<span class="dimension-item">${data}</span>`;
        }
        
        html += `</div></div>`;
        return html;
    }
    
    // Function to update filter labels with current language
    function updateFilterLabels() {
        document.querySelectorAll('.filter').forEach(filter => {
            const originalFilter = filter.getAttribute('data-filter');
            const filterText = originalFilter.replace(/\./g, '').trim();
            
            // Try various formats to find a translation
            if (window.translations && window.translations[currentLanguage]) {
                // Check with the original filter text
                if (window.translations[currentLanguage][filterText]) {
                    updateFilterText(filter, window.translations[currentLanguage][filterText]);
                    return;
                }
                
                // Check without the spaces
                const noSpaceFilter = filterText.replace(/ /g, '');
                if (window.translations[currentLanguage][noSpaceFilter]) {
                    updateFilterText(filter, window.translations[currentLanguage][noSpaceFilter]);
                    return;
                }
                
                // Try with the displayed text content
                const displayText = filter.textContent.trim();
                if (window.translations[currentLanguage][displayText]) {
                    updateFilterText(filter, window.translations[currentLanguage][displayText]);
                    return;
                }
                
                // Try with the displayed text content without spaces
                const noSpaceDisplayText = displayText.replace(/ /g, '');
                if (window.translations[currentLanguage][noSpaceDisplayText]) {
                    updateFilterText(filter, window.translations[currentLanguage][noSpaceDisplayText]);
                }
            }
        });
    }
    
    // Helper function to update filter text without affecting its children
    function updateFilterText(filter, newText) {
        // Don't update the img tag if there is one
        const imgTag = filter.querySelector('img');
        if (imgTag) {
            // Get all text nodes in the filter
            const textNodes = Array.from(filter.childNodes).filter(node => 
                node.nodeType === Node.TEXT_NODE
            );
            
            // If there's a text node, update it
            if (textNodes.length > 0) {
                // Update the last text node (the one after the image)
                textNodes[textNodes.length - 1].nodeValue = newText;
            } else {
                // If no text node exists, create one
                filter.appendChild(document.createTextNode(newText));
            }
        } else {
            // If no image, just set the text content
            filter.textContent = newText;
        }
    }
    
    // Listen for language changes from the existing translation system
    function setupLanguageChangeListener() {
        // Check if the existing language switchers are available
        const switchToEn = document.getElementById('switch-to-en');
        const switchToFr = document.getElementById('switch-to-fr');
        
        if (switchToEn) {
            switchToEn.addEventListener('click', function() {
                // Wait a moment for the translations.js switchLanguage to complete
                setTimeout(() => {
                    onLanguageChange('en');
                }, 100);
            });
        }
        
        if (switchToFr) {
            switchToFr.addEventListener('click', function() {
                // Wait a moment for the translations.js switchLanguage to complete
                setTimeout(() => {
                    onLanguageChange('fr');
                }, 100);
            });
        }
        
        // Also look for any custom events that signal a language change
        document.addEventListener('languageChanged', function(e) {
            if (e.detail && e.detail.language) {
                onLanguageChange(e.detail.language);
            }
        });
    }
    
    // Listen for language changes
    function onLanguageChange(newLanguage) {
        if (newLanguage && newLanguage !== currentLanguage) {
            currentLanguage = newLanguage;
            
            // Update UI with new language
            renderProducts();
            renderPagination();
            updateFilterLabels();
            
            // Update any "data-filter" elements with translations
            updateDataFilterElements();

            // Update search placeholder
            const searchInput = document.getElementById('product-search-input');
            if (searchInput) {
                searchInput.placeholder = currentLanguage === 'fr' ? 'Rechercher des produits...' : 'Search products...';
            }
        }
    }
    
    // Update elements with data-filter attribute
    function updateDataFilterElements() {
        document.querySelectorAll('[data-filter]').forEach(el => {
            const filterKey = el.getAttribute('data-filter');
            if (window.translations && window.translations[currentLanguage] && window.translations[currentLanguage][filterKey]) {
                el.textContent = window.translations[currentLanguage][filterKey];
            }
        });
    }
    
    // Initialize the language change listener
    setupLanguageChangeListener();
    
    // Add event listeners for filter buttons
    const filterButtons = document.querySelectorAll('.filter');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter').replace('.', '');
            filterProducts(filter === 'all, .Fer_Marchands, .Poutrelles, .Toles, .Inox, .Aluminium, .Panneaux_Sandwich, .Caillebotis, .Tubes, .Lames_Rideaux, .Ressort' ? 'all' : filter);
        });
    });
    
    // Handle window resize for responsive pagination
    window.addEventListener('resize', function() {
        renderPagination();
    });
    
    // Handle keyboard events for modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
    
    // Listen for language change events
    document.addEventListener('languageChanged', function(e) {
        if (e.detail && e.detail.language) {
            onLanguageChange(e.detail.language);
        }
    });
    
    // Listen for clicks on language switcher
    document.getElementById('switch-to-en')?.addEventListener('click', function() {
        onLanguageChange('en');
    });
    
    document.getElementById('switch-to-fr')?.addEventListener('click', function() {
        onLanguageChange('fr');
    });
    
    // 1. Add search bar inside the filters container (as first child of .menu-tab)
    function insertSearchBar() {
        const menuSection = document.getElementById('menu');
        if (!menuSection) return;
        const menuTab = menuSection.querySelector('.menu-tab');
        if (!menuTab) return;
        // Avoid duplicate
        let searchBar = document.getElementById('product-search-bar');
        if (!searchBar) {
            searchBar = document.createElement('div');
            searchBar.id = 'product-search-bar';
            searchBar.className = 'product-search-bar-inline';
            searchBar.innerHTML = `
                <input
                    type="text"
                    id="product-search-input"
                    placeholder="Search products..."
                    class="product-search-input"
                    autocomplete="off"
                >
            `;
            menuTab.insertBefore(searchBar, menuTab.firstChild);
        }
    }

    // 2. Search logic
    function handleSearchInput(e) {
        searchQuery = e.target.value.trim().toLowerCase();
        filterProducts(activeFilter, true); // true = isSearch
    }

    // 4. Insert search bar and add event listener after DOM is ready
    insertSearchBar();
    const searchInput = document.getElementById('product-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }

    // Initialize with proper language
    detectLanguage();
    
    // Initialize pagination immediately
    loadProducts();
    
    // Add some CSS for the grid layout and search bar immediately
    const style = document.createElement('style');
    style.textContent = `
        .menu-tab {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 18px;
            margin-bottom: 0;
        }
        .product-search-bar-inline {
            flex: 0 0 auto;
            display: flex;
            align-items: center;
            margin-right: 18px;
        }
        .product-search-input {
            width: 240px;
            min-width: 180px;
            max-width: 320px;
            padding: 10px 20px;
            border-radius: 30px;
            border: none;
            background: linear-gradient(145deg, #ececec, #ffffff);
            box-shadow: 9px 9px 18px #e4e4e4, -9px -9px 18px #ffffff;
            font-size: 16px;
            color: #0d0d25;
            outline: none;
            transition: box-shadow 0.2s, background 0.2s;
        }
        .product-search-input:focus {
            box-shadow: 0 0 0 2px #ff0000, 9px 9px 18px #e4e4e4, -9px -9px 18px #ffffff;
            background: #f8f9fa;
        }
        .product-search-input::placeholder {
            color: #bfbfbf;
            font-size: 15px;
            opacity: 1;
        }
        @media (max-width: 991px) {
            .menu-tab {
                flex-direction: column;
                align-items: stretch;
                gap: 10px;
            }
            .product-search-bar-inline {
                margin: 0 0 10px 0;
                justify-content: center;
            }
            .product-search-input {
                width: 100%;
                max-width: 100%;
            }
        }
        .product-grid-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
        }
        .dish-box-wp {
            width: 25%;
            padding: 0 15px;
            margin-bottom: 30px;
            display: flex;
        }
        .dish-box {
            width: 100%;
            height: 100%;
        }
        .availability-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 5px;
        }
        .availability-badge.available {
            background-color: #4CAF50;
            color: white;
        }
        .availability-badge.unavailable {
            background-color: #f44336;
            color: white;
        }
        @media (max-width: 1199px) {
            .dish-box-wp {
                width: 33.333%;
            }
        }
        @media (max-width: 991px) {
            .dish-box-wp {
                width: 50%;
            }
        }
        @media (max-width: 575px) {
            .dish-box-wp {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
});
