import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { applyRememberMePersistence, auth, db, isFirebaseConfigured } from "./firebase-config.js";
import { SessionManager } from "./auth-session.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("signupForm");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const submitBtn = document.getElementById("loginBtn");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");

    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");

    if (!form) return;

    if (window.CartelThemeToggle && typeof window.CartelThemeToggle.init === "function") {
        window.CartelThemeToggle.init();
    }

    function setError(el, message) {
        if (!el) return;
        el.textContent = message;
        el.classList.add("show");
    }

    function clearError(el) {
        if (!el) return;
        el.classList.remove("show");
    }

    function clearErrors() {
        [nameError, emailError, passwordError, confirmPasswordError].forEach(clearError);
        if (errorMessage) errorMessage.style.display = "none";
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePasswordStrength(password) {
        const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
        return strong.test(password);
    }

    async function createProfile(user, fullName, email) {
        await setDoc(doc(db, "users", user.uid), {
            userId: user.uid,
            name: fullName,
            email,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            accountType: "enterprise"
        });

        await addDoc(collection(db, "loginLogs"), {
            userId: user.uid,
            email,
            method: "signup",
            success: true,
            createdAt: serverTimestamp()
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearErrors();

        const fullName = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        let isValid = true;

        if (!fullName) {
            setError(nameError, "Full name is required");
            isValid = false;
        }

        if (!email) {
            setError(emailError, "Email is required");
            isValid = false;
        } else if (!validateEmail(email)) {
            setError(emailError, "Please enter a valid email address");
            isValid = false;
        }

        if (!password) {
            setError(passwordError, "Password is required");
            isValid = false;
        } else if (!validatePasswordStrength(password)) {
            setError(passwordError, "Use 8+ chars with upper, lower, number, and symbol");
            isValid = false;
        }

        if (confirmPassword !== password) {
            setError(confirmPasswordError, "Passwords do not match");
            isValid = false;
        }

        if (!isValid) return;

        if (!isFirebaseConfigured()) {
            if (errorMessage) {
                errorMessage.textContent = "Firebase is not configured. Add CARTEL_FIREBASE_CONFIG first.";
                errorMessage.style.display = "flex";
            }
            return;
        }

        submitBtn.disabled = true;
        submitBtn.classList.add("loading");

        try {
            await applyRememberMePersistence(true);
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            const user = credential.user;

            await updateProfile(user, { displayName: fullName });
            await sendEmailVerification(user);
            await createProfile(user, fullName, email);
            await SessionManager.completeLogin(user, { rememberMe: true, method: "signup" });

            if (successMessage) {
                successMessage.textContent = "Signup successful. Verification email sent. Redirecting...";
                successMessage.style.display = "flex";
            }

            window.location.href = "dashboard.html";
        } catch (err) {
            if (errorMessage) {
                errorMessage.textContent = err && err.message ? err.message : "Unable to create account. Please try again.";
                errorMessage.style.display = "flex";
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        }
    });
});
