
gsap.registerPlugin(ScrollTrigger);

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

