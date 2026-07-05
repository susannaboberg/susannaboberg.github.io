// nav.js — nav overlay, mobile menu, smooth scroll, active-link tracking
// Requires: components.js (fires 'components:ready'), utils.js (positionOverlay,
// hideOverlay, initPillHoverOverlay)

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('components:ready', () => {
    const navOverlay = document.querySelector('.nav-pill-overlay');
    const logoOverlay = document.querySelector('.logo-pill-overlay');
    const navListContainer = document.querySelector('.nav-list ul');
    const logoWrapper = document.querySelector('.logo-wrapper');
    const logo = document.querySelector('.logo');
    const navItems = Array.from(document.querySelectorAll('.nav-list ul li a'));

    // ===================================
    // Nav Overlay Positioning

    function positionOverlayOnActive() {
        if (logo.classList.contains('active')) {
            positionOverlay(logoOverlay, logo, logoWrapper);
            hideOverlay(navOverlay);
        } else {
            const activeLink = document.querySelector('.nav-list a.active');
            if (activeLink) {
                positionOverlay(navOverlay, activeLink, navListContainer);
                hideOverlay(logoOverlay);
            } else {
                hideOverlay(navOverlay);
                hideOverlay(logoOverlay);
            }
        }
    }

    positionOverlayOnActive();

    // Hover-follow for nav links, snapping back to whichever link is active
    // (or hiding, if none is) once the mouse leaves the list.
    initPillHoverOverlay({
        container: navListContainer,
        items: navItems,
        overlay: navOverlay,
        getActiveTarget: () => document.querySelector('.nav-list a.active'),
    });

    // Logo has its own overlay/wrapper, so it's handled separately —
    // it's mutually exclusive with the nav-link overlay above.
    logo.addEventListener('mouseenter', () => {
        hideOverlay(navOverlay);
        positionOverlay(logoOverlay, logo, logoWrapper);
    });

    logo.addEventListener('mouseleave', positionOverlayOnActive);

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(positionOverlayOnActive, 100);
    });

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

    const mobileMenuToggle = $('.mobile-menu-toggle');
    const navLinks = $('.nav-list');
    const navbar = $('.navbar');

    mobileMenuToggle.on('click', function () {
        $(this).toggleClass('active');
        navLinks.toggleClass('active');

        const isExpanded = navLinks.hasClass('active');
        $(this).attr('aria-expanded', isExpanded);
        $('body').css('overflow', isExpanded ? 'hidden' : '');
    });

    navLinks.find('a').on('click', function () {
        mobileMenuToggle.removeClass('active');
        navLinks.removeClass('active');
        mobileMenuToggle.attr('aria-expanded', 'false');
        $('body').css('overflow', '');
    });

    // ===================================
    // Page Nav Mobile Toggle (case-study pages)

    if ($('.page-nav').length) {
        const pageNavToggle = $('<button>', {
            class: 'page-nav-toggle',
            'aria-label': 'Toggle page navigation',
            'aria-expanded': 'false',
            html: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        });

        $('body').append(pageNavToggle);

        function checkScreenSize() {
            if ($(window).width() <= 1240) {
                const overviewSection = $('#overview');

                if (overviewSection.length) {
                    const overviewTop = overviewSection.offset().top;
                    const scrollPos = $(window).scrollTop();
                    const navHeight = $('.navbar').outerHeight();

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
                pageNavToggle.removeClass('show');
                $('.page-nav').removeClass('mobile-open');
                pageNavToggle.removeClass('active');
            }
        }

        pageNavToggle.on('click', function (e) {
            e.stopPropagation();
            const isOpen = $('.page-nav').hasClass('mobile-open');
            $('.page-nav').toggleClass('mobile-open');
            $(this).toggleClass('active');
            $(this).attr('aria-expanded', !isOpen);
        });

        $('.page-nav-links a').on('click', function () {
            if ($(window).width() <= 1024) {
                $('.page-nav').removeClass('mobile-open');
                pageNavToggle.removeClass('active');
                pageNavToggle.attr('aria-expanded', 'false');
            }
        });

        $(document).on('click', function (e) {
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

        let resizeTimer;
        $(window).on('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(checkScreenSize, 150);
        });

        let isScrollingPageNav = false;
        $(window).on('scroll', function () {
            if (!isScrollingPageNav) {
                window.requestAnimationFrame(function () {
                    checkScreenSize();
                    isScrollingPageNav = false;
                });
                isScrollingPageNav = true;
            }
        });

        checkScreenSize();
    }

    // ===================================
    // Smooth Scroll for Anchor Links

    $('a[href^="#"]').on('click', function (e) {
        const href = $(this).attr('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = $(href);
            if (target.length) {
                const navHeight = navbar.outerHeight();
                const targetPosition = target.offset().top - navHeight - 20;
                $('html, body').animate({
                    scrollTop: targetPosition
                }, 50, 'linear');
            }
        }
    });

    // ===================================
    // Active Navigation Based on Scroll Position (Index Page Only)

    if ($('.hero').length && $('#work').length) {

        function updateActiveNavOnScroll() {
            const sections = [
                { id: 'work', element: document.querySelector('#work') },
                { id: 'hero', element: document.querySelector('.hero') }
            ];

            const scrollPosition = window.scrollY + 200;

            let currentSection = 'hero';

            sections.forEach(section => {
                if (section.element) {
                    const sectionTop = section.element.offsetTop;
                    const sectionHeight = section.element.offsetHeight;

                    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        currentSection = section.id;
                    }
                }
            });

            $('.nav-list a, .logo').removeClass('active');

            if (currentSection === 'work') {
                // Matches on data-nav, not href, since the href now includes
                // "/index.html#work" (needed so the link works from other pages).
                $('.nav-list a[data-nav="work"]').addClass('active');
            } else {
                $('.logo').addClass('active');
            }

            positionOverlayOnActive();
        }

        let scrollThrottle;
        $(window).on('scroll', function () {
            if (!scrollThrottle) {
                scrollThrottle = setTimeout(function () {
                    updateActiveNavOnScroll();
                    scrollThrottle = null;
                }, 100);
            }
        });

        $('.nav-list a[data-nav="work"]').on('click', function () {
            $('.nav-list a, .logo').removeClass('active');
            $(this).addClass('active');
            positionOverlayOnActive();
        });

        $('.logo').on('click', function () {
            $('.nav-list a').removeClass('active');
            $(this).addClass('active');
            positionOverlayOnActive();
        });

        updateActiveNavOnScroll();
    }
});