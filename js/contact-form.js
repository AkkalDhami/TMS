import { showToast } from '../utils/toast.js';
// Form validation
const contactForm = document.getElementById('contactForm');
const formProgress = document.getElementById('formProgress');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');

const submitButton = document.getElementById('submitButton');
const submitLoader = document.getElementById('submitLoader');


const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const messageError = document.getElementById('messageError');

// Validation functions
function validateName() {
    if (nameInput.value.trim() === '') {
        nameError.textContent = 'Name is required';
        nameInput.classList.add('error');
        return false;
    } else if (nameInput.value.trim().length < 2) {
        nameError.textContent = 'Name must be at least 2 characters';
        nameInput.classList.add('error');
        return false;
    } else {
        nameError.textContent = '';
        nameInput.classList.remove('error');
        return true;
    }
}

function validateEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value.trim() === '') {
        emailError.textContent = 'Email is required';
        emailInput.classList.add('error');
        return false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid email address';
        emailInput.classList.add('error');
        return false;
    } else {
        emailError.textContent = '';
        emailInput.classList.remove('error');
        return true;
    }
}


function validateMessage() {
    if (messageInput.value.trim() === '') {
        messageError.textContent = 'Message is required';
        messageInput.classList.add('error');
        return false;
    } else if (messageInput.value.trim().length < 10) {
        messageError.textContent = 'Message must be at least 10 characters';
        messageInput.classList.add('error');
        return false;
    } else {
        messageError.textContent = '';
        messageInput.classList.remove('error');
        removeInputError(messageInput);
        return true;
    }
}

function removeInputError(input) {
    input.classList.remove('error');
}

nameInput.addEventListener('blur', validateName);
emailInput.addEventListener('blur', validateEmail);
messageInput.addEventListener('blur', validateMessage);

nameInput.addEventListener('input', validateName);
emailInput.addEventListener('input', validateEmail);
messageInput.addEventListener('input', validateMessage);

contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    if (isNameValid && isEmailValid && isMessageValid) {
        submitButton.querySelector('span').classList.add('opacity-0');
        submitLoader.classList.remove('hidden');

        submitButton.disabled = true;

        let progress = 0;
        const interval = setInterval(function () {
            progress += 5;

            if (progress >= 100) {
                clearInterval(interval);

                submitButton.querySelector('span').classList.remove('opacity-0');
                submitLoader.classList.add('hidden');

                showToast("Message sent successfully!", 'success', 5000);

                contactForm.reset();

                [nameInput, emailInput, messageInput].forEach(input => {
                    input.classList.remove('error');
                });

                [nameError, emailError, messageError].forEach(error => {
                    error.textContent = '';
                });

                submitButton.disabled = false;
            }
        }, 50);
    } else {
        showToast("Please fix the errors in the form", 'error', 3000);
    }
});

