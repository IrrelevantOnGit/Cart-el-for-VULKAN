document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('signupForm') || document.getElementById('loginForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const submitBtn = document.getElementById('loginBtn');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    if (!form) return;

    if (window.CartelThemeToggle && typeof window.CartelThemeToggle.init === 'function') {
        window.CartelThemeToggle.init();
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

    function writeUsers(users) {
        localStorage.setItem('cartel_users', JSON.stringify(users));
    }

    function setError(el, message) {
        if (!el) return;
        el.textContent = message;
        el.classList.add('show');
    }

    function clearError(el) {
        if (!el) return;
        el.classList.remove('show');
    }

    function clearErrors() {
        [nameError, emailError, passwordError, confirmPasswordError].forEach(clearError);
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
    }

    function toggleLoading(active) {
        if (!submitBtn) return;
        submitBtn.disabled = active;
        submitBtn.classList.toggle('loading', active);
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearErrors();
        toggleLoading(true);

        const name = (nameInput?.value || '').trim();
        const email = (emailInput?.value || '').trim().toLowerCase();
        const password = passwordInput?.value || '';
        const confirmPassword = confirmPasswordInput?.value || '';

        let valid = true;

        if (!name) {
            setError(nameError, 'Full name is required');
            valid = false;
        }

        if (!email) {
            setError(emailError, 'Email is required');
            valid = false;
        } else if (!validateEmail(email)) {
            setError(emailError, 'Please enter a valid email address');
            valid = false;
        }

        if (!password) {
            setError(passwordError, 'Password is required');
            valid = false;
        } else if (password.length < 6) {
            setError(passwordError, 'Password must be at least 6 characters');
            valid = false;
        }

        if (confirmPassword !== password) {
            setError(confirmPasswordError, 'Passwords do not match');
            valid = false;
        }

        if (!valid) {
            if (errorMessage) {
                errorMessage.textContent = 'Please fix the highlighted fields';
                errorMessage.style.display = 'flex';
            }
            toggleLoading(false);
            return;
        }

        const users = readUsers();
        const exists = users.some(function (u) { return u.email === email; });

        if (exists) {
            if (errorMessage) {
                errorMessage.textContent = 'Account already exists for this email';
                errorMessage.style.display = 'flex';
            }
            toggleLoading(false);
            return;
        }

        users.push({
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        });

        writeUsers(users);
        console.log('Signup Success');

        if (successMessage) {
            successMessage.textContent = 'Account created! Redirecting...';
            successMessage.style.display = 'flex';
        }

        toggleLoading(false);
        window.location.href = 'login.html';
    });
});
