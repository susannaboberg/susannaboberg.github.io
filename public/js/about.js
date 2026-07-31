// about.js — about-page fades, social slider glass-pill, footer email copy.
// Requires: components.js, utils.js (positionOverlay, hideOverlay,
// initPillHoverOverlay). Only runs its guarded blocks on pages that have the
// relevant markup.

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
// Social Slider Glass-Pill (About Page)

if ($('.social-slider').length) {
    const socialSlider = document.querySelector('.social-slider');
    const socialOverlay = socialSlider.querySelector('.pill-overlay');
    const socialItems = Array.from(
        document.querySelectorAll('.social-slider ul li a, .social-slider ul li button')
    );

    // Hover-follow; no getActiveTarget passed, so it just hides on
    // mouseleave (there's no persistent "active" social link).
    initPillHoverOverlay({
        container: socialSlider,
        items: socialItems,
        overlay: socialOverlay,
    });

    // Press effect — unrelated to overlay positioning, kept separate.
    socialItems.forEach((link) => {
        link.addEventListener('mousedown', () => socialSlider.classList.add('pressed'));
        link.addEventListener('mouseup', () => socialSlider.classList.remove('pressed'));
        link.addEventListener('mouseleave', () => socialSlider.classList.remove('pressed'));
    });

    // ===================================
    // Email Copy (social slider "Email" button)

    const copyBtn2 = document.getElementById('copyEmailBtn2');
    if (copyBtn2) {
        const socialCopiedCursor = $('<div>', {
            class: 'custom-cursor social-copied-cursor',
            text: 'Copied!'
        });
        $('body').append(socialCopiedCursor);

        let isHovering = false;
        copyBtn2.addEventListener('mouseenter', () => { isHovering = true; });
        copyBtn2.addEventListener('mouseleave', () => { isHovering = false; });

        let mouseX = 0;
        let mouseY = 0;

        $(document).on('mousemove', function (e) {
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

                // Button text may change size when "Copied!" state shows —
                // re-sync the pill overlay to match, since this isn't a
                // hover event the shared helper would catch automatically.
                if (isHovering) {
                    setTimeout(() => positionOverlay(socialOverlay, copyBtn2, socialSlider), 10);
                }

                setTimeout(() => {
                    socialCopiedCursor.removeClass('active');

                    if (isHovering) {
                        setTimeout(() => positionOverlay(socialOverlay, copyBtn2, socialSlider), 10);
                    }
                }, 1000);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        });
    }
}

// ===================================
// Email Copy Cursor for Footer (About Page)

if ($('.footer-email').length && $('.about-hero').length) {
    const emailCopiedCursor = $('<div>', {
        class: 'custom-cursor email-copied-cursor',
        text: 'Copied!'
    });
    $('body').append(emailCopiedCursor);

    const copyButton = $('.footer-email');
    let mouseX = 0;
    let mouseY = 0;

    $(document).on('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (emailCopiedCursor.hasClass('active')) {
            emailCopiedCursor.css({
                left: mouseX + 15 + 'px',
                top: mouseY + 15 + 'px'
            });
        }
    });

    copyButton.on('click', async function () {
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