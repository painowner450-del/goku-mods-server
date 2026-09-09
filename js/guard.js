/* 
 * STATIC HTML GUARD
 * Acts as a pre-render execution barrier equivalent to PHP session guards.
 * Deletes DOM and redirects instantly if unauthorized.
 */

(function() {
    // Extract filename from current URL
    const path = window.location.pathname;
    const filename = path.split('/').pop().toLowerCase();

    // 0. Enforce Official APK Environment (Block external browsers & stripped WebViews)
    if (filename && filename !== 'login.html') {
        if (!window.AndroidNative || typeof window.AndroidNative.getDeviceFingerprint !== 'function' || navigator.userAgent.indexOf('BN-ELITE-APK') === -1) {
            enforceBlock("Security Violation: Must execute inside official GOKU ELITE APK.");
            return;
        }
    }

    // Immediate execution before DOM is fully constructed
    const token = sessionStorage.getItem('bn_session_token');
    const localKey = localStorage.getItem('bnkey');
    const userPlan = localStorage.getItem('bn_plan');

    // 1. Session Existence Check
    if (!token || !localKey || !userPlan) {
        enforceBlock("Missing Session. Please Login.");
        return;
    }

    try {
        // 2. Decode Session Token & Validate Integrity
        const payload = JSON.parse(atob(token));
        
        if (payload.key !== localKey || payload.plan !== userPlan) {
            enforceBlock("Session Tampering Detected.");
            return;
        }

        // Native APK Hardware Fingerprint Verification (SecurityManager.java)
        if (window.AndroidNative && typeof window.AndroidNative.getDeviceFingerprint === 'function') {
            const currentFp = window.AndroidNative.getDeviceFingerprint();
            if (payload.serial && payload.serial !== currentFp) {
                enforceBlock("Device Mismatch: Hardware Serial Violation.");
                return;
            }
        }

        // 3. Optional: Session Expiry (e.g., 24 hours)
        if (Date.now() - payload.ts > 86400000) {
            enforceBlock("Session Expired.");
            return;
        }

        // 4. Plan-Based Route Protection
        // Extract filename from current URL
        const path = window.location.pathname;
        const filename = path.split('/').pop().toLowerCase();

        // If not on login page, enforce plan logic
        if (filename && filename !== 'login.html') {
            const allowed = isPageAllowed(filename, userPlan);
            if (!allowed) {
                enforceBlock("Plan Privilege Violation: " + userPlan + " cannot access " + filename);
            }
        }

    } catch (e) {
        enforceBlock("Corrupted Session.");
    }

    function enforceBlock(reason) {
        // Obliterate the DOM instantly so nothing renders
        document.documentElement.innerHTML = '<body style="background:#000;"></body>';
        
        // Wipe all storage
        sessionStorage.clear();
        localStorage.clear();
        document.cookie = "bn_auth_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Redirect
        window.location.replace('login.html?r=' + encodeURIComponent(reason));
        
        // Throw error to halt any further script execution
        throw new Error("GUARD_TRIGGERED: " + reason);
    }

    function isPageAllowed(file, plan) {
        // Public pages (always allowed if logged in)
        if (file === 'home.html' || file === 'ehome.html' || file === '') return true;

        const accessMap = {
            'STARTER': ['wingo_1m.html'],
            'PLUS': ['wingo_1m.html', 'wingo_30s.html', 'k3_1m.html'],
            'PRO': ['wingo_1m.html', 'wingo_30s.html', 'k3_1m.html', 'trx_1m.html'],
            'ELITE': ['wingo_1m.html', 'wingo_30s.html', 'k3_1m.html', 'trx_1m.html', 'ewingo_1m.html', 'etrx_1m.html']
        };

        const allowedFiles = accessMap[plan] || [];
        return allowedFiles.includes(file);
    }
})();
