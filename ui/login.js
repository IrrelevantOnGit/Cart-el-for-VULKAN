import {
    fetchSignInMethodsForEmail,
    sendPasswordResetEmail,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { applyRememberMePersistence, auth, db, isFirebaseConfigured } from "./firebase-config.js";
import { SessionManager } from "./auth-session.js";
import { formatOtpCountdown, requestOtp, verifyOtp } from "./otp-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const passwordToggle = document.getElementById("passwordToggle");
    const rememberMeInput = document.getElementById("rememberMe");

    const loginBtn = document.getElementById("loginBtn");
    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    const forgotPasswordLink = document.getElementById("forgotPasswordLink");
    const resetModalOverlay = document.getElementById("resetModalOverlay");
    const resetModalClose = document.getElementById("resetModalClose");
    const resetPasswordForm = document.getElementById("resetPasswordForm");
    const resetEmailInput = document.getElementById("resetEmailInput");
    const resetEmailError = document.getElementById("resetEmailError");
    const resetSuccessMessage = document.getElementById("resetSuccessMessage");

    const otpModeBtn = document.getElementById("otpModeBtn");
    const otpPanel = document.getElementById("otpPanel");
    const otpEmailInput = document.getElementById("otpEmailInput");
    const otpCodeInput = document.getElementById("otpCodeInput");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const verifyOtpBtn = document.getElementById("verifyOtpBtn");
    const otpEmailError = document.getElementById("otpEmailError");
    const otpCodeError = document.getElementById("otpCodeError");
    const otpTimer = document.getElementById("otpTimer");

    const ATTEMPT_KEY = "cartel_login_attempts";
    const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
    const MAX_ATTEMPTS = 5;

    let otpRequestId = null;
    let otpExpiresAtMs = 0;
    let otpInterval = null;

    if (window.CartelThemeToggle && typeof window.CartelThemeToggle.init === "function") {
        window.CartelThemeToggle.init();
    }

    SessionManager.attachAuthPageRedirect("dashboard.html");

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function setFieldError(el, msg) {
        if (!el) return;
        el.textContent = msg;
        el.classList.add("show");
    }

    function clearFieldError(el) {
        if (!el) return;
        el.classList.remove("show");
    }

    function showError(msg) {
        if (!errorMessage) return;
        errorMessage.textContent = msg;
        errorMessage.style.display = "flex";
    }

    function showSuccess(msg) {
        if (!successMessage) return;
        successMessage.textContent = msg;
        successMessage.style.display = "flex";
    }

    function clearMessages() {
        if (errorMessage) errorMessage.style.display = "none";
        if (successMessage) successMessage.style.display = "none";
    }

    function readAttempts() {
        try {
            return JSON.parse(localStorage.getItem(ATTEMPT_KEY) || "{}");
        } catch (_err) {
            return {};
        }
    }

    function writeAttempts(data) {
        localStorage.setItem(ATTEMPT_KEY, JSON.stringify(data));
    }

    function registerFailedAttempt() {
        const current = readAttempts();
        const now = Date.now();
        const base = now - Number(current.windowStart || now) > ATTEMPT_WINDOW_MS
            ? { count: 0, windowStart: now }
            : current;
        base.count = Number(base.count || 0) + 1;
        writeAttempts(base);
        return base.count;
    }

    function clearFailedAttempts() {
        localStorage.removeItem(ATTEMPT_KEY);
    }

    function isBlocked() {
        const current = readAttempts();
        if (!current.windowStart) return false;
        if (Date.now() - Number(current.windowStart) > ATTEMPT_WINDOW_MS) {
            clearFailedAttempts();
            return false;
        }
        return Number(current.count || 0) >= MAX_ATTEMPTS;
    }

    function resetValidation() {
        [emailError, passwordError, otpEmailError, otpCodeError, resetEmailError].forEach(clearFieldError);
        clearMessages();
    }

    function toggleLoading(active) {
        loginBtn.disabled = active;
        loginBtn.classList.toggle("loading", active);
    }

    function toggleOtpPanel(show) {
        if (!otpPanel) return;
        otpPanel.style.display = show ? "block" : "none";
    }

    function startOtpCountdown() {
        stopOtpCountdown();
        otpInterval = window.setInterval(() => {
            if (!otpExpiresAtMs || Date.now() >= otpExpiresAtMs) {
                otpTimer.textContent = "OTP expired";
                stopOtpCountdown();
                return;
            }
            otpTimer.textContent = "OTP expires in " + formatOtpCountdown(otpExpiresAtMs);
        }, 1000);
    }

    function stopOtpCountdown() {
        if (otpInterval) {
            window.clearInterval(otpInterval);
            otpInterval = null;
        }
    }

    async function logLoginFailure(email, reason, method) {
        try {
            await addDoc(collection(db, "loginLogs"), {
                email,
                reason,
                method,
                success: false,
                createdAt: serverTimestamp()
            });
        } catch (_err) {
            // Best effort.
        }
    }

    function openResetModal() {
        if (!resetModalOverlay) return;
        resetModalOverlay.classList.add("show");
        resetModalOverlay.setAttribute("aria-hidden", "false");
        clearFieldError(resetEmailError);
        resetSuccessMessage.style.display = "none";
        resetPasswordForm.reset();
        setTimeout(() => resetEmailInput.focus(), 0);
    }

    function closeResetModal() {
        if (!resetModalOverlay) return;
        resetModalOverlay.classList.remove("show");
        resetModalOverlay.setAttribute("aria-hidden", "true");
    }

    if (passwordToggle) {
        passwordToggle.addEventListener("click", () => {
            const hidden = passwordInput.type === "password";
            passwordInput.type = hidden ? "text" : "password";
        });
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        resetValidation();

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        let valid = true;

        if (!email) {
            setFieldError(emailError, "Email is required");
            valid = false;
        } else if (!validateEmail(email)) {
            setFieldError(emailError, "Please enter a valid email address");
            valid = false;
        }

        if (!password) {
            setFieldError(passwordError, "Password is required");
            valid = false;
        }

        if (!valid) return;

        if (!isFirebaseConfigured()) {
            showError("Firebase is not configured. Add CARTEL_FIREBASE_CONFIG first.");
            return;
        }

        if (isBlocked()) {
            showError("Too many attempts. Please wait 15 minutes and try again.");
            return;
        }

        toggleLoading(true);

        try {
            await applyRememberMePersistence(!!rememberMeInput.checked);
            const credential = await signInWithEmailAndPassword(auth, email, password);
            const user = credential.user;

            await updateDoc(doc(db, "users", user.uid), {
                lastLogin: serverTimestamp()
            }).catch(() => {});

            clearFailedAttempts();
            await SessionManager.completeLogin(user, {
                rememberMe: !!rememberMeInput.checked,
                method: "email_password"
            });
            showSuccess("Login successful! Redirecting...");
            window.location.href = "dashboard.html";
        } catch (err) {
            registerFailedAttempt();
            await logLoginFailure(email, err.code || "invalid_credentials", "email_password");
            showError("Invalid credentials");
        } finally {
            toggleLoading(false);
        }
    });

    otpModeBtn?.addEventListener("click", () => {
        toggleOtpPanel(otpPanel?.style.display === "none");
        if (otpEmailInput && emailInput && emailInput.value.trim()) {
            otpEmailInput.value = emailInput.value.trim();
        }
    });

    sendOtpBtn?.addEventListener("click", async () => {
        resetValidation();
        const email = (otpEmailInput.value || emailInput.value).trim().toLowerCase();

        if (!validateEmail(email)) {
            setFieldError(otpEmailError, "Please enter a valid email address");
            return;
        }

        if (!isFirebaseConfigured()) {
            showError("Firebase is not configured. Add CARTEL_FIREBASE_CONFIG first.");
            return;
        }

        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (!methods.length) {
                setFieldError(otpEmailError, "No account found for this email");
                return;
            }

            const otp = await requestOtp(email);
            otpRequestId = otp.requestId;
            otpExpiresAtMs = otp.expiresAtMs;
            startOtpCountdown();
            showSuccess("OTP sent to your email. Please verify within 5 minutes.");
        } catch (_err) {
            showError("Network error while sending OTP");
        }
    });

    verifyOtpBtn?.addEventListener("click", async () => {
        resetValidation();
        const email = (otpEmailInput.value || emailInput.value).trim().toLowerCase();
        const otpCode = otpCodeInput.value.trim();

        if (!validateEmail(email)) {
            setFieldError(otpEmailError, "Please enter a valid email address");
            return;
        }

        if (!/^\d{6}$/.test(otpCode)) {
            setFieldError(otpCodeError, "Enter a 6-digit OTP");
            return;
        }

        if (!otpRequestId) {
            setFieldError(otpCodeError, "Request OTP first");
            return;
        }

        try {
            const result = await verifyOtp(otpRequestId, email, otpCode);
            if (!result.ok) {
                setFieldError(otpCodeError, result.message === "OTP expired" ? "OTP expired" : result.message);
                return;
            }

            // OTP login mode (demo): enterprise apps should exchange OTP for a backend-issued custom token.
            localStorage.setItem("cartel_session_active", "true");
            localStorage.setItem("cartel_logged_in", "true");
            localStorage.setItem("cartel_session_user", email);
            localStorage.setItem("cartel_last_active", String(Date.now()));

            await addDoc(collection(db, "loginLogs"), {
                email,
                method: "otp_email",
                success: true,
                createdAt: serverTimestamp()
            });

            showSuccess("OTP verified. Redirecting...");
            window.location.href = "dashboard.html";
        } catch (_err) {
            showError("Unable to verify OTP. Please try again.");
        }
    });

    forgotPasswordLink?.addEventListener("click", (e) => {
        e.preventDefault();
        openResetModal();
    });

    resetModalClose?.addEventListener("click", closeResetModal);

    resetModalOverlay?.addEventListener("click", (e) => {
        if (e.target === resetModalOverlay) closeResetModal();
    });

    resetPasswordForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearFieldError(resetEmailError);
        resetSuccessMessage.style.display = "none";

        const resetEmail = resetEmailInput.value.trim().toLowerCase();

        if (!validateEmail(resetEmail)) {
            setFieldError(resetEmailError, "Please enter a valid email address");
            return;
        }

        if (!isFirebaseConfigured()) {
            setFieldError(resetEmailError, "Firebase is not configured yet.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            resetSuccessMessage.textContent = "Password reset link sent to your email";
            resetSuccessMessage.style.display = "flex";
        } catch (_err) {
            setFieldError(resetEmailError, "Network error. Please try again.");
        }
    });

    emailInput?.addEventListener("input", () => clearFieldError(emailError));
    passwordInput?.addEventListener("input", () => clearFieldError(passwordError));
});
