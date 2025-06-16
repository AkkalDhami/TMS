let navbar = document.querySelector(".navbar");
if (navbar) {
    navbar.className = `navbar fixed top-0 left-0 right-0 w-full border-b-2 border-purple-600/10 z-50 bg-[var(--primary-bg)]`
    navbar.innerHTML =
        `
     <nav class="mx-auto px-5 max-w-[1500px] py-3 flex justify-between items-center">
            <div class="flex items-center justify-center gap-3">
                <h1 onclick="window.location.href='/'"
                    class="text-2xl cursor-pointer sm:text-3xl md:text-4xl font-bold text-purple-500 text-center">
                    NepTask.
                </h1>
            </div>
         
            <div class="flex items-center justify-center gap-2">
           
             </button>
                <button onclick="toggleTheme()"
                    class="theme-toggle p-2 cursor-pointer hover:text-purple-500 transition-transform w-[46px] h-[46px] flex items-center justify-center">
                    <i class="ri-sun-line text-[20px]"></i>
                </button>
            
                
               <button id="menu-btn" class="md:hidden text-2xl">&#9776;</button>
            </div>
         
        </nav>
    `

} else {
    console.error("Navbar not found")
}

{/* <button id="menu-btn" class="md:hidden text-2xl">&#9776;</button> */ }

{/* <button onclick="window.location.href='../html/todo.html'"
    class="border-[2px] border-purple-500 hidden  px-6 group py-2.5 cursor-pointer rounded-full ${window.location.pathname.includes('todo.html') ? 'hidden' : 'md:flex'} font-semibold hover:bg-purple-500 hover:text-white duration-300">
    Add Task <i class="ri-todo-line ml-2"></i>
</button> */}
// <div class="flex items-center gap-0 sm:gap-4">
//     <ul class="hidden md:flex">
//         <li>
//             <a href="/" class="inline-block cursor-pointer mx-2 text-[16px] ${window.location.pathname.includes('index.html') ? 'border-b-2 border-r-purple-500 text-purple-600 ' : 'hover:text-purple-500'} transition-colors">Home</a>
//         </li>
//         <li>
//             <a href="./todo.html" class="inline-block cursor-pointer mx-2 text-[16px] ${window.location.pathname.includes('todo.html') ? 'border-b-2 border-r-purple-500 text-purple-600 ' : 'hover:text-purple-500'} transition-colors">Todo</a>
//         </li>

//         <li>
//             <a href="../html/calender.html" class="inline-block cursor-pointer mx-2 text-[16px] ${window.location.pathname.includes('calender.html') ? 'border-b-2 border-r-purple-500 text-purple-600 ' : 'hover:text-purple-500'} transition-colors">Calender</a>
//         </li>
//         <li>
//             <a href="../html/dashboard.html" class="inline-block cursor-pointer mx-2 text-[16px] ${window.location.pathname.includes('dashboard.html') ? 'border-b-2 border-r-purple-500 text-purple-600 ' : 'hover:text-purple-500'} transition-colors">Dashboard</a>
//         </li>
//         <li>
//             <a href="../html/all-tasks.html" class="inline-block cursor-pointer mx-2 text-[16px] ${window.location.pathname.includes('all-tasks.html') ? 'border-b-2 border-r-purple-500 text-purple-600 ' : 'hover:text-purple-500'} transition-colors">All Tasks</a>
//         </li>
//         <li>
//             <a href="" class="cursor-pointer mx-2 text-[16px] ${window.location.pathname.includes('task-detail.html') ? 'border-b-2 border-r-purple-500 text-purple-600 inline-block' : 'hidden'} transition-colors">Task Detail</a>
//         </li>
//     </ul>
// </div>