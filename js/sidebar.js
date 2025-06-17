const sidebar = document.getElementById('sideNav');
const overlay = document.getElementById('overlay');
const menuBtn = document.getElementById('menu-btn');
const desktopToggle = document.getElementById('desktop-toggle');
const mainContent = document.getElementById('main-content');
const sidebarLabels = document.querySelectorAll('.sidebar-label');
const header = document.querySelector('header');
let isCollapsed = false;

// Mobile Sidebar
menuBtn.addEventListener('click', () => {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
});


overlay.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
});

// Desktop Sidebar Collapse Toggle
desktopToggle.addEventListener('click', () => {
    isCollapsed = !isCollapsed;

    if (isCollapsed) {
        sidebar.classList.replace('w-[270px]', 'w-24');
        mainContent.classList.replace('md:ml-[270px]', 'md:ml-20');
        header.classList.replace('md:pl-64', 'md:pl-20');
        sidebarLabels.forEach(label => label.classList.add('hidden'));
        desktopToggle.innerHTML = `<i class="ri-arrow-right-s-line"></i>`;
    } else {
        sidebar.classList.replace('w-24', 'w-[270px]');
        mainContent.classList.replace('md:ml-20', 'md:ml-[270px]');
        header.classList.replace('md:pl-20', 'md:pl-64');
        sidebarLabels.forEach(label => label.classList.remove('hidden'));
        desktopToggle.innerHTML = `<i class="ri-arrow-left-s-line"></i>`;
    }
});