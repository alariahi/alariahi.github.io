/*==========

Theme Name: Foodify - Food HTML5 Template
Theme Version: 1.0

==========*/

/*==========
----- JS INDEX -----
1.smooth scroll
2.Scroll to top
3.Scroll to Section
==========*/


// smooth scroll

var html = document.documentElement;
var body = document.body;

var scroller = {
    target: document.querySelector("#js-scroll-content"),
    ease: 0.08, // <= scroll speed
    endY: 0,
    y: 0,
    resizeRequest: 1,
    scrollRequest: 0,
};

var requestId = null;

TweenLite.set(scroller.target, {
    rotation: 0.001,
    force3D: true,
});

window.addEventListener("load", onLoad);

function onLoad() {
    updateScroller();
    window.focus();
    window.addEventListener("resize", onResize);
    document.addEventListener("scroll", onScroll);
}

function updateScroller() {
    var resized = scroller.resizeRequest > 0;

    if (resized) {
        var height = scroller.target.clientHeight;
        var footerHeight = document.querySelector('footer') ? document.querySelector('footer').clientHeight : 300;
        // Dynamic calculation to ensure footer is reachable
        body.style.height = (height + footerHeight*2 + 100) + "px";
        scroller.resizeRequest = 0;
    }

    var scrollY = window.pageYOffset || html.scrollTop || body.scrollTop || 0;

    scroller.endY = scrollY;
    scroller.y += (scrollY - scroller.y) * scroller.ease;

    if (Math.abs(scrollY - scroller.y) < 0.05 || resized) {
        scroller.y = scrollY;
        scroller.scrollRequest = 0;
    }

    TweenLite.set(scroller.target, {
        y: -scroller.y,
    });

    requestId =
        scroller.scrollRequest > 0 ? requestAnimationFrame(updateScroller) : null;
}

function onScroll() {
    scroller.scrollRequest++;
    if (!requestId) {
        requestId = requestAnimationFrame(updateScroller);
    }
}

function onResize() {
    scroller.resizeRequest++;
    if (!requestId) {
        requestId = requestAnimationFrame(updateScroller);
    }
}

// Fix navigation scroll issues
if (document.querySelector(".filters")) {
    jQuery(".filters").on("click", function() {
        setTimeout(function() {
            onScroll();
            onResize();
        }, 1000);
    });
}

// Add event listeners only if elements exist
if (document.querySelector(".filters li")) {
    document.querySelector(".filters li").addEventListener("click", onResize);
    document.querySelector(".filters li").addEventListener("click", onScroll);
}

// Scroll to top
const scrolltotop = document.querySelector(".scrolltop");
if (scrolltotop) {
    scrolltotop.addEventListener("click", () =>
        gsap.to(window, {
            scrollTo: 0,
        })
    );
}

// Scroll to Section - Improved for better navigation
var sections = $('section'),
    nav = $('.foody-nav-menu, .banner-btn, .header-menu'),
    nav_height = nav.outerHeight();

nav.find('a').on('click', function(e) {
    var $el = $(this),
        id = $el.attr('href');
        
    // Only apply to anchor links
    if (id && id.charAt(0) === '#') {
        e.preventDefault();
        
        // Close mobile menu if open
        $('.main-navigation').removeClass('toggled');
        
        // Calculate position with offset for header
        var targetOffset = $(id).offset().top - nav_height - 20;
        
        $('html, body').animate({
            scrollTop: targetOffset
        }, 500);
        
        // Force scroll update after animation
        setTimeout(function() {
            onScroll();
            onResize();
        }, 600);
        
        return false;
    }
});

// Fix mobile menu scrolling
$('.menu-toggle').on('click', function() {
    $('body').toggleClass('menu-open', $('.main-navigation').hasClass('toggled'));
});