import { showToast } from '../utils/toast.js'
document.addEventListener('DOMContentLoaded', function () {
    // Common functions
    const togglePasswordVisibility = () => {
        const passwordInput = document.getElementById('password');
        const toggleButton = document.getElementById('togglePassword');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.innerHTML = '<i class="ri-eye-line"></i>';
        } else {
            passwordInput.type = 'password';
            toggleButton.innerHTML = '<i class="ri-eye-off-line"></i>';
        }
    };

    // Set up password toggle
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }



    // Login form validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;

            const email = document.getElementById('email').value.trim();
            const emailError = document.getElementById('emailError');

            const password = document.getElementById('password').value;
            const passwordError = document.getElementById('passwordError');
            if (email === '' || password === '') {
                showToast('Please fill the required fill!', 'error')
            } else if (!email || !password) {
                showToast('Invalid Email or Password! ', 'error')
            }

            if (!email) {
                showError(emailError, 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError(emailError, 'Please enter a valid email address');
                isValid = false;
            } else {
                hideError(emailError);
            }

            if (!password) {
                showError(passwordError, 'Password is required');
                isValid = false;
            } else {
                hideError(passwordError);
            }



            if (isValid) {
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const user = users.find(u => u.email === email && u.password === password);

                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify({
                        name: user.fullName,
                        email: user.email,
                        isLoggedIn: true,
                        id: `user_${Date.now()}`
                    }));

                    showToast('Login successful! Redirecting...', 'success');

                    setTimeout(() => {
                        window.location.href = '../html/todo.html';
                    }, 1500);
                } else {
                    showToast('Invalid email or password', 'error');
                }
            }
        });
    }

    // Signup form validation
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();

            let isValid = true;

            const fullName = document.getElementById('fullName').value.trim();
            const fullNameError = document.getElementById('fullNameError');
            const email = document.getElementById('email').value.trim();
            const emailError = document.getElementById('emailError');
            const password = document.getElementById('password').value;
            const passwordError = document.getElementById('passwordError');
            const confirmPassword = document.getElementById('confirmPassword').value;
            const confirmPasswordError = document.getElementById('confirmPasswordError');
            const terms = document.getElementById('terms').checked;
            const termsError = document.getElementById('termsError');

            if (fullName === '' || email === '' || password === '' || confirmPassword === '') {
                showToast('Please fill the required fill!', 'error')
            } else if (!fullName || !email || !password || !confirmPassword) {
                showToast('Invalid Full Name, Email or Password! ', 'error')
            }

            // Full name validation
            if (!fullName) {
                showError(fullNameError, 'Full name is required');
                isValid = false;
            } else if (fullName.length < 2) {
                showError(fullNameError, 'Name must be at least 2 characters');
                isValid = false;
            } else {
                hideError(fullNameError);
            }


            // Email validation
            if (!email) {
                showError(emailError, 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError(emailError, 'Please enter a valid email address');
                isValid = false;
            } else {
                const users = JSON.parse(localStorage.getItem('users')) || [];
                if (users.some(user => user.email === email)) {
                    showError(emailError, 'This email is already registered');
                    isValid = false;
                } else {
                    hideError(emailError);
                }
            }

            // Password validation

            if (!password) {
                showError(passwordError, 'Password is required');
                isValid = false;
            } else if (password.length < 8) {
                showError(passwordError, 'Password must be at least 8 characters');
                isValid = false;
            } else if (!/[A-Z]/.test(password)) {
                showError(passwordError, 'Password must contain at least one uppercase letter');
                isValid = false;
            } else if (!/[a-z]/.test(password)) {
                showError(passwordError, 'Password must contain at least one lowercase letter');
                isValid = false;
            } else if (!/[0-9]/.test(password)) {
                showError(passwordError, 'Password must contain at least one number');
                isValid = false;
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                showError(passwordError, 'Password must contain at least one special character');
                isValid = false;
            } else {
                hideError(passwordError);
            }

            // Confirm password validation

            if (!confirmPassword) {
                showError(confirmPasswordError, 'Please confirm your password');
                isValid = false;
            } else if (confirmPassword !== password) {
                showError(confirmPasswordError, 'Passwords do not match');
                isValid = false;
            } else {
                hideError(confirmPasswordError);
            }

            // Terms validation

            if (!terms) {
                showError(termsError, 'You must agree to the Terms of Service and Privacy Policy');
                isValid = false;
            } else {
                hideError(termsError);
            }

            if (isValid) {
                const users = JSON.parse(localStorage.getItem('users')) || [];

                users.push({
                    fullName,
                    email,
                    password,
                    createdAt: new Date().toISOString(),
                    id: `user_${Date.now()}`,
                });

                localStorage.setItem('users', JSON.stringify(users));

                localStorage.setItem('currentUser', JSON.stringify({
                    name: fullName,
                    email: email,
                    isLoggedIn: true,
                    id: `user_${Date.now()}`
                }));

                showToast('Account created successfully! Redirecting...', 'success');

                setTimeout(() => {
                    window.location.href = '../html/todo.html';
                }, 1500);
            }
        });
    }

    // Helper functions
    function showError(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');
    }

    function hideError(element) {
        element.textContent = '';
        element.classList.add('hidden');
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.isLoggedIn) {
        if (window.location.pathname.includes('/') || window.location.pathname.includes('signup.html')) {
            window.location.href = '../html/todo.html';
        }
    }
});
