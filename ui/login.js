document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const resetModalOverlay = document.getElementById('resetModalOverlay');
    const resetModalClose = document.getElementById('resetModalClose');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const resetEmailInput = document.getElementById('resetEmailInput');
    const resetEmailError = document.getElementById('resetEmailError');
    const resetSuccessMessage = document.getElementById('resetSuccessMessage');

    if (window.CartelThemeToggle && typeof window.CartelThemeToggle.init === 'function') {
        window.CartelThemeToggle.init();
    }

    if (localStorage.getItem('loggedUser')) {
        window.location.href = 'dashboard.html';
        return;
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function readUsers() {
        try {
            const parsed = JSON.parse(localStorage.getItem('cartel_users') || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (_err) {
            return [];
        }
    }

    function showFieldError(el, message) {
        if (!el) return;
        el.textContent = message;
        el.classList.add('show');
    }

    function clearFieldError(el) {
        if (!el) return;
        el.classList.remove('show');
    }

    function clearMessages() {
        clearFieldError(emailError);
        clearFieldError(passwordError);
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
    }

    function toggleLoading(active) {
        if (!loginBtn) return;
        loginBtn.disabled = active;
        loginBtn.classList.toggle('loading', active);
    }

    function showError(text) {
        if (!errorMessage) return;
        errorMessage.textContent = text;
        errorMessage.style.display = 'flex';
    }

    function showSuccess(text) {
        if (!successMessage) return;
        successMessage.textContent = text;
        successMessage.style.display = 'flex';
    }

    function loginUser(event) {
        if (event) event.preventDefault();
        console.log('Login Clicked');

        clearMessages();
        toggleLoading(true);

        const email = (emailInput?.value || '').trim().toLowerCase();
        const password = passwordInput?.value || '';

        let valid = true;
        if (!email) {
            showFieldError(emailError, 'Email is required');
            valid = false;
        } else if (!validateEmail(email)) {
            showFieldError(emailError, 'Please enter a valid email address');
            valid = false;
        }

        if (!password) {
            showFieldError(passwordError, 'Password is required');
            valid = false;
        }

        if (!valid) {
            showError('Invalid email or password');
            console.log('Login failed');
            toggleLoading(false);
            return false;
        }

        // MASTER LOGIN ONLY FOR DEV TESTING - REMOVE IN PRODUCTION
        if (password === '12345') {
            localStorage.setItem('loggedUser', email || 'master@cartel.ai');
            localStorage.setItem('cartel_logged_in', 'true');
            localStorage.setItem('cartel_last_active', String(Date.now()));
            console.log('Master Login Used');
            showSuccess('Login successful! Redirecting...');
            window.location.href = 'dashboard.html';
            return true;
        }

        const users = readUsers();
        const matched = users.find(function (user) {
            return user.email === email && user.password === password;
        });

        if (matched) {
            localStorage.setItem('loggedUser', email);
            localStorage.setItem('cartel_logged_in', 'true');
            localStorage.setItem('cartel_last_active', String(Date.now()));
            console.log('Normal login success');
            showSuccess('Login successful! Redirecting...');
            window.location.href = 'dashboard.html';
            return true;
        }

        showError('Invalid email or password');
        console.log('Login failed');
        toggleLoading(false);
        return false;
    }

    window.loginUser = loginUser;

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function () {
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        });
    }

    if (loginForm && !loginForm.hasAttribute('onsubmit')) {
        loginForm.addEventListener('submit', loginUser);
    }

    if (forgotPasswordLink && resetModalOverlay) {
        forgotPasswordLink.addEventListener('click', function (event) {
            event.preventDefault();
            resetModalOverlay.classList.add('show');
            resetModalOverlay.setAttribute('aria-hidden', 'false');
            if (resetSuccessMessage) resetSuccessMessage.style.display = 'none';
            clearFieldError(resetEmailError);
            if (resetPasswordForm) resetPasswordForm.reset();
        });
    }

    if (resetModalClose && resetModalOverlay) {
        resetModalClose.addEventListener('click', function () {
            resetModalOverlay.classList.remove('show');
            resetModalOverlay.setAttribute('aria-hidden', 'true');
        });
    }

    if (resetModalOverlay) {
        resetModalOverlay.addEventListener('click', function (event) {
            if (event.target === resetModalOverlay) {
                resetModalOverlay.classList.remove('show');
                resetModalOverlay.setAttribute('aria-hidden', 'true');
            }
        });
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const resetEmail = (resetEmailInput?.value || '').trim().toLowerCase();

            clearFieldError(resetEmailError);
            if (resetSuccessMessage) resetSuccessMessage.style.display = 'none';

            if (!resetEmail || !validateEmail(resetEmail)) {
                showFieldError(resetEmailError, 'Please enter a valid email address');
                return;
            }

            if (resetSuccessMessage) {
                resetSuccessMessage.textContent = 'Password reset link sent to your email';
                resetSuccessMessage.style.display = 'flex';
            }
        });
    }
});
