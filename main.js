// Modified main.js to resolve scrolling issues
$(document).ready(function ($) {
    "use strict";

    // Swiper initialization for book table image slider
    var book_table = new Swiper(".book-table-img-slider", {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        speed: 2000,
        effect: "coverflow",
        coverflowEffect: {
            rotate: 3,
            stretch: 2,
            depth: 100,
            modifier: 5,
            slideShadows: false,
        },
        loopAdditionSlides: true,
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });

    var team_slider = new Swiper(".team-slider", {
        slidesPerView: 3,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        speed: 2000,

        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
        breakpoints: {
            0: {
                slidesPerView: 1.2,
            },
            768: {
                slidesPerView: 2,
            },
            992: {
                slidesPerView: 3,
            },
            1200: {
                slidesPerView: 3,
            },
        },
    });

    jQuery(".filters").on("click", function () {
        jQuery("#menu-dish").removeClass("bydefault_show");
    });
    
    $(function () {
        var filterList = {
            init: function () {
                $("#menu-dish").mixItUp({
                    selectors: {
                        target: ".dish-box-wp",
                        filter: ".filter",
                    },
                    animation: {
                        effects: "fade",
                        easing: "ease-in-out",
                    },
                    load: {
                        filter: ".all, .breakfast, .lunch, .dinner",
                    },
                });
            },
        };
        filterList.init();
    });

    // Menu Toggle - with fixed scroll
    jQuery(".menu-toggle").click(function () {
        jQuery(".main-navigation").toggleClass("toggled");
        
        // Force scroll recalculation when closing menu
        if (!jQuery(".main-navigation").hasClass("toggled")) {
            setTimeout(function() {
                // Trigger scroll events to fix position
                if (typeof onScroll === 'function') {
                    onScroll();
                }
                if (typeof onResize === 'function') {
                    onResize();
                }
            }, 400);
        }
    });

    jQuery(".header-menu ul li a").click(function () {
        jQuery(".main-navigation").removeClass("toggled");
    });

    // Sticky Header
    gsap.registerPlugin(ScrollTrigger);

    var elementFirst = document.querySelector('.site-header');
    ScrollTrigger.create({
        trigger: "body",
        start: "30px top",
        end: "bottom bottom",
        onEnter: () => myFunction(),
        onLeaveBack: () => myFunction(),
    });

    function myFunction() {
        elementFirst.classList.toggle('sticky_head');
    }

    // Initialize parallax scene if it exists
    var scene = $(".js-parallax-scene").get(0);
    if (scene) {
        var parallaxInstance = new Parallax(scene);
    }

    // Fix for mobile menu dimensions
    $(window).on('resize', function() {
        if (window.innerWidth < 992) {
            // Mobile view fixes
            adjustMobileLayout();
        }
    });

    // Fix for dimension dropdowns on mobile
    $('.dimensions-dropdown').on('click', function(e) {
        if (window.innerWidth < 768) {
            $('.dimensions-content').hide();
            $(this).find('.dimensions-content').toggle();
            e.stopPropagation();
        }
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dimensions-dropdown').length) {
            $('.dimensions-content').hide();
        }
    });

    // Adjust layout on mobile devices
    function adjustMobileLayout() {
        // Ensure scrollable content on mobile
        $('body').removeClass('body-fixed');
        
        // Make sure filters are scrollable
        $('.menu-tab ul').css({
            'overflow-x': 'auto',
            'white-space': 'nowrap',
            'display': 'flex'
        });
    }

    // Call adjustments on load
    if (window.innerWidth < 992) {
        adjustMobileLayout();
    }
    
    // Remove body-fixed on load to prevent scroll lock
    setTimeout(function() {
        $('body').removeClass('body-fixed');
    }, 200);
});

// Simplified filter tab functionality
jQuery(window).on('load', function () {
    // Remove any body-fixed class that might prevent scrolling
    $('body').removeClass('body-fixed');
    
    // Simplified filter tab functionality
    let targets = document.querySelectorAll(".filter");
    
    // Apply click handler to each filter
    for (let i = 0; i < targets.length; i++) {
        targets[i].addEventListener("click", function() {
            // Remove active class from all filters
            for (let j = 0; j < targets.length; j++) {
                targets[j].classList.remove('active');
            }
            
            // Add active class to clicked filter
            this.classList.add('active');
            
            // Trigger scroll events to fix position
            setTimeout(function() {
                if (typeof onScroll === 'function') {
                    onScroll();
                }
                if (typeof onResize === 'function') {
                    onResize();
                }
            }, 500);
        });
    }
    
    // Set initial active class
    if (targets.length > 0) {
        targets[0].classList.add('active');
    }
});