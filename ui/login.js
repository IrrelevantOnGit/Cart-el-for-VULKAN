// Login form functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const loginBtn = document.getElementById('loginBtn');
    const spinner = document.getElementById('spinner');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginCard = document.querySelector('.login-card');

    let isLoading = false;

    // Check if already logged in
    if (localStorage.getItem('cartel_logged_in') === 'true') {
        window.location.href = 'dashboard.html';
        return;
    }

    if (window.CartelThemeToggle && typeof window.CartelThemeToggle.init === 'function') {
        window.CartelThemeToggle.init();
    }

    // Password toggle functionality
    passwordToggle.addEventListener('click', function() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        // Update icon
        const icon = passwordToggle.querySelector('svg');
        if (type === 'password') {
            icon.innerHTML = `
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            `;
        } else {
            icon.innerHTML = `
                <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 4.96914 6.92701 8.06 5.94" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.9 4.24C10.5883 4.07888 11.2931 3.99834 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            `;
        }
    });

    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Password validation
    function validatePassword(password) {
        return password.length >= 6;
    }

    // Show error message
    function showError(element, message) {
        element.textContent = message;
        element.classList.add('show');
    }

    // Hide error message
    function hideError(element) {
        element.classList.remove('show');
    }

    // Clear all error messages
    function clearErrors() {
        hideError(emailError);
        hideError(passwordError);
    }

    // Show loading state
    function showLoading() {
        isLoading = true;
        loginBtn.disabled = true;
        loginCard.classList.add('loading');
        loginBtn.classList.add('loading');
    }

    // Hide loading state
    function hideLoading() {
        isLoading = false;
        loginBtn.disabled = false;
        loginCard.classList.remove('loading');
        loginBtn.classList.remove('loading');
    }

    // Show success message
    function showSuccess() {
        successMessage.style.display = 'flex';
        errorMessage.style.display = 'none';
        loginCard.classList.add('success');
        loginCard.classList.remove('error');
    }

    // Show error message
    function showErrorMessage() {
        errorMessage.style.display = 'flex';
        successMessage.style.display = 'none';
        loginCard.classList.add('error');
        loginCard.classList.remove('success');
    }

    // Simulate login API call
    function simulateLogin(email, password) {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                // Check specific credentials
                if (email === 'test@cartel.com' && password === '123456') {
                    resolve({ success: true, message: 'Login successful' });
                    localStorage.setItem('cartel_logged_in', 'true');
                } else {
                    reject({ success: false, message: 'Invalid credentials' });
                }
            }, 1500);
        });
    }

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (isLoading) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        let isValid = true;

        clearErrors();

        // Validate email
        if (!email) {
            showError(emailError, 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError(emailError, 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!password) {
            showError(passwordError, 'Password is required');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError(passwordError, 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        showLoading();

        // Prepare login data
        const loginData = {
            email: email,
            password: password,
            rememberMe: document.getElementById('rememberMe').checked
        };

        // Log login attempt (for demo)
        console.log('Login attempt:', loginData);

        try {
            // Simulate API call
            const response = await simulateLogin(email, password);

            // Show success
            showSuccess();

            // In a real app, you would redirect to dashboard or handle authentication
            // For demo, just show success for 2 seconds
            setTimeout(() => {
                // Reset form
                loginForm.reset();
                successMessage.style.display = 'none';
                loginCard.classList.remove('success');
                window.location.href = 'dashboard.html';
            }, 2000);

        } catch (error) {
            // Show error
            showErrorMessage();
        } finally {
            // Hide loading after a short delay to show success/error state
            setTimeout(() => {
                hideLoading();
            }, 2000);
        }
    });

    // Real-time validation on input
    emailInput.addEventListener('input', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            showError(emailError, 'Please enter a valid email address');
        } else {
            hideError(emailError);
        }
    });

    passwordInput.addEventListener('input', function() {
        const password = this.value;
        if (password && password.length < 6) {
            showError(passwordError, 'Password must be at least 6 characters');
        } else {
            hideError(passwordError);
        }
    });

    // Focus effects
    const inputs = [emailInput, passwordInput];
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Placeholder for backend integration
    /*
    async function loginUser(credentials) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            // Handle successful login (store token, redirect, etc.)
            return data;
        } catch (error) {
            throw error;
        }
    }
    */

    // Initialize global email links
    initializeGlobalEmailLinks();

    function initializeGlobalEmailLinks() {
        const targetEmail = 'deepthan07@gmail.com';
        const subject = 'CART-EL Support';
        const body = 'Hello CART-EL Support Team,';
        const fullMailto = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        // 1. Fix existing anchor tags
        const links = document.querySelectorAll(`a[href*="${targetEmail}"]`);
        links.forEach(link => {
            link.href = fullMailto;
        });

        // 2. Convert plain text email to clickable links
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const nodesToReplace = [];
        let node;

        while (node = walker.nextNode()) {
            if (node.parentElement.tagName === 'A' || 
                node.parentElement.tagName === 'SCRIPT' || 
                node.parentElement.tagName === 'STYLE' ||
                node.parentElement.tagName === 'TEXTAREA' ||
                node.parentElement.tagName === 'INPUT') {
                continue;
            }

            if (node.nodeValue.includes(targetEmail)) {
                nodesToReplace.push(node);
            }
        }

        nodesToReplace.forEach(node => {
            const fragment = document.createDocumentFragment();
            const parts = node.nodeValue.split(targetEmail);

            parts.forEach((part, index) => {
                if (part) {
                    fragment.appendChild(document.createTextNode(part));
                }

                if (index < parts.length - 1) {
                    const a = document.createElement('a');
                    a.href = fullMailto;
                    a.textContent = targetEmail;
                    a.style.color = 'var(--primary, #3B82F6)';
                    a.style.textDecoration = 'none';
                    a.style.cursor = 'pointer';
                    a.onmouseover = () => a.style.textDecoration = 'underline';
                    a.onmouseout = () => a.style.textDecoration = 'none';
                    fragment.appendChild(a);
                }
            });

            node.parentNode.replaceChild(fragment, node);
        });
    }
});
