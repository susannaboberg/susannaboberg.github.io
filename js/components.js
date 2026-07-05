// Injects shared nav and footer, then fires a custom event so
// script.js knows the DOM is ready to wire up.

(async function () {
    const page = document.body.dataset.page ?? '';
    const mode = document.body.dataset.mode ?? ''; // set on case-study pages: side-scribble, time-freeze, williams

    async function inject(selector, url) {
        const el = document.querySelector(selector);
        if (!el) return;
        try {
            const html = await fetch(url).then(r => r.text());
            el.innerHTML = html;
        } catch (e) {
            console.warn('Could not load partial:', url, e);
        }
    }

    await Promise.all([
        inject('#nav-placeholder',    '/partials/nav.html'),
        inject('#footer-placeholder', '/partials/footer.html'),
    ]);

    // Mark the correct nav link active based on data-page="home|about|art"
    // (index.html handles "work" itself via scroll position — see script.js).
    // Case-study pages set data-mode instead of data-page and should have
    // no nav item or logo highlighted at all.
    const navMap = {
        about: '[data-nav="about"]',
        art: '[data-nav="art"]',
    };

    if (mode) {
        // Case study page — leave nav neutral.
    } else if (navMap[page]) {
        document.querySelector(navMap[page])?.classList.add('active');
    } else {
        document.querySelector('#logo')?.classList.add('active');
    }

    document.dispatchEvent(new Event('components:ready'));
})();

// utils.js — shared glass-pill overlay helpers
// Load this AFTER components.js and BEFORE nav.js / about.js.

// Moves `overlay` to sit exactly on top of `target`, relative to `container`.
function positionOverlay(overlay, target, container) {
    if (!overlay || !target || !container) return;

    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    overlay.style.left = (targetRect.left - containerRect.left) + 'px';
    overlay.style.top = (targetRect.top - containerRect.top) + 'px';
    overlay.style.width = targetRect.width + 'px';
    overlay.style.height = targetRect.height + 'px';
    overlay.style.opacity = '1';
}

function hideOverlay(overlay) {
    if (!overlay) return;
    overlay.style.opacity = '0';
}

// Wires up hover-follow behavior for a group of items sharing one sliding
// glass-pill overlay.
//
// container         — element the overlay's position is measured relative to
// items             — array of elements that should attract the overlay on hover
// overlay           — the .pill-overlay element being moved
// getActiveTarget()  — optional. Returns the element to snap back to on
//                      mouseleave (e.g. the current active nav link), or
//                      null/undefined to just hide the overlay instead.
//
// Returns a `reposition()` function you can call manually (e.g. after
// scroll/resize, or after active state changes) to re-sync the overlay
// without needing a hover event.
function initPillHoverOverlay({ container, items, overlay, getActiveTarget }) {
    if (!container || !overlay) return () => {};

    function snapToActiveOrHide() {
        const activeTarget = getActiveTarget ? getActiveTarget() : null;
        if (activeTarget) {
            positionOverlay(overlay, activeTarget, container);
        } else {
            hideOverlay(overlay);
        }
    }

    items.forEach((item) => {
        item.addEventListener('mouseover', () => {
            positionOverlay(overlay, item, container);
        });
    });

    container.addEventListener('mouseleave', snapToActiveOrHide);

    return snapToActiveOrHide;
}