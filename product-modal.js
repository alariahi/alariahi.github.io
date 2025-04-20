/**
 * Product Modal Handler
 * Displays product details in a modal when a product is clicked
 */
document.addEventListener('DOMContentLoaded', function() {
    // Create modal elements if they don't exist
    createModalElements();
    
    // Listen for click events on view details buttons
    document.addEventListener('productCardsLoaded', function() {
        addViewDetailsListeners();
    });
    
    // Listen for open modal events (from pagination.js)
    document.addEventListener('openProductModal', function(e) {
        if (e.detail && e.detail.product) {
            openProductModal(e.detail.product);
        }
    });
    
    function createModalElements() {
        // Skip if modal already exists
        if (document.querySelector('.product-modal-overlay')) {
            return;
        }
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'product-modal-overlay';
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'product-modal';
        
        // Create close button
        const closeButton = document.createElement('div');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '<i class="uil uil-times"></i>';
        
        // Create modal content area
        const modalContent = document.createElement('div');
        modalContent.className = 'product-modal-content';
        
        // Assemble modal
        modalContainer.appendChild(closeButton);
        modalContainer.appendChild(modalContent);
        modalOverlay.appendChild(modalContainer);
        document.body.appendChild(modalOverlay);
        
        // Add event listeners
        closeButton.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
    
    function openProductModal(product) {
        const modalContent = document.querySelector('.product-modal-content');
        const modalOverlay = document.querySelector('.product-modal-overlay');
        const modalContainer = document.querySelector('.product-modal');
        
        if (!modalContent || !modalOverlay) {
            console.error('Modal elements not found');
            return;
        }
        
        // Generate modal content
        modalContent.innerHTML = generateModalContent(product);
        
        // Show the modal with animation
        document.body.classList.add('modal-open');
        modalOverlay.classList.add('active');
        
        // Small delay for animation
        setTimeout(() => {
            modalContainer.classList.add('active');
        }, 50);
    }
    
    function closeModal() {
        const modalOverlay = document.querySelector('.product-modal-overlay');
        const modalContainer = document.querySelector('.product-modal');
        
        if (!modalOverlay || !modalContainer) return;
        
        modalContainer.classList.remove('active');
        
        // Delay the overlay removal for animation
        setTimeout(() => {
            modalOverlay.classList.remove('active');
            document.body.classList.remove('modal-open');
        }, 300);
    }
    
    function generateModalContent(product) {
        // Create header with image and title
        let html = `
            <div class="modal-header">
                <div class="modal-img">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="modal-title">
                    <h3>${product.name}</h3>
                    <p>Category: ${formatCategory(product.category)}</p>
                </div>
            </div>
            <div class="modal-details">`;
        
        // Add dimensions section if available
        if (product.dimensions) {
            html += generateDetailSection('Dimensions', product.dimensions);
        }
        
        // Add thickness if available
        if (product.thickness) {
            html += generateDetailSection('Thickness', product.thickness);
        }
        
        // Add diameter if available
        if (product.diamètre || product.diameter) {
            html += generateDetailSection('Diameter', product.diamètre || product.diameter);
        }
        
        // Add lengths if available
        if (product.lengths) {
            html += generateDetailSection('Lengths', product.lengths);
        }
        
        // Add épaisseur if available
        if (product.épaisseur) {
            html += generateDetailSection('Thickness', product.épaisseur);
        }
        
        // Add availability status
        const isAvailable = product.availability || product.available;
        html += `
            <div class="detail-group">
                <span class="detail-label">Availability</span>
                <div class="detail-value">
                    <span class="availability-tag ${isAvailable ? 'available' : 'unavailable'}">
                        ${isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
            </div>`;
        
        html += `</div>`;
        
        return html;
    }
    
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
                if (Array.isArray(value)) {
                    html += `<div><strong>${formatKey(key)}:</strong></div>`;
                    value.forEach(item => {
                        html += `<span class="dimension-item">${item}</span>`;
                    });
                } else {
                    html += `<span class="dimension-item"><strong>${formatKey(key)}:</strong> ${value}</span>`;
                }
            }
        } else {
            // For simple string/number data
            html += `<span class="dimension-item">${data}</span>`;
        }
        
        html += `</div></div>`;
        return html;
    }
    
    function formatCategory(category) {
        if (!category) return 'Uncategorized';
        
        return category
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    function formatKey(key) {
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
    
    function addViewDetailsListeners() {
        const viewButtons = document.querySelectorAll('.view-details-btn:not(.initialized)');
        
        viewButtons.forEach(button => {
            // Mark as initialized to avoid duplicate handlers
            button.classList.add('initialized');
            
            button.addEventListener('click', function() {
                const productBox = this.closest('.dish-box');
                if (!productBox) return;
                
                const productName = productBox.querySelector('.h3-title').textContent;
                
                // Load product data and show modal
                fetch('products.json')
                    .then(response => response.json())
                    .then(products => {
                        const product = products.find(p => p.name === productName);
                        if (product) {
                            openProductModal(product);
                        }
                    })
                    .catch(error => console.error('Error loading product data:', error));
            });
        });
    }
});
