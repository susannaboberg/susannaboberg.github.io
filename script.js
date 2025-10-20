
// ===================================
// GSAP & ScrollTrigger Setup
// ===================================
gsap.registerPlugin(ScrollTrigger); 

// ===================================
// Navigation Overlay Logic
// ===================================
const overlay = document.querySelector('.nav-list .overlay');
const logoOverlay = document.querySelector('.logo-overlay');
const nav_list = document.querySelectorAll('.nav-list ul li');
const nav_list_container = document.querySelector('.nav-list');
const logo_wrapper = document.querySelector('.logo-wrapper');
const logo = document.querySelector('.logo');

// Function to position overlay on active link
function positionOverlayOnActive() {
    // Check if logo is active
    if (logo.classList.contains('active')) {
        // Position logo overlay
        const logoRect = logo.getBoundingClientRect();
        const wrapperRect = logo_wrapper.getBoundingClientRect();
        
        logoOverlay.style.right = '3px';
        logoOverlay.style.top = (logoRect.top - wrapperRect.top) + 'px';
        logoOverlay.style.height = logoRect.height + 'px';
        logoOverlay.style.width = logoRect.width + 'px';
        logoOverlay.style.opacity = '1';
        
        // Hide nav overlay
        overlay.style.opacity = '0';
    } else {
        // Check for active nav link
        const activeNavLink = document.querySelector('.nav-list a.active');
        
        if (activeNavLink) {
            // Position nav overlay
            const linkRect = activeNavLink.getBoundingClientRect();
            const containerRect = nav_list_container.getBoundingClientRect();
            
            overlay.style.left = (linkRect.left - containerRect.left) + 'px';
            overlay.style.top = (linkRect.top - containerRect.top) + 'px';
            overlay.style.height = linkRect.height + 'px';
            overlay.style.width = linkRect.width + 'px';
            overlay.style.opacity = '1';
            
            // Hide logo overlay
            logoOverlay.style.opacity = '0';
        } else {
            // No active link found, hide both overlays
            overlay.style.opacity = '0';
            logoOverlay.style.opacity = '0';
        }
    }
}

// Position overlay on page load
positionOverlayOnActive();

// Nav list hover
nav_list.forEach((list) => {
    list.addEventListener('mouseover', () => {
        const link = list.querySelector('a');
        const linkRect = link.getBoundingClientRect();
        const containerRect = nav_list_container.getBoundingClientRect();
        
        overlay.classList.add('active');
        overlay.style.opacity = '1';
        overlay.style.left = (linkRect.left - containerRect.left) + 'px';
        overlay.style.top = (linkRect.top - containerRect.top) + 'px';
        overlay.style.height = linkRect.height + 'px';
        overlay.style.width = linkRect.width + 'px';
        
        // Hide logo overlay when hovering nav
        logoOverlay.style.opacity = '0';
    });
});

// Logo hover effect
logo.addEventListener('mouseenter', () => {
    // Hide the nav overlay
    overlay.style.opacity = '0';
    
    // Get measurements
    const logoRect = logo.getBoundingClientRect();
    const wrapperRect = logo_wrapper.getBoundingClientRect();
    
    // Position logo overlay
    logoOverlay.style.right = '3px';
    logoOverlay.style.top = (logoRect.top - wrapperRect.top) + 'px';
    logoOverlay.style.height = logoRect.height + 'px';
    logoOverlay.style.width = logoRect.width + 'px';
    logoOverlay.style.opacity = '1';
});

logo.addEventListener('mouseleave', () => {
    overlay.classList.remove('active');
    logoOverlay.classList.remove('active');
    // Return to active link position
    positionOverlayOnActive();
});

// When mouse leaves the entire nav area, return overlay to active link
nav_list_container.addEventListener('mouseleave', () => {
    overlay.classList.remove('active');
    logoOverlay.classList.remove('active');
    // Return to active link position smoothly
    positionOverlayOnActive();
});

// Throttle resize and scroll listeners for better performance
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(positionOverlayOnActive, 100);
});

let scrollTimeout;
let isScrolling = false;
window.addEventListener('scroll', () => {
    if (!isScrolling) {
        window.requestAnimationFrame(() => {
            positionOverlayOnActive();
            isScrolling = false;
        });
        isScrolling = true;
    }
}, { passive: true });

// ===================================
// Mobile Menu Toggle
// ===================================
const mobileMenuToggle = $('.mobile-menu-toggle');
const navLinks = $('.nav-list');
const navbar = $('.navbar');

mobileMenuToggle.on('click', function() {
    $(this).toggleClass('active');
    navLinks.toggleClass('active');
    
    const isExpanded = navLinks.hasClass('active');
    $(this).attr('aria-expanded', isExpanded);
    $('body').css('overflow', isExpanded ? 'hidden' : '');
});

// Close menu when clicking nav links
navLinks.find('a').on('click', function() {
    mobileMenuToggle.removeClass('active');
    navLinks.removeClass('active');
    mobileMenuToggle.attr('aria-expanded', 'false');
    $('body').css('overflow', '');
});




// ===================================
// GSAP Animations for Index Page
// ===================================
if ($('.hero').length) {
    // Hero title animation
    gsap.to('.hero-title', {
        duration: 3.0, 
        scrambleText: {
            text: "Susanna Boberg",
            chars: "lowerCase",
            revealDelay: 1,
            speed: 0.8
        }
    });

    // Hero description animation
    gsap.from('.hero-description', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 3.3
    });

    gsap.from('.words-container', {
        opacity: 0,
        duration: 0.8,
        delay: 3.8
    })

        // Fade in scroll section to opacity 0.7
    gsap.to('.scroll-down-section', {
        opacity: 0.7,
        duration: 0.8,
        delay: 3.8
    })




    // Work cards animation
    gsap.utils.toArray('.work-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 25,
            duration: 0.8,
            delay: 0.1
        });
    });
}

// ===================================
// SYNCHRONIZED Typewriter & Scramble Animations
// ===================================
if ($('.hero').length && $('.words-container').length) {
    const words = [
        " visual design",
        "  Deutsch",
        " programming languages",
        " français",
        " music"
    ];
    
    // Remove leading space for scroll words
    const scrollWords = [
        "↓ → ✳︎",
        "Scrollen, um Arbeiten zu sehen",
        "while (scrolling) {show(works);}",
        "Faites défiler pour voir les projets",
        "coda below",
    ]
    
    let currentWordIndex = 0;
    const container = document.querySelector('.words-container');
    const scrollTextElement = document.querySelector('.scroll-down-text');
    const scrollDownSection = document.querySelector('.scroll-down-section');
    
    // Create a single span for the typing effect
    const typingSpan = document.createElement('span');
    typingSpan.className = 'typing-word';
    container.innerHTML = '';
    container.appendChild(typingSpan);
    
    function synchronizedLoop() {
        const currentWord = words[currentWordIndex];
        const scrollWord = scrollWords[currentWordIndex];
        
        // Calculate typewriter timing
        const typeOutDuration = currentWord.length * 0.09;
        const pauseDuration = 1.8;
        const deleteInDuration = currentWord.length * 0.07;
        const shortPauseDuration = 0.8;
        
        // Create master timeline for typewriter
        const typewriterTL = gsap.timeline({
            onComplete: () => {
                currentWordIndex = (currentWordIndex + 1) % words.length;
                synchronizedLoop();
            }
        });
        
        // Type out the word
        typewriterTL.to(typingSpan, {
            duration: typeOutDuration,
            text: {
                value: currentWord,
                delimiter: ""
            },
            ease: "none"
        });
        
        // Pause at full word
        typewriterTL.to({}, { duration: pauseDuration });
        
        // Delete the word
        typewriterTL.to(typingSpan, {
            duration: deleteInDuration,
            text: {
                value: "",
                delimiter: ""
            },
            ease: "none"
        });
        
        // Short pause before next word
        typewriterTL.to({}, { duration: shortPauseDuration });
        
        // SYNCHRONIZED SCRAMBLE - starts at the same time
        if (scrollTextElement) {
            const scrambleDuration = 1.0;
            const scrambleStartDelay = typeOutDuration - 2.0;
            
            gsap.to(scrollTextElement, {
                duration: scrambleDuration,
                delay: Math.max(0, scrambleStartDelay),
                scrambleText: {
                    text: scrollWord,
                    chars: "lowerCase",
                    revealDelay: 0.3,
                    speed: 0.8
                }
            });
        }
    }
    
    // Start both animations together after initial page load
    gsap.delayedCall(5.0, synchronizedLoop);
    
    // Hide scroll arrow when user scrolls down
    if (scrollDownSection) {
        $(window).on('scroll', function() {
            const scrollPosition = $(window).scrollTop();
            
            if (scrollPosition > 100) {
                scrollDownSection.classList.add('hidden');
            } else {
                scrollDownSection.classList.remove('hidden');
            }
        });
    }
}

if ($('.work-card').length || $('.footer-email').length) {
    // Create single custom cursor element (reused for both)
    const customCursor = $('<div>', {
        class: 'custom-cursor'
    });
    $('body').append(customCursor);

    const cursorOffset = 3;

    
    // Work Card Cursor
    $('.work-card').on('mouseenter', function() {
        customCursor.text('View Case Study');
        customCursor.addClass('active with-arrow');
    });
    
    $('.work-card').on('mouseleave', function() {
        customCursor.removeClass('active');
        customCursor.removeClass('with-arrow');
    });
    
    $('.work-card').on('mousemove', function(e) {
        customCursor.css({
            left: e.clientX + 'px',
            top: e.clientY + 'px'
        });
    });
    
    // Email Button Cursor
    $('.footer-email').on('mouseenter', function() {
        customCursor.text('Copy Email');
        customCursor.addClass('active');
    });
    
    $('.footer-email').on('mouseleave', function() {
        customCursor.removeClass('active');
    });
    
    $('.footer-email').on('mousemove', function(e) {
        customCursor.css({
            left: e.clientX + cursorOffset + 'px',
            top: e.clientY + cursorOffset + 'px'
        });
    });
}

if ($('.footer-email').length) {
    const customCursor = $('<div>', {
        class: 'custom-cursor',
        text: 'Copy Email to Clipboard'
    });

    // Track cursor position
    $('.footer-email').on('mouseenter', function() {
        customCursor.addClass('active');
    });
    
    $('.footer-email').on('mouseleave', function() {
        customCursor.removeClass('active');
    });
    
    $('.footer-email').on('mousemove', function(e) {
        customCursor.css({
            left: e.clientX + 'px',
            top: e.clientY + 'px'
        });
    });    
}

// ===================================
// Footer: Copy email
// ===================================
const copyButton = document.getElementById('copyEmailBtn');
const email = 'sboberg617@gmail.com'; // 👈 your email address

copyButton.addEventListener('click', async () => {
    try {
    await navigator.clipboard.writeText(email);
    copyButton.textContent = 'Copied!';
    copyButton.classList.add('copied');

    // Reset button after 2 seconds
    setTimeout(() => {
        copyButton.textContent = 'Email';
        copyButton.classList.remove('copied');
    }, 2000);
    } catch (err) {
    console.error('Failed to copy: ', err);
    }
});
// ===================================
// Case Study Page: Text Highlight Animation
// ===================================
if ($('.case-study-page').length) {
    
    // Smooth text highlight on scroll
    gsap.utils.toArray('.highlight-text').forEach((elem) => {
        gsap.to(elem, {
            scrollTrigger: {
                trigger: elem,
                start: 'top 75%',
                end: 'bottom 60%',
                toggleActions: 'play none none reverse',
                onEnter: () => $(elem).addClass('active'),
                onLeaveBack: () => $(elem).removeClass('active')
            }
        });
    });
    
    // Section animations
    gsap.utils.toArray('.case-study-section').forEach((section) => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 30,
            duration: 0.6
        });
    });
}

// ===================================
// Case Study Page Load Animations
// ===================================
if ($('.case-study-page').length) {
    // Animate hero content on load
    gsap.from('.case-study-hero .back-link', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.7
    });
    
    gsap.from('.case-study-title', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.7
    });
    
    gsap.from('.case-study-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.9
    });

    gsap.from('.case-study-title-img', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 1.1
    })

    gsap.from('.case-study-hero .img-rounder', {
        opacity: 0,
        y:20,
        duration: 0.8,
        delay: 1.1
    })

    
}

// ===================================
// Case Study Page Navigation
// ===================================
if ($('.page-nav').length) {
    const pageNav = $('.page-nav');
    const overviewSection = $('#overview');
    
    function toggleNavVisibility() {
        if (overviewSection.length) {
            const overviewTop = overviewSection.offset().top;
            const scrollPos = $(window).scrollTop();
            const navHeight = $('.navbar').outerHeight();
            
            // Show nav when user reaches overview section
            if (scrollPos >= (overviewTop - navHeight - 100)) {
                pageNav.addClass('visible');
            } else {
                pageNav.removeClass('visible');
            }
        }
    }
    
    $(window).on('scroll', toggleNavVisibility);
    toggleNavVisibility(); // Check on load
    const sections = $('.case-study-section, .case-study-hero');
    const navSections = $('.nav-section');
    const progressLineActive = $('.progress-line-active');
    
    // Store current progress value for lerping
    let currentProgress = 0;
    let targetProgress = 0;
    

    // Update active nav on scroll
    function updateActiveNav() {
        const scrollPosition = $(window).scrollTop() + 150;
        let currentSection = '';
        
        // Find current section
        sections.each(function() {
            const sectionTop = $(this).offset().top;
            const sectionHeight = $(this).outerHeight();
            const sectionId = $(this).attr('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = sectionId;
            }
        });
        
        // Update nav highlighting - FIXED: Check if link belongs to current parent section
        navSections.each(function() {
            const $navSection = $(this);
            const mainLink = $navSection.find('> a');
            const subsections = $navSection.find('.nav-subsections');
            const mainHref = mainLink.attr('href').substring(1);
            
            // Remove active from main link
            mainLink.removeClass('active');
            
            // Check if current section matches main link
            if (mainHref === currentSection) {
                mainLink.addClass('active');
                $navSection.addClass('active');
            } else if (subsections.length) {
                // Check if current section is a subsection
                let hasActiveSubsection = false;
                subsections.find('a').each(function() {
                    const subLink = $(this);
                    const subHref = subLink.attr('href').substring(1);
                    subLink.removeClass('active');
                    
                    if (subHref === currentSection) {
                        subLink.addClass('active');
                        hasActiveSubsection = true;
                    }
                });
                
                // Only keep section open if it has active subsection
                if (hasActiveSubsection) {
                    $navSection.addClass('active');
                } else {
                    $navSection.removeClass('active');
                }
            } else {
                $navSection.removeClass('active');
            }
        });
        
        // Update progress line with lerp for smooth movement
        const activeLink = $('.page-nav-links a.active').first();
        if (activeLink.length) {
            const linkPosition = activeLink.position().top;
            const containerHeight = $('.page-nav-content').outerHeight();
            targetProgress = Math.min((linkPosition / containerHeight) * 100, 100);
        }
    }
    
    // Lerp function for smooth animation
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    // Animate progress line
    function animateProgressLine() {
        currentProgress = lerp(currentProgress, targetProgress, 0.1);
        progressLineActive.attr('y2', currentProgress + '%');
        requestAnimationFrame(animateProgressLine);
    }
    
    // Start animation loop
    animateProgressLine();
    
    // Update on scroll
    $(window).on('scroll', updateActiveNav);
    updateActiveNav();
}

// *** START CHANGE: Mobile Page Navigation Toggle ***
if ($('.page-nav').length) {
    // Create mobile toggle button
    const pageNavToggle = $('<button>', {
        class: 'page-nav-toggle',
        'aria-label': 'Toggle page navigation',
        'aria-expanded': 'false',
        html: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    });
    
    // Append toggle button to body (so it stays visible)
    $('body').append(pageNavToggle);
    
    // Check screen size and show button only on mobile
    function checkScreenSize() {
        if ($(window).width() <= 1024) {
            // On mobile, check if we should show the button
            const overviewSection = $('#overview');
            
            if (overviewSection.length) {
                const overviewTop = overviewSection.offset().top;
                const scrollPos = $(window).scrollTop();
                const navHeight = $('.navbar').outerHeight();
                
                // Show button if past overview and not near bottom
                if (scrollPos >= (overviewTop - navHeight - 100)) {
                    pageNavToggle.addClass('show');
                } else {
                    pageNavToggle.removeClass('show');
                    $('.page-nav').removeClass('mobile-open');
                    pageNavToggle.removeClass('active');
                    pageNavToggle.attr('aria-expanded', 'false');
                }
            }
        } else {
            // On desktop, hide button completely
            pageNavToggle.removeClass('show');
            $('.page-nav').removeClass('mobile-open');
            pageNavToggle.removeClass('active');
        }
    }
    
    // Toggle page nav on mobile
    pageNavToggle.on('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        const isOpen = $('.page-nav').hasClass('mobile-open');
        $('.page-nav').toggleClass('mobile-open');
        $(this).toggleClass('active');
        $(this).attr('aria-expanded', !isOpen);
    });
    
    // Close page nav when clicking on a link
    $('.page-nav-links a').on('click', function() {
        if ($(window).width() <= 1024) {
            $('.page-nav').removeClass('mobile-open');
            pageNavToggle.removeClass('active');
            pageNavToggle.attr('aria-expanded', 'false');
        }
    });
    
    // Close page nav when clicking outside on mobile
    $(document).on('click', function(e) {
        if ($(window).width() <= 1024) {
            if (!$('.page-nav').is(e.target) && 
                $('.page-nav').has(e.target).length === 0 &&
                !pageNavToggle.is(e.target) &&
                pageNavToggle.has(e.target).length === 0 &&
                $('.page-nav').hasClass('mobile-open')) {
                $('.page-nav').removeClass('mobile-open');
                pageNavToggle.removeClass('active');
                pageNavToggle.attr('aria-expanded', 'false');
            }
        }
    });
    
    // Use debounce to prevent excessive function calls on resize
    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(checkScreenSize, 150); // Wait 150ms after resize stops
    });
    
    // Check on scroll (throttled for better performance)
    let scrollTimer;
    let isScrolling = false;
    $(window).on('scroll', function() {
        if (!isScrolling) {
            window.requestAnimationFrame(function() {
                checkScreenSize();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
    
    checkScreenSize(); // Initial check
}
// *** END CHANGE ***

// *** START CHANGE: Back to Top Button ***
if ($('.case-study-page').length) {
    // Create back to top button
    const backToTop = $('<button>', {
        class: 'back-to-top',
        'aria-label': 'Back to top',
        html: '<svg viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    });
    
    $('body').append(backToTop);
    
    // Show/hide button based on scroll position
    function toggleBackToTop() {
        const scrollTop = $(window).scrollTop();
        const showThreshold = 400;
        
        if (scrollTop > showThreshold) {
            backToTop.addClass('visible');
        } else {
            backToTop.removeClass('visible');
        }
    }
    
    $(window).on('scroll', toggleBackToTop);
    toggleBackToTop();
    
    // Scroll to top on click
    backToTop.on('click', function() {
        $('html, body').animate({
            scrollTop: 0
        }, 200, 'linear');
    });
}
// *** END CHANGE ***

// ===================================
// Dropdown Functionality
// ===================================
$('.dropdown-trigger').on('click', function() {
    const isExpanded = $(this).attr('aria-expanded') === 'true';
    $(this).attr('aria-expanded', !isExpanded);
});

// ===================================
// Smooth Scroll for Anchor Links
// ===================================
$('a[href^="#"]').on('click', function(e) {
    const href = $(this).attr('href');
    if (href !== '#' && href !== '') {
        e.preventDefault();
        const target = $(href);
        if (target.length) {
            const navHeight = navbar.outerHeight();
            const targetPosition = target.offset().top - navHeight - 20;
            $('html, body').animate({
                scrollTop: targetPosition
            }, 50, 'linear'); /* *** CHANGE: Increased from 100 to 400 for smoother scroll *** */
        }
    }
});

// ===================================
// Active Navigation Based on Scroll Position (Index Page Only)
// ===================================
if ($('.hero').length && $('#work').length) {
    // Only run on index page where hero and work sections exist
    
    function updateActiveNavOnScroll() {
        const sections = [
            { id: 'work', element: document.querySelector('#work') },
            { id: 'hero', element: document.querySelector('.hero') }
        ];
        
        const scrollPosition = window.scrollY + 200; // Offset for better trigger
        
        let currentSection = 'hero'; // Default to home/hero
        
        sections.forEach(section => {
            if (section.element) {
                const sectionTop = section.element.offsetTop;
                const sectionHeight = section.element.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSection = section.id;
                }
            }
        });
        
        // Update active class on nav links
        $('.nav-list a, .logo').removeClass('active');
        
        if (currentSection === 'work') {
            $('.nav-list a[href="#work"]').addClass('active');
        } else {
            $('.logo').addClass('active');
        }
        
        // Reposition overlay
        positionOverlayOnActive();
    }

    // Throttled scroll listener for performance
    let scrollThrottle;
    $(window).on('scroll', function() {
        if (!scrollThrottle) {
            scrollThrottle = setTimeout(function() {
                updateActiveNavOnScroll();
                scrollThrottle = null;
            }, 100);
        }
    });

    // Handle click on Work link
    $('.nav-list a[href="#work"]').on('click', function() {
        $('.nav-list a, .logo').removeClass('active');
        $(this).addClass('active');
        positionOverlayOnActive();
    });

    // Handle click on Logo
    $('.logo').on('click', function() {
        $('.nav-list a').removeClass('active');
        $(this).addClass('active');
        positionOverlayOnActive();
    });

    // Initial check on page load
    updateActiveNavOnScroll();
}

// ===================================
// Intersection Observer for Simple Animations
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            $(entry.target).css({
                opacity: 1,
                transform: 'translateY(0)'
            });
        }
    });
}, observerOptions);

$('.skill-category').each(function() {
    observer.observe(this);
});