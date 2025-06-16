const openSidebarBtn = document.getElementById('openSidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');
const sidebarMenu = document.getElementById('sidebarMenu');
const sidebarContent = document.querySelector('.sidebar-content');

function openSidebar() {
    sidebarMenu.classList.remove('hidden');
    setTimeout(() => {
        sidebarContent.classList.remove('-translate-x-full');
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebarContent.classList.add('-translate-x-full');
    setTimeout(() => {
        sidebarMenu.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
}

openSidebarBtn.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);

// Close sidebar when clicking outside of it
sidebarMenu.addEventListener('click', function (e) {
    if (e.target === sidebarMenu) {
        closeSidebar();
    }
});

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('flex');
                setTimeout(() => {
                    mobileMenu.classList.add('opacity-100');
                    mobileMenu.classList.remove('opacity-0');
                }, 10);
                
                menuToggle.innerHTML = '<i class="ri-close-line text-2xl"></i>';
            } else {
                mobileMenu.classList.remove('opacity-100');
                mobileMenu.classList.add('opacity-0');
                
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('flex');
                }, 300);
                
                menuToggle.innerHTML = '<i class="ri-menu-line text-2xl"></i>';
            }
        });
        
        document.addEventListener('click', function(event) {
            if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target) && !mobileMenu.classList.contains('hidden')) {
         
                mobileMenu.classList.remove('opacity-100');
                mobileMenu.classList.add('opacity-0');
                
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('flex');
                }, 300);
                
                menuToggle.innerHTML = '<i class="ri-menu-line text-2xl"></i>';
            }
        });
        
        if (mobileMenu.children.length === 0) {
            const menuItems = [
                { text: 'Home', link: '../index.html' },
                { text: 'Features', link: '#features' },
                { text: 'Pricing', link: '#pricing' },
                { text: 'Testimonials', link: '#testimonials' },
                { text: 'FAQ', link: '#faq' },
                { text: 'Contact', link: '#contact' },
                { text: 'Login', link: './html/login.html', highlight: true },
                { text: 'Sign Up', link: './html/signup.html', highlight: true }
            ];
            
            menuItems.forEach(item => {
                const menuItem = document.createElement('a');
                menuItem.href = item.link;
                menuItem.className = item.highlight 
                    ? 'py-3 px-6 my-2 bg-purple-600 text-white rounded-lg text-center' 
                    : 'py-3 text-[var(--text-color)] hover:text-purple-600 transition-colors';
                menuItem.textContent = item.text;
                
                menuItem.addEventListener('click', () => {
                    mobileMenu.classList.remove('opacity-100');
                    mobileMenu.classList.add('opacity-0');
                    setTimeout(() => {
                        mobileMenu.classList.add('hidden');
                        mobileMenu.classList.remove('flex');
                    }, 300);
                    menuToggle.innerHTML = '<i class="ri-menu-line text-2xl"></i>';
                });
                
                mobileMenu.appendChild(menuItem);
            });
        }
    }
});
