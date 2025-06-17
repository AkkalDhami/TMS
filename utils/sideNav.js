let sideNav = document.querySelector("#sideNav");
if (sideNav) {
  sideNav.classList.remove('border-r-2')
  sideNav.classList.add('mt-8')
  sideNav.classList.remove('border-zinc-500/40')
  sideNav.innerHTML = `
      <button id="desktop-toggle" class="hidden absolute bottom-10 right-1.5 bg-zinc-500/30 w-[40px] h-[40px] rounded-full md:block text-xl  hover:bg-purple-500 transition">
      <i class="ri-arrow-left-right-line"></i>
      </button>

    <!-- Sidebar Nav -->
    <nav class="flex flex-col w-full space-y-3 mt-2 sm:mt-6">

      <a href="../html/dashboard.html"
        class="flex  items-center space-x-3 p-3 rounded-lg  ${window.location.pathname.includes("/dashboard.html")
      ? "border-l-4 border-purple-500 bg-purple-500/10 text-purple-600"
      : "hover:text-purple-500 hover:bg-purple-500/10"
    } transition">
        <i class="ri-dashboard-line text-xl"></i>
        <span class="sidebar-label">Dashboard</span>
      </a>

      <a href="../html/todo.html"
        class="flex items-center space-x-3 p-3 rounded-lg ${window.location.pathname.includes("todo.html")
      ? "border-l-4 border-purple-500 bg-purple-500/10 text-purple-600"
      : "hover:text-purple-500 hover:bg-purple-500/10"
    }  transition">
        <i class="ri-list-check text-xl"></i>
        <span class="sidebar-label">My Tasks</span>
      </a>

      <a href="../html/calender.html"
        class="flex items-center space-x-3 p-3 rounded-lg ${window.location.pathname.includes("calender.html")
      ? "border-l-4 border-purple-500 bg-purple-500/10 text-purple-600"
      : "hover:text-purple-500 hover:bg-purple-500/10"
    } transition">
        <i class="ri-calendar-line text-xl"></i>
        <span class="sidebar-label">Calendar</span>
      </a>


      <a href="../html/all-tasks.html"
        class="flex items-center space-x-3 p-3 rounded-lg ${window.location.pathname.includes("all-tasks.html")
      ? "border-l-4 border-purple-500 bg-purple-500/10 text-purple-600"
      : "hover:text-purple-500 hover:bg-purple-500/10"
    } transition">
        <i class="ri-task-line text-xl"></i>
        <span class="sidebar-label">All Tasks</span>
      </a>
      
      <a href="../html/analytics.html"
        class="flex items-center space-x-3 p-3 rounded-lg ${window.location.pathname.includes("analytics.html")
      ? "border-l-4 border-purple-500 bg-purple-500/10 text-purple-600 "
      : "hover:text-purple-500 hover:bg-purple-500/10"
    } transition">
        <i class="ri-bar-chart-line text-xl"></i>
        <span class="sidebar-label">Analytics</span>
      </a>

      <a href="../html/task-detail.html"
        class="flex items-center space-x-3 p-3 rounded-lg ${window.location.pathname.includes("task-detail.html")
      ? "border-l-4 border-purple-500 bg-purple-500/10 text-purple-600 inline-block"
      : "hover:text-purple-500 hover:bg-purple-500/10 hidden"
    } transition">
        <i class="ri-task-line text-xl"></i>
        <span class="sidebar-label">Task Detail</span>
      </a>


    </nav>

    <div class="mt-auto border-t border-zinc-500/30 pt-4">
      <a href="javascript:logout()" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-500/10 text-red-600 transition">
        <i class="ri-logout-box-line text-xl"></i>
        <span class="sidebar-label">Logout</span>
      </a>
    </div>
`;
}

// Logout function
function logout() {
  // Update current user status
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    currentUser.isLoggedIn = false;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }

  // Redirect to login page
  window.location.href = '/';
}