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

// color-picker.js — lets the user choose a custom hue for all glass-pill
// overlays (nav, logo, social slider, custom cursors). Persists via
// localStorage, which is shared across every page on the same domain, so the
// choice carries over automatically without any server-side storage.

(function () {
    const STORAGE_KEY = 'siteAccentColor';
    const DEFAULT_HUE = 320;        // roughly matches the original pink
    const DEFAULT_SATURATION = 70;
    const root = document.documentElement;

    // ===================================
    // Color format conversion (for the hex/rgb/hsl cycling display)

    function hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const k = (n) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
    }

    function rgbToHex([r, g, b]) {
        return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    // Fixed lightness (58%) matches --accent-solid, so the displayed value
    // corresponds to the same "representative" solid color used elsewhere.
    const COLOR_FORMATS = [
        {
            label: 'HEX',
            format: (h, s) => rgbToHex(hslToRgb(h, Math.max(60, s), 58)),
        },
        {
            label: 'RGB',
            format: (h, s) => {
                const [r, g, b] = hslToRgb(h, Math.max(60, s), 58);
                return `rgb(${r}, ${g}, ${b})`;
            },
        },
        {
            label: 'HSL',
            format: (h, s) => `hsl(${Math.round(h)}, ${Math.max(60, Math.round(s))}%, 58%)`,
        },
    ];

    let formatIndex = 0;
    let currentHue = DEFAULT_HUE;
    let currentSaturation = DEFAULT_SATURATION;

    function updateColorValueDisplay() {
        const textEl = document.querySelector('.color-value-text');
        if (!textEl) return;
        textEl.textContent = COLOR_FORMATS[formatIndex].format(currentHue, currentSaturation);
    }

    function buildGradients(hue, saturation) {
        const s = Math.max(20, Math.min(100, saturation));
        return {
            grad: `linear-gradient(hsla(${hue}, ${s}%, 40%, 0.6), hsla(${hue}, ${s}%, 78%, 0.6))`,
            gradStrong: `linear-gradient(hsla(${hue}, ${s}%, 40%, 0.9), hsla(${hue}, ${s}%, 78%, 0.9))`,
        };
    }

    function applyColor(hue, saturation) {
        currentHue = hue;
        currentSaturation = saturation;

        const { grad, gradStrong } = buildGradients(hue, saturation);
        root.style.setProperty('--overlay-grad', grad);
        root.style.setProperty('--overlay-grad-strong', gradStrong);

        // A related-but-distinct solid color (underline, scroll arrow) —
        // same hue, but a flat opaque color rather than a two-stop gradient.
        const s = Math.max(60, saturation);
        root.style.setProperty('--accent-solid', `hsla(${hue}, ${s}%, 58%, 1)`);
        // Darker variant — used for the color-picker button's hover/active
        // state. Kept close to accent-solid's lightness for a subtle shift.
        root.style.setProperty('--accent-solid-dark', `hsla(${hue}, ${s}%, 48%, 0.15)`);

        updateColorValueDisplay();
    }

    function readSaved() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY));
        } catch (e) {
            return null;
        }
    }

    // Always apply a color immediately — saved or default — before nav.html
    // has even been fetched, so every dependent variable (gradient, outline,
    // accent-solid) is in sync from the very first paint, with no flash.
    const saved = readSaved();
    const initialHue = saved?.hue ?? DEFAULT_HUE;
    const initialSaturation = saved?.saturation ?? DEFAULT_SATURATION;
    applyColor(initialHue, initialSaturation);

    document.addEventListener('components:ready', () => {
        const btn = document.querySelector('.color-picker-btn');
        const panel = document.querySelector('.color-picker-panel');
        const wheel = document.querySelector('.color-wheel');
        const knob = document.querySelector('.color-wheel-knob');
        const resetBtn = document.querySelector('.color-picker-reset');

        if (!btn || !panel || !wheel || !knob) return;

        // The wheel is drawn with `conic-gradient(from 90deg, ...)`, which
        // rotates red to the 3-o'clock position instead of straight up.
        // "Bearing" = raw angle from top (clockwise), used purely for
        // placing the knob. "Hue" = actual color hue, offset by -90deg
        // from bearing to match where that color really sits on the wheel.
        function hueToBearing(hue) {
            return (hue + 90) % 360;
        }

        function setKnobFromHueSat(hue, saturation) {
            const radius = wheel.getBoundingClientRect().width / 2;
            const dist = (Math.min(saturation, 100) / 100) * radius;
            const bearingRad = (hueToBearing(hue) * Math.PI) / 180;
            knob.style.left = (radius + Math.sin(bearingRad) * dist) + 'px';
            knob.style.top = (radius - Math.cos(bearingRad) * dist) + 'px';
        }

        setKnobFromHueSat(initialHue, initialSaturation);
        updateColorValueDisplay();

        document.querySelectorAll('.color-format-arrow').forEach((arrowBtn) => {
            arrowBtn.addEventListener('click', () => {
                const dir = parseInt(arrowBtn.dataset.dir, 10);
                formatIndex = (formatIndex + dir + COLOR_FORMATS.length) % COLOR_FORMATS.length;
                updateColorValueDisplay();
            });
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = panel.classList.toggle('open');
            btn.classList.toggle('active', isOpen);
            btn.setAttribute('aria-expanded', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && e.target !== btn) {
                panel.classList.remove('open');
                btn.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
            }
        });

        function pickColorFromEvent(e) {
            const rect = wheel.getBoundingClientRect();
            const radius = rect.width / 2;
            const cx = rect.left + radius;
            const cy = rect.top + radius;

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const dx = clientX - cx;
            const dy = clientY - cy;
            const dist = Math.min(Math.sqrt(dx * dx + dy * dy), radius);

            // Raw bearing: 0deg = straight up, increasing clockwise.
            let bearing = (Math.atan2(dx, -dy) * 180) / Math.PI;
            if (bearing < 0) bearing += 360;

            // Convert to actual color hue — undoes the wheel's 90deg
            // rotation so the picked hue matches the color under the cursor.
            const hue = (bearing - 90 + 360) % 360;
            const saturation = (dist / radius) * 100;

            applyColor(hue, saturation);
            setKnobFromHueSat(hue, saturation);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ hue, saturation }));
        }

        let isDragging = false;

        wheel.addEventListener('mousedown', (e) => { isDragging = true; pickColorFromEvent(e); });
        window.addEventListener('mousemove', (e) => { if (isDragging) pickColorFromEvent(e); });
        window.addEventListener('mouseup', () => { isDragging = false; });

        wheel.addEventListener('touchstart', (e) => { isDragging = true; pickColorFromEvent(e); });
        wheel.addEventListener('touchmove', (e) => { if (isDragging) pickColorFromEvent(e); });
        window.addEventListener('touchend', () => { isDragging = false; });

        resetBtn.addEventListener('click', () => {
            applyColor(DEFAULT_HUE, DEFAULT_SATURATION);
            localStorage.removeItem(STORAGE_KEY);
            setKnobFromHueSat(DEFAULT_HUE, DEFAULT_SATURATION);
        });
    });
})();