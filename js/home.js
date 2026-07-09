gsap.registerPlugin(ScrollTrigger);

// ===================================
// GSAP Animations for Index Page

if ($('.hero').length) {



    gsap.to('.hero-title', {
            duration: 2.5,
            opacity: 1, 
            y: -20,
            scrambleText: {
                text: "Susanna Boberg",
                chars: "lowerCase",
                revealDelay: 0.2,
                speed: 1.5
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
    })

    gsap.to('.scroll-down-section', {
        opacity: 0.7,
        duration: 0.8,
        delay: 3.1,
        y: -20
    })

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

        gsap.set(letters, { x: window.innerWidth, opacity: 0 }); //start letters hidden

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
