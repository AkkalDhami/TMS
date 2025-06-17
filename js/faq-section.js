

const faqData = [
    {
        question: "How does NepTask compare to other task management tools?",
        answer: "NepTask stands out with its smart scheduling, comprehensive analytics dashboard, and seamless team collaboration features. It's designed for efficiency, collaboration, and productivity, offering a unique blend of features for all types of users. "
    },
    {
        question: "How secure is my data with NepTask?",
        answer: "Security is our top priority. NepTask employs end-to-end encryption for all data, both in transit and at rest. We maintain SOC 2 Type II, GDPR, and HIPAA compliance for organizations with strict security requirements. Our infrastructure is hosted on enterprise-grade cloud services with 99.9% uptime guarantee. "
    },
    {
        question: "What kind of analytics does NepTask provide?",
        answer: "Our analytics suite offers comprehensive insights into productivity patterns at individual and team levels. You'll get visual representations of task completion rates, time spent per category, bottleneck identification, and resource allocation efficiency. Custom reports can be scheduled and exported in multiple formats."
    },
    {
        question: "What makes NepTask's mobile experience unique?",
        answer: "Our mobile app is designed for productivity on the go with offline capabilities, voice command task creation, and location-based reminders. The interface adapts to your usage patterns, bringing frequently used features to the forefront. We've optimized battery usage and data consumption while maintaining real-time synchronization across all your devices. "
    },
    
    {
        question: "What customization options does NepTask offer?",
        answer: "NepTask offers extensive customization including personalized dashboards, custom fields for tasks, configurable workflows, and branded workspaces for teams. You can create custom views, filters, and sorting options tailored to your specific needs. The notification system is fully customizable with options for timing, channels, and priority levels. "
    },

];


// Function to generate FAQ HTML
function generateFAQs() {
    const faqContainer = document.getElementById('faq-container');

    // Clear existing content
    if (faqContainer) {
        faqContainer.innerHTML = '';

        // Generate FAQ items from the array
        faqData.forEach((faq, index) => {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item mb-5  backdrop-blur-lg bg-[var(--card-bg)] rounded-xl overflow-hidden  shadow-sm';

            accordionItem.innerHTML = `
                    <button class="accordion-header sm:text-[20px] duration-300 hover:text-purple-500 cursor-pointer w-full p-5 text-left font-semibold flex justify-between items-center text-[var(--text-color)]">
                        <span>${faq.question}</span>
                        <i class="ri-arrow-down-s-line text-xl transition-transform text-primary-600"></i>
                    </button>
                    <div class="accordion-content text-[16.5px] sm:text-[18px] bg-[var(--stat-bg)] px-5 pb-5">
                        <p class="text-[var(--text-color)]">${faq.answer}</p>
                    </div>
                `;

            faqContainer.appendChild(accordionItem);
        });

        // Reinitialize accordion functionality
        initAccordion();
    }
}

// Function to initialize accordion functionality
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const content = this.nextElementSibling;
            const icon = this.querySelector('i');

            // Toggle active class
            content.classList.toggle('active');

            // Rotate icon
            if (content.classList.contains('active')) {
                icon.style.transform = 'rotate(180deg)';
            } else {
                icon.style.transform = 'rotate(0)';
            }
        });
    });
}

// Function to add a new FAQ
function addNewFAQ(question, answer) {
    faqData.push({ question, answer });
    generateFAQs();
}

// Initial call to generate FAQs on page load
document.addEventListener('DOMContentLoaded', function () {
    generateFAQs();
});