// ===================================
// GSAP ScrollTrigger

gsap.registerPlugin(ScrollTrigger);

// ===================================
// Navigation Overlay

const overlay = document.querySelector('.nav-list .overlay');
const logoOverlay = document.querySelector('.logo-overlay');
const nav_list = document.querySelectorAll('.nav-list ul li');
const nav_list_container = document.querySelector('.nav-list');
const logo_wrapper = document.querySelector('.logo-wrapper');
const logo = document.querySelector('.logo');

function positionOverlayOnActive() {
    if (logo.classList.contains('active')) {
        const logoRect = logo.getBoundingClientRect();
        const wrapperRect = logo_wrapper.getBoundingClientRect();

        logoOverlay.style.right = '3px';
        logoOverlay.style.top = (logoRect.top - wrapperRect.top) + 'px';
        logoOverlay.style.height = logoRect.height + 'px';
        logoOverlay.style.width = logoRect.width + 'px';
        logoOverlay.style.opacity = '1';

        overlay.style.opacity = '0';
    } else {
        const activeNavLink = document.querySelector('.nav-list a.active');

        if (activeNavLink) {
            const linkRect = activeNavLink.getBoundingClientRect();
            const containerRect = nav_list_container.getBoundingClientRect();

            overlay.style.left = (linkRect.left - containerRect.left) + 'px';
            overlay.style.top = (linkRect.top - containerRect.top) + 'px';
            overlay.style.height = linkRect.height + 'px';
            overlay.style.width = linkRect.width + 'px';
            overlay.style.opacity = '1';

            logoOverlay.style.opacity = '0';
        } else {
            overlay.style.opacity = '0';
            logoOverlay.style.opacity = '0';
        }
    }
}

positionOverlayOnActive();

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

        logoOverlay.style.opacity = '0';
    });
});

logo.addEventListener('mouseenter', () => {
    overlay.style.opacity = '0';

    const logoRect = logo.getBoundingClientRect();
    const wrapperRect = logo_wrapper.getBoundingClientRect();

    logoOverlay.style.right = '3px';
    logoOverlay.style.top = (logoRect.top - wrapperRect.top) + 'px';
    logoOverlay.style.height = logoRect.height + 'px';
    logoOverlay.style.width = logoRect.width + 'px';
    logoOverlay.style.opacity = '1';
});

logo.addEventListener('mouseleave', () => {
    overlay.classList.remove('active');
    logoOverlay.classList.remove('active');
    positionOverlayOnActive();
});

nav_list_container.addEventListener('mouseleave', () => {
    overlay.classList.remove('active');
    logoOverlay.classList.remove('active');
    positionOverlayOnActive();
});

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

navLinks.find('a').on('click', function() {
    mobileMenuToggle.removeClass('active');
    navLinks.removeClass('active');
    mobileMenuToggle.attr('aria-expanded', 'false');
    $('body').css('overflow', '');
});


// ===================================
// GSAP Animations for Index Page

if ($('.hero').length) {
    gsap.to('.hero-title', {
        opacity: 1,
        y: -20,
        duration: 0.8,
        delay: 0.2
    });

    gsap.to('.hero-title', {
        duration: 2.5,
        scrambleText: {
            text: "Susanna Jinyong Boberg",
            chars: "lowerCase",
            revealDelay: 1,
            speed: 0.8
        }
    });

    gsap.to('.hero-description', {
        opacity: 1,
        y: -20,
        duration: 0.8,
        delay: 2.5
    });

    gsap.to('.words-container', {
        opacity: 1,
        duration: 0.8,
        delay: 3.1
    });

    gsap.to('.scroll-down-section', {
        opacity: 0.7,
        duration: 0.8,
        delay: 3.1,
        y: -20
    });


}


// ===================================
// Typewriter & Scramble Animations

if ($('.hero').length && $('.words-container').length) {
    const words = [
        " design",
        "  Deutsch",
        " programming languages",
        " français",
        " music",
        " storytelling"
    ];

    const scrollWords = [
        "Scroll to see works",
        "Scrollen, um Arbeiten zu sehen",
        "while (scrolling) {show(works);}",
        "Faites défiler pour voir les projets",
        "coda below",
        "chapter 2 below"
    ];

    let currentWordIndex = 0;
    const container = document.querySelector('.words-container');
    const scrollTextElement = document.querySelector('.scroll-down-text');
    const scrollDownSection = document.querySelector('.scroll-down-section');

    const typingSpan = document.createElement('span');
    typingSpan.className = 'typing-word';
    container.innerHTML = '';
    container.appendChild(typingSpan);

    function synchronizedLoop() {
        const currentWord = words[currentWordIndex];
        const scrollWord = scrollWords[currentWordIndex];

        const typeOutDuration = currentWord.length * 0.09;
        const pauseDuration = 1.8;
        const deleteInDuration = currentWord.length * 0.06;
        const shortPauseDuration = 0.8;

        const typewriterTL = gsap.timeline({
            onComplete: () => {
                currentWordIndex = (currentWordIndex + 1) % words.length;
                synchronizedLoop();
            }
        });

        typewriterTL.to(typingSpan, {
            duration: typeOutDuration,
            text: {
                value: currentWord,
                delimiter: ""
            },
            ease: "none"
        });

        typewriterTL.to({}, { duration: pauseDuration });

        typewriterTL.to(typingSpan, {
            duration: deleteInDuration,
            text: {
                value: "",
                delimiter: ""
            },
            ease: "none"
        });

        typewriterTL.to({}, { duration: shortPauseDuration });

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

    gsap.delayedCall(3.8, synchronizedLoop);

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

// ===================================
// Works Title: Letter-by-letter slide-in, reversible, gated until layout is stable

if ($('.work-section-title').length) {
    const titleEl = document.querySelector('.work-section-title');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 768;

    // Hide immediately via inline style — prevents any flash of the
    // plain, unsplit "Works" text while fonts/images are still loading
    gsap.set(titleEl, { opacity: 0 });

    function initWorksTitle() {
        if (prefersReducedMotion || isMobile) {
            gsap.set(titleEl, { opacity: 1 });
            return;
        }

        const text = titleEl.textContent;
        titleEl.innerHTML = '';
        titleEl.setAttribute('aria-label', text);
        const letters = text.split('').map(char => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.setAttribute('aria-hidden', 'true');
            titleEl.appendChild(span);
            return span;
        });

        gsap.set(titleEl, { opacity: 1 }); // parent visible now; letters control their own reveal

        gsap.fromTo(letters,
            { x: () => window.innerWidth, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                stagger: 0.03,
                ease: 'power1.out',
                scrollTrigger: {
                    trigger: titleEl,
                    start: 'top 100%',
                    end: 'top 20%',
                    scrub: 1,
                    invalidateOnRefresh: true,
                    id: 'worksTitle'
                }
            }
        );

                // Replace the existing card ScrollTrigger block with this:
        gsap.set('.work-card', { opacity: 0, y: 20 });
        gsap.to('.work-card', {
            opacity: 1,
            y: 0,
            ease: 'power1.out',
            scrollTrigger: {
                trigger: titleEl,
                start: 'top 35%',   // starts earlier, while title is still sliding in
                end: 'top 5%',    // ends after title has fully passed — cards finish fading after title centers
                scrub: 1,
            }
        });
    }

    // Wait for full page load (images) AND web fonts before ever measuring —
    // this is what actually prevents the flash/reset, rather than
    // creating early and refreshing afterward.
    Promise.all([
    new Promise(resolve => {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', resolve, { once: true });
    }),
    document.fonts.ready
    ]).then(() => {
        // Double rAF: first frame queues the work, second frame runs after
        // the browser has actually painted — layout is fully settled by then
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                initWorksTitle();
                ScrollTrigger.refresh(true); // true = immediate, not deferred
            });
        });
    });
}



// ===================================
// Case Study Page: Text Highlight Animation

if ($('.case-study-page').length) {

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
// Case Study On Page Load Animations

if ($('.case-study-page').length) {
    gsap.fromTo('.case-study-hero', {
        opacity: 0,
        y: 20,
    }, {opacity: 1, y: 0, duration: 0.6, delay: 0.7});

    gsap.fromTo('.case-study-meta', {
        opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.6, delay: 0.7});
}

// ===================================
// Case Study Page Side Navigation

if ($('.page-nav').length) {
    const pageNav = $('.page-nav');
    const overviewSection = $('#overview');

    function toggleNavVisibility() {
        if (overviewSection.length) {
            const overviewTop = overviewSection.offset().top;
            const scrollPos = $(window).scrollTop();
            const navHeight = $('.navbar').outerHeight();

            if (scrollPos >= (overviewTop - navHeight - 100)) {
                pageNav.addClass('visible');
            } else {
                pageNav.removeClass('visible');
            }
        }
    }

    $(window).on('scroll', toggleNavVisibility);
    toggleNavVisibility();
    const sections = $('.case-study-section, .case-study-hero');
    const navSections = $('.nav-section');
    const progressLineActive = $('.progress-line-active');

    let currentProgress = 0;
    let targetProgress = 0;

    function updateActiveNav() {
        const scrollPosition = $(window).scrollTop() + 150;
        let currentSection = '';

        sections.each(function() {
            const sectionTop = $(this).offset().top;
            const sectionHeight = $(this).outerHeight();
            const sectionId = $(this).attr('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = sectionId;
            }
        });

        navSections.each(function() {
            const $navSection = $(this);
            const mainLink = $navSection.find('> a');
            const subsections = $navSection.find('.nav-subsections');
            const mainHref = mainLink.attr('href').substring(1);

            mainLink.removeClass('active');

            if (mainHref === currentSection) {
                mainLink.addClass('active');
                $navSection.addClass('active');
            } else if (subsections.length) {
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

                if (hasActiveSubsection) {
                    $navSection.addClass('active');
                } else {
                    $navSection.removeClass('active');
                }
            } else {
                $navSection.removeClass('active');
            }
        });

        const activeLink = $('.page-nav-links a.active').first();
        if (activeLink.length) {
            const linkPosition = activeLink.position().top;
            const containerHeight = $('.page-nav-content').outerHeight();
            targetProgress = Math.min((linkPosition / containerHeight) * 100, 100);
        }
    }

    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    function animateProgressLine() {
        currentProgress = lerp(currentProgress, targetProgress, 0.1);
        progressLineActive.attr('y2', currentProgress + '%');
        requestAnimationFrame(animateProgressLine);
    }

    animateProgressLine();

    $(window).on('scroll', updateActiveNav);
    updateActiveNav();
}

// ===================================
// Page Nav Mobile Toggle

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

    pageNavToggle.on('click', function(e) {
        e.stopPropagation();
        const isOpen = $('.page-nav').hasClass('mobile-open');
        $('.page-nav').toggleClass('mobile-open');
        $(this).toggleClass('active');
        $(this).attr('aria-expanded', !isOpen);
    });

    $('.page-nav-links a').on('click', function() {
        if ($(window).width() <= 1024) {
            $('.page-nav').removeClass('mobile-open');
            pageNavToggle.removeClass('active');
            pageNavToggle.attr('aria-expanded', 'false');
        }
    });

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

    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(checkScreenSize, 150);
    });

    let scrollTimer;
    let isScrollingPageNav = false;
    $(window).on('scroll', function() {
        if (!isScrollingPageNav) {
            window.requestAnimationFrame(function() {
                checkScreenSize();
                isScrollingPageNav = false;
            });
            isScrollingPageNav = true;
        }
    });

    checkScreenSize();
}

// ===================================
// Back to Top Button

if ($('.case-study-page').length) {
    const backToTop = $('<button>', {
        class: 'back-to-top',
        'aria-label': 'Back to top',
        html: '<svg viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    });

    $('body').append(backToTop);

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

    backToTop.on('click', function() {
        $('html, body').animate({
            scrollTop: 0
        }, 200, 'linear');
    });
}

// ===================================
// Solutions Dropdown Functionality

$('.dropdown-trigger').on('click', function() {
    const isExpanded = $(this).attr('aria-expanded') === 'true';
    $(this).attr('aria-expanded', !isExpanded);
});

// ===================================
// Smooth Scroll for Anchor Links

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
            $('.nav-list a[href="#work"]').addClass('active');
        } else {
            $('.logo').addClass('active');
        }

        positionOverlayOnActive();
    }

    let scrollThrottle;
    $(window).on('scroll', function() {
        if (!scrollThrottle) {
            scrollThrottle = setTimeout(function() {
                updateActiveNavOnScroll();
                scrollThrottle = null;
            }, 100);
        }
    });

    $('.nav-list a[href="#work"]').on('click', function() {
        $('.nav-list a, .logo').removeClass('active');
        $(this).addClass('active');
        positionOverlayOnActive();
    });

    $('.logo').on('click', function() {
        $('.nav-list a').removeClass('active');
        $(this).addClass('active');
        positionOverlayOnActive();
    });

    updateActiveNavOnScroll();
}

// ===================================
// About Page: Simple Fade-in Animations

if ($('.about-hero').length) {
    gsap.to('.about-text', {
        opacity: 1,
        y: -20,
        duration: 0.8,
        delay: 0.2
    });

    gsap.to('.about-image-placeholder', {
        opacity: 1,
        y: -20,
        duration: 0.8,
        delay: 0.2
    });

    gsap.to('.social-slider-section', {
        opacity: 1,
        y: -20,
        duration: 0.8,
        delay: 0.2
    });
}

// ===================================
// Socials Slider Overlay Logic (About Page)

if ($('.social-slider').length) {
    const socialOverlay = document.querySelector('.social-overlay');
    const socialSlider = document.querySelector('.social-slider');
    const socialItems = document.querySelectorAll('.social-slider ul li');

    const socialCopiedCursor = $('<div>', {
        class: 'custom-cursor social-copied-cursor',
        text: 'Copied!'
    });
    $('body').append(socialCopiedCursor);

    function updateOverlayPosition(link) {
        const linkRect = link.getBoundingClientRect();
        const sliderRect = socialSlider.getBoundingClientRect();

        socialOverlay.style.opacity = '1';
        socialOverlay.style.left = (linkRect.left - sliderRect.left) + 'px';
        socialOverlay.style.top = (linkRect.top - sliderRect.top) + 'px';
        socialOverlay.style.height = linkRect.height + 'px';
        socialOverlay.style.width = linkRect.width + 'px';
    }

    socialItems.forEach((item) => {
        const link = item.querySelector('a, button');

        item.addEventListener('mouseover', () => {
            updateOverlayPosition(link);
        });

        link.addEventListener('mousedown', () => {
            socialSlider.classList.add('pressed');
        });

        link.addEventListener('mouseup', () => {
            socialSlider.classList.remove('pressed');
        });

        link.addEventListener('mouseleave', () => {
            socialSlider.classList.remove('pressed');
        });
    });

    socialSlider.addEventListener('mouseleave', () => {
        socialOverlay.style.opacity = '0';
        socialSlider.classList.remove('pressed');
    });

    const copyBtn2 = document.getElementById('copyEmailBtn2');
    if (copyBtn2) {
        let isHovering = false;

        copyBtn2.addEventListener('mouseenter', () => {
            isHovering = true;
        });

        copyBtn2.addEventListener('mouseleave', () => {
            isHovering = false;
        });

        let mouseX = 0;
        let mouseY = 0;

        $(document).on('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (socialCopiedCursor.hasClass('active')) {
                socialCopiedCursor.css({
                    left: mouseX + 15 + 'px',
                    top: mouseY + 15 + 'px'
                });
            }
        });

        copyBtn2.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText('sjb5@williams.edu');

                $('.custom-cursor.gallery-cursor').removeClass('active');
                socialCopiedCursor.addClass('active');
                socialCopiedCursor.css({
                    left: mouseX + 15 + 'px',
                    top: mouseY + 15 + 'px'
                });

                if (isHovering) {
                    setTimeout(() => {
                        updateOverlayPosition(copyBtn2);
                    }, 10);
                }

                setTimeout(() => {
                    socialCopiedCursor.removeClass('active');

                    if (isHovering) {
                        setTimeout(() => {
                            updateOverlayPosition(copyBtn2);
                        }, 10);
                    }
                }, 1000);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        });
    }
}

// ===================================
// Photo Gallery Lightbox Functionality
// ===================================
if ($('.gallery-section').length) {
    const lightbox = $('#galleryLightbox');
    const lightboxImage = $('#lightboxImage');
    const lightboxCaption = $('#lightboxCaption');
    const closeBtn = $('.lightbox-close');

    const galleryCursor = $('<div>', {
        class: 'custom-cursor gallery-cursor'
    });
    $('body').append(galleryCursor);

    $('.gallery-item').on('mouseenter', function() {
        if ($('.custom-cursor.email-copied-cursor, .custom-cursor.social-copied-cursor').hasClass('active')) {
            return;
        }

        const cursorText = $(this).data('cursor-text') || 'View Photo';
        galleryCursor.text(cursorText);
        galleryCursor.addClass('active');
    });

    $('.gallery-item').on('mouseleave', function() {
        galleryCursor.removeClass('active');
    });

    $('.gallery-item').on('mousemove', function(e) {
        if ($('.custom-cursor.email-copied-cursor, .custom-cursor.social-copied-cursor').hasClass('active')) {
            return;
        }

        galleryCursor.css({
            left: e.clientX + 15 + 'px',
            top: e.clientY + 15 + 'px'
        });
    });

    $('.gallery-item').on('click', function() {
        const imgSrc = $(this).find('img').attr('src');
        const imgAlt = $(this).find('img').attr('alt');
        const caption = $(this).data('caption');

        lightboxImage.attr('src', imgSrc);
        lightboxImage.attr('alt', imgAlt);
        lightboxCaption.text(caption);

        lightbox.addClass('active');
        $('body').css('overflow', 'hidden');

        galleryCursor.removeClass('active');
    });

    closeBtn.on('click', function(e) {
        e.stopPropagation();
        closeLightbox();
    });

    lightbox.on('click', function(e) {
        if (e.target === this) {
            closeLightbox();
        }
    });

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.hasClass('active')) {
            closeLightbox();
        }
    });

    function closeLightbox() {
        lightbox.removeClass('active');
        $('body').css('overflow', '');
    }

    if (typeof gsap !== 'undefined') {
        gsap.utils.toArray('.gallery-item').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 30,
                duration: 0.6,
                delay: i * 0.05
            });
        });
    }
}

// ===================================
// Email Copy Cursor for Footer (About Page)
// ===================================
if ($('.footer-email').length && $('.about-hero').length) {
    const emailCopiedCursor = $('<div>', {
        class: 'custom-cursor email-copied-cursor',
        text: 'Copied!'
    });
    $('body').append(emailCopiedCursor);

    const copyButton = $('.footer-email');
    let mouseX = 0;
    let mouseY = 0;

    $(document).on('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (emailCopiedCursor.hasClass('active')) {
            emailCopiedCursor.css({
                left: mouseX + 15 + 'px',
                top: mouseY + 15 + 'px'
            });
        }
    });

    copyButton.on('click', async function() {
        try {
            await navigator.clipboard.writeText('sjb5@williams.edu');

            $('.custom-cursor.gallery-cursor').removeClass('active');

            emailCopiedCursor.addClass('active');
            emailCopiedCursor.css({
                left: mouseX + 15 + 'px',
                top: mouseY + 15 + 'px'
            });

            setTimeout(() => {
                emailCopiedCursor.removeClass('active');
            }, 1000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    });
}

// ===================================
// Intersection Observer for Simple Animations

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