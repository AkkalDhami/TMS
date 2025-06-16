
let neptaskfooter = document.querySelector(".neptaskfooter");
if (neptaskfooter) {
    neptaskfooter.innerHTML =
        `
<div class="mx-auto px-6 py-12">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    <!-- Brand Section -->
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-purple-500">NepTask.</h2>
      <p class="text-[var(--text-gray)] leading-relaxed">
        Empowering your productivity with smart task management and
        insightful analytics.
      </p>
      <div class="flex space-x-2">
        <a href="#"
          class="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-purple-500/20 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-colors duration-300">
          <i class="ri-twitter-x-line"></i>
        </a>
        <a href="https://github.com/AkkalDhami" target="_blank"
          class="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-purple-500/20 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-colors duration-300">
          <i class="ri-github-line"></i>
        </a>
        <a href="#"
          class="w-10 h-10 rounded-full bg-[var(--card-bg)] border border-purple-500/20 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-colors duration-300">
          <i class="ri-linkedin-line"></i>
        </a>
      </div>
    </div>
    <!-- Quick Links -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">Quick Links</h3>
      <ul class="space-y-2">
        <li>
          <a href="/" class="text-[var(--text-gray)] hover:text-purple-500 transition-colors">Home</a>
        </li>
        <li>
          <a href="../index.html#features" class="text-[var(--text-gray)] hover:text-purple-500 transition-colors">Features</a>
        </li>
        <li>
          <a href="../index.html#testimonials"
            class="text-[var(--text-gray)] hover:text-purple-500 transition-colors">Testimonials</a>
        </li>
        <li>
          <a href="../index.html#contact" class="text-[var(--text-gray)] hover:text-purple-500 transition-colors">Contact</a>
        </li>
      </ul>
    </div>

    <!-- Contact Info -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">Contact Us</h3>
      <ul class="space-y-2">
        <li class="flex items-center space-x-2">
          <i class="ri-mail-line text-purple-500"></i>
          <span class="text-[var(--text-gray)]">support@NepTask.com</span>
        </li>
        <li class="flex items-center space-x-2">
          <i class="ri-phone-line text-purple-500"></i>
          <span class="text-[var(--text-gray)]">+1 (555) 123-4567</span>
        </li>
        <li class="flex items-center space-x-2">
          <i class="ri-map-pin-line text-purple-500"></i>
          <span class="text-[var(--text-gray)]">123 Task Street, TO 12345</span>
        </li>
      </ul>
    </div>
    <!-- Email Subscription -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold">Newsletter</h3>
      <form id="newsletterForm" class="space-y-3">
        <div class="relative">
          <input type="email" id="footerEmail" name="email"
            class="w-full px-4 py-2 outline-0 bg-[var(--card-bg)] border border-purple-500/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your email" />
          <div id="footerEmailError" class="hidden text-red-400 text-sm mt-1"></div>
        </div>
        <button type="submit"
          class="w-full bg-purple-500 cursor-pointer hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
          Subscribe
        </button>
      </form>
      <p class="text-sm text-[var(--text-gray)]">
        Stay updated with productivity tips
      </p>
    </div>
  </div>
  <div class="mt-12 relative pt-8 border-t border-purple-500/20 text-center text-[var(--text-gray)]">
    <div class="text-sm sm:text-[18px] flex items-center justify-center gap-2">
          &copy; 2025
          <p
            class="scroll-to-top cursor-pointer font-semibold text-purple-500 hover:text-purple-600 transition-colors relative group">
            NepTask.
            <span
              class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-[cubic-bezier(0.58,-0.2,0.59,1.21)] whitespace-nowrap shadow-lg z-50 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-t-purple-600">
              Scroll to top
            </span>
          </p>
         <span> All rights reserved.</span>
        </div>
    <div class="tooltip absolute"></div>
  </div>
</div>
`
} else {
    console.error("NepTask footer element not found.");
}