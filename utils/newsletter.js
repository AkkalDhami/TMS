import { showToast } from './toast.js';

// Newsletter Form Handling
document.getElementById('newsletterForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('footerEmail').value;
    const errorElement = document.getElementById('footerEmailError');

    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(email)) {
        errorElement.textContent = 'Please enter a valid email address';
        errorElement.classList.remove('hidden');
        showToast('Please enter a valid email address','error');
        return;
    }
    errorElement.classList.add('hidden');
    this.reset();
    showToast('Thank you for subscribing!','success');
});

// Real-time validation
document.getElementById('footerEmail').addEventListener('input', function () {
    document.getElementById('emailError').classList.add('hidden');
});

