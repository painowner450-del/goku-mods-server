/**
 * security.js — High-Security Anti-Debugging, DevTools Wipedown & Intrusion Prevention
 *
 * Runs instantly on script load (Line 1).
 * Detects if DevTools is open prior to navigation or opened during session.
 * Wipes client memory, clears console logs, and redirects to login.html.
 */

(function () {
    'use strict';

    let revoked = false;

    function handleIntrusion() {
        if (revoked) return;
        revoked = true;

        // 1. Wipe out console logs, network trace logs, and disable console
        try {
            console.clear();
            const dummy = function () {};
            console.log = dummy;
            console.warn = dummy;
            console.error = dummy;
            console.info = dummy;
            console.table = dummy;
            console.dir = dummy;
        } catch (e) {}

        // 2. Clear client session memory
        try {
            sessionStorage.clear();
            // Wipe out DOM tree immediately
            if (document.documentElement) {
                document.documentElement.innerHTML = '<head><title>Access Denied</title></head><body style="background:#06070d;color:#ff5a5f;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;font-weight:bold;font-size:18px;">[SECURITY BREACH DETECTED] Session Terminated. Security Intrusion Blocked.</body>';
            }
        } catch (e) {}

        // 3. Force immediate location replace to login.html
        setTimeout(function () {
            window.location.replace('login.html?r=security');
        }, 100);
    }

    // ── 1. Immediate Line-1 DevTools Timing Trap ────────────────────
    function timingCheck() {
        const tStart = performance.now();
        (function () {}).constructor('debugger')();
        const tEnd = performance.now();

        if (tEnd - tStart > 80) {
            handleIntrusion();
        }
    }

    // Run timing check immediately on load
    timingCheck();
    setInterval(timingCheck, 120);

    // ── 2. Console Getter / Inspector Trap ──────────────────────────
    const detector = new Image();
    Object.defineProperty(detector, 'id', {
        get: function () {
            handleIntrusion();
        }
    });

    setInterval(function () {
        console.log('%c', detector);
        console.clear();
    }, 450);

    // ── 3. Window Geometry & Docking Inspector ──────────────────────
    function checkGeometry() {
        const widthDiff  = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        if (widthDiff > 160 || heightDiff > 160) {
            handleIntrusion();
        }
    }

    checkGeometry();
    window.addEventListener('resize', checkGeometry);

    // ── 4. Keyboard Shortcuts & Context Menu Lockdown ──────────────
    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 123) { // F12
            e.preventDefault();
            handleIntrusion();
            return false;
        }
        if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) { // Ctrl+Shift+I/J/C
            e.preventDefault();
            handleIntrusion();
            return false;
        }
        if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83)) { // Ctrl+U, Ctrl+S
            e.preventDefault();
            handleIntrusion();
            return false;
        }
        if (e.metaKey && e.altKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            handleIntrusion();
            return false;
        }
    }, true);

    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    }, true);

    document.addEventListener('selectstart', function (e) {
        if (e.target && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });

})();
