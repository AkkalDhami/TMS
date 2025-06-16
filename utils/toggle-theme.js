// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    
    localStorage.setItem('taskify-theme', newTheme);
    
    updateThemeIcon(newTheme);
}


function updateThemeIcon(theme) {
    const themeToggleIcon = document.querySelector('.theme-toggle i');
    if (themeToggleIcon) {
        if (theme === 'dark') {
            themeToggleIcon.classList.remove('ri-moon-line');
            themeToggleIcon.classList.add('ri-sun-line');
        } else {
            themeToggleIcon.classList.remove('ri-sun-line');
            themeToggleIcon.classList.add('ri-moon-line');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('taskify-theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
 
    let initialTheme;
    if (savedTheme) {
        initialTheme = savedTheme;
    } else if (prefersDarkScheme) {
        initialTheme = 'dark';
    } else {
        initialTheme = 'dark'; 
    }
    
    document.body.setAttribute('data-theme', initialTheme);
    updateThemeIcon(initialTheme);
});