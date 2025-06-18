// Get filter elements
import { getDueStatus } from "../utils/dueStatus.js";

const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');
const categoryFilter = document.getElementById('categoryFilter');
const subtaskFilter = document.getElementById('subtaskFilter');
const searchInput = document.getElementById('searchTask');
const tasksContainer = document.getElementById('tasksContainer');
// note details modal
window.openNoteDetailsModal = function (taskId, noteId,) {
    const task = tasks.find((t) => t.id === taskId);
    let noteDetailModal = document.getElementById("noteDetailModal")
    if (task) {
        const note = task.notes.find((n) => n.id === noteId);
        if (note) {
            let noteTitle = document.getElementById("noteDetailTitle");
            let noteContent = document.getElementById("noteDetailContent");
            noteTitle.textContent = note.title;
            noteContent.textContent = note.content;
            document.getElementById(
                "noteDetailAuthor"
            ).innerHTML = `Created by: ${currentUser.name}`;
            let formattedDate = new Date(note.createdAt).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            });
            document.getElementById(
                "noteDetailDate"
            ).textContent = `Created on: ${formattedDate}`;
            document.getElementById(
                "noteDetailLastEdited"
            ).textContent = `Last edited: ${!note.updatedAt ? "Not edited yet!" : timeAgo(note.updatedAt)
            }`;
            noteDetailModal.classList.remove("hidden");
            noteDetailModal.classList.add("flex");

            noteDetailModal.addEventListener("click", function (event) {
                if (event.target === noteDetailModal) {
                    hidNoteDetailsModal();
                }
            });
        }
    }
}


// Current filter state
let filters = {
    status: 'all',
    priority: 'all',
    category: 'all',
    subtask: 'all',
    search: ''
};
let tasks = [];
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

// Initialize
function init() {
    loadTasks();
    setupEventListeners();
}

function loadTasks() {
    if (currentUser && currentUser.tasks) {
        tasks = currentUser.tasks;
    }
    return tasks;
}

// Apply filters and render tasks
function renderFilteredTasks() {
    const tasks = loadTasks();

    const filteredTasks = tasks.filter(task => {
        if (filters.status !== 'all' && (filters.status === 'completed' && task.status !== 'completed' || filters.status === 'pending' && task.status !== 'pending' || filters.status === 'in-progress' && task.status !== 'in-progress')) {
            return false;
        }

        if (filters.priority !== 'all' && task.priority !== filters.priority) {
            return false;
        }

        if (filters.category !== 'all' && task.category !== filters.category) {
            return false;
        }

        if (filters.subtask !== 'all') {
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            if ((filters.subtask === 'yes' && !hasSubtasks) ||
                (filters.subtask === 'no' && hasSubtasks)) {
                return false;
            }
        }

        if (filters.search && !task.text.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }

        return true;
    });

    displayTasks(filteredTasks);
}

function displayTasks(tasks) {
    tasksContainer.innerHTML = '';

    if (tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="text-center py-8">
                <p class="text-lg text-gray-500">No tasks found matching your filters</p>
            </div>
        `;
        return;
    }

    const tasksByDate = groupTasksByDate(tasks);

    const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(b) - new Date(a));

    sortedDates.forEach(dateStr => {
        const dateTasks = tasksByDate[dateStr];
        const dateSection = createDateSection(dateStr, dateTasks);
        tasksContainer.appendChild(dateSection);
    });
}

// Group tasks by their creation date
function groupTasksByDate(tasks) {
    const tasksByDate = {};

    tasks.forEach(task => {
        if (!task.dueDate) return;

        const taskDate = new Date(task.dueDate);
        const dateStr = taskDate.toISOString().split('T')[0];

        if (!tasksByDate[dateStr]) {
            tasksByDate[dateStr] = [];
        }

        tasksByDate[dateStr].push(task);
    });

    return tasksByDate;
}

function createDateSection(dateStr, tasks) {
    const section = document.createElement('div');
    section.className = 'mb-10';

    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const analytics = calculateDailyAnalytics(tasks);


    section.innerHTML = `
     <div class='flex items-center justify-between mb-2 mt-3'>
            <h2 class="text-xl font-bold mb-4">${formattedDate}</h2>
            <a href="../html/task-detail.html?dueDate='${date.toLocaleDateString()}'" class='text-sm sm:text-[16.5px] hover:text-orange-600'><i class="ri-links-line"></i></a>
     </div>
        <div class="bg-[var(--card-bg)] rounded-lg p-4 mb-4 shadow-md">
            <div class="flex flex-col space-y-1">
                <div class="flex justify-between">
                    <span class="text-purple-500 font-medium">Pending Tasks:</span>
                    <span class="text-purple-500 font-medium">${analytics.pending}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-blue-500 font-medium">In Progress Tasks:</span>
                    <span class="text-blue-500 font-medium">${analytics.inProgress}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-green-500 font-medium">Completed Tasks:</span>
                    <span class="text-green-500 font-medium">${analytics.completed}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-pink-500 font-medium">Task Progress:</span>
                    <span class="text-pink-500 font-medium">${analytics.progressPercentage}%</span>
                </div>
                <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <div class="flex justify-between">
                    <span class="text-orange-500 font-medium">Total Tasks:</span>
                    <span class="text-orange-500 font-medium">${analytics.total}</span>
                </div>
            </div>
            
        </div>

        <div class="task-cards-container space-y-4"> </div>
        
       
    `;


    const cardsContainer = section.querySelector('.task-cards-container');
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        cardsContainer.appendChild(taskElement);
    });

    return section;
}

function calculateDailyAnalytics(tasks) {
    const total = tasks.length;
    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    tasks.forEach(task => {
        if (task.status === 'completed') {
            completed++;
        } else if (task.status === 'in-progress') {
            inProgress++;
        } else {
            pending++;
        }
    });

    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
        total,
        completed,
        inProgress,
        pending,
        progressPercentage
    };
}

// Create a task element
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'p-5 rounded-lg bg-[var(--card-bg)]  shadow-md hover:shadow-lg transition-shadow border-2 border-gray-500/20 hover:border-purple-500 duration-300';

    const priorityClasses = {
        high: 'bg-red-500/10 text-red-600',
        medium: 'bg-green-500/10 text-green-600 ',
        low: 'bg-orange-500/10 text-orange-600'
    };

    const statusClasses = {
        'completed': 'bg-green-500/10 text-green-600',
        'in-progress': 'bg-blue-500/10 text-blue-600',
        'pending': 'bg-yellow-500/10 text-yellow-600'
    };

    let subtasksProgress = '';
    let subtasksList = '';
    if (task.subtasks && task.subtasks.length > 0) {
        const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;

        // Create subtasks list
        subtasksList = `
            <div class="mt-4 pt-3 border-t border-purple-100/30 ">
                <h4 class="font-medium mb-2 flex items-center gap-2">
                    <i class="ri-list-check text-purple-500"></i>
                    <span>Subtasks (${completedSubtasks}/${task.subtasks.length})</span>
                </h4>
                <ul class="space-y-2 pl-2 max-h-[250px] pr-2 py-3 overflow-y-auto">
                    ${task.subtasks.map(subtask => `
                        <li class="flex items-center gap-2 px-4 py-3 rounded-md bg-[var(--secondary-bg)] hover:bg-[var(--stat-bg)] duration-300">
                         <i class=" ${subtask.completed ? 'ri-checkbox-circle-fill text-green-500' : 'ri-circle-line text-[var(--text-gray)]'} mr-2  text-[16.5px] sm:text-[18px]"></i>
                            <span class="${subtask.completed ? 'line-through opacity-70' : ''} text-sm">${subtask.text}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        subtasksProgress = `
            <div class="mt-3">
                <div class="flex mb-2 justify-between text-sm text-[var(--text-gray)]">
                    <span>${completedSubtasks} of ${task.subtasks.length
            } completed</span>
                    <span>${Math.round((completedSubtasks / task.subtasks.length) * 100)}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div class="bg-green-600 h-1.5 rounded-full" style="width: ${(completedSubtasks / task.subtasks.length) * 100}%"></div>
                </div>
            </div>
        `;
    }
    const CreatedAt = new Date(task.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    const startedAt = new Date(task.startedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    const DueDate = new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    taskDiv.innerHTML = `
      <div>
    <div class="flex items-start gap-[4px] sm:gap-2">
        <div class="mt-1 w-5 h-5 flex-shrink-0 flex items-center justify-center">
             <i class=" ${task.status === 'completed' ? 'ri-checkbox-circle-fill text-green-500' : 'ri-circle-line text-[var(--text-gray)]'} mr-2  text-[16.5px] sm:text-[18px]"></i>
        </div>
        <div class="w-full">
            <div class="flex flex-wrap justify-between items-start gap-2 mb-[2px]">
                <h3 class="text-lg font-semibold ${task.status === 'completed' ? 'line-through opacity-70' : ''}">
                    ${task.text}</h3>

                <a href='../html/task-detail.html?taskId=${task.id}' class='text-[var(--text-gray)] duration-300 hover:text-indigo-600  text-[16.5px] sm:text-[18px]'><i class="ri-external-link-line"></i></a>    
            </div>

            ${task?.description ? `<p class="text-sm text-[var(--text-gray)] mb-3">${task?.description}</p>` :
            ''}
              <div class="flex items-center text-[var(--text-gray)] justify-end mt-2 font-normal text-sm sm:text-[14px] gap-2">
                                  ${task.status !== 'completed' ? getDueStatus(task.dueDate) : ''} 
                                    </div>
                 ${task?.tags?.length > 0 ? `<div id="detailTaskTags" class="flex flex-wrap gap-2 my-3">
                            ${task?.tags.map((tag) => {
                return `<div class="px-3 py-1 bg-zinc-500/10 rounded-lg duration-300  hover:bg-zinc-500/20">
                                <p class="text-xs sm:text-sm font-medium">#${tag}</p>
                            </div>`
            }).join(' ')}
                         </div>` : ''}
            <div class="rounded-lg py-3 mt-2">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 space-x-1.5 gap-2">

                        <div
                            class="p-3 rounded-xl border duration-300 border-purple-500/30 hover:border-purple-500 bg-purple-400/10">
                            <div>
                                <p class="text-xs sm:text-[16.5px] text-purple-500 mb-2 uppercase  font-semibold"> <i
                                        class="ri-calendar-line"></i>&nbsp; CREATED AT</p>
                                <p class="text-xs sm:text-sm  font-medium">${CreatedAt}</p>
                            </div>
                        </div>

                        <div
                            class="p-3 rounded-xl border duration-300 border-sky-500/30 hover:border-sky-500 bg-sky-400/10">
                            <div>
                                <p class="text-xs sm:text-[16.5px] text-sky-500 mb-2 uppercase  font-semibold"> <i
                                        class="ri-calendar-2-line"></i>&nbsp; Started AT</p>
                                <p class="text-xs sm:text-sm  font-medium">${startedAt}</p>
                            </div>
                        </div>
                        <div
                            class="p-3 bg-green-400/10 rounded-xl border duration-300 border-green-500/30 hover:border-green-500">
                            <div>
                                <p class="text-xs sm:text-[16.5px] text-green-500 mb-2 font-semibold"> <i
                                        class="ri-time-line"></i>&nbsp; DUE DATE</p>
                                <p class="text-xs sm:text-sm  font-medium">${DueDate}</p>
                            </div>
                        </div>
                  
                       
                        ${task.repeat ? `
                              <div
                            class="p-3 bg-orange-400/10 rounded-xl border duration-300 border-orange-500/30 hover:border-orange-500">
                            <div>
                                <p class="text-xs sm:text-[16.5px]  mb-2 text-orange-500 font-semibold">   <i class="ri-repeat-line"></i>&nbsp; REPEATED</p>
                                <p class="text-xs sm:text-sm  font-medium">${task.repeat.charAt(0).toUpperCase() + task.repeat.slice(1)}</p>
                            </div>
                        ` : ''}
                    
                    </div>
                       <div
                            class="p-3 rounded-xl border duration-300 border-pink-500/30 hover:border-pink-500 bg-pink-400/10">
                            <div>
                                <p class="text-xs sm:text-[16.5px] text-pink-500 mb-2 uppercase  font-semibold"> <i
                                        class="ri-calendar-2-line"></i>&nbsp; PRIORITY</p>
                                <p class="text-xs sm:text-sm  font-medium">${task?.priority?.charAt(0).toUpperCase() + task?.priority.slice(1)}</p>
                            </div>
                        </div>
                           <div
                            class="p-3 rounded-xl border duration-300 border-indigo-500/30 hover:border-indigo-500 bg-indigo-400/10">
                            <div>
                                <p class="text-xs sm:text-[16.5px] text-indigo-500 mb-2 uppercase font-semibold"> <i
                                        class="ri-calendar-2-line"></i>&nbsp; STATUS</p>
                                <p class="text-xs sm:text-sm  font-medium">${task.status === "completed" ? "Completed" : task.status === "in-progress" ? "In Progress" : "Pending"}</p>
                            </div>
                        </div>
                </div>
            </div>

            <section id="notesSection" class="mt-6 border-t border-[var(--text-gray)]/10 pt-4 mb-5">
            <h3 class="font-medium text-purple-500 text-[14px] sm:text-xl mb-3">
            Notes &amp; Documentation
            </h3>
            ${task.notes.length > 0 ?
            `       <div id="notesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-5 gap-6 mb-2">
                        ${task.notes.map(note => note.title ? createNoteCard(note, task) : '').join('')}
                    </div>` : '<p class="text-sm sm:text-[16px] italic text-[var(--text-gray)]">No notes available for this task.</p>'}
            </section>
        

             ${subtasksProgress}
            ${subtasksList}        

            <div class="flex justify-between flex-wrap gap-2 mt-3">
                ${task.category ? `
                <div
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full bg-cyan-500/10 text-cyan-600 ">
                    ${task.category}
                </div>` : ''}

                <div class="flex flex-wrap gap-1.5">
                    ${task.priority ? `<span
                        class="px-3 py-1.5  rounded-full text-xs sm:text-sm ${priorityClasses[task.priority] || ''}">
                        ${task?.priority?.charAt(0)?.toUpperCase() + task.priority?.slice(1)} Priority</span>` : ''}
                    ${task.status ? `<span
                        class="px-3 py-1.5  rounded-full text-xs sm:text-sm ${statusClasses[task.status] || ''}">${task.status
                === "completed" ? "Completed" : task.status === "in-progress" ? "In Progress" :
                "Pending"}</span>` : ''}
                </div>
            </div>
          
        </div>
    </div>
</div>
    `;

    return taskDiv;
}


// create a note card
function createNoteCard(note, task) {
    return `
        <div class="note-card bg-[var(--secondary-bg)] hover:bg-[var(--stat-bg)] duration-300 rounded-xl transition-all border-t-4 border-teal-500 overflow-hidden" data-note-id="note${note.id}">
            <div class="px-6 py-3">
                <div class="flex items-start justify-between mb-4">
                    <h3 class="text-lg font-semibold">${note.title}</h3>
                   
                </div>
                <p class="text-[var(--text-gray)] break-words line-clamp-3 whitespace-pre-line">${note.content}</p>
            </div>
            <div class="note-actions px-6 pb-3">
                <div class="flex justify-between w-full text-sm space-x-3">
                    <div class="text-[var(--text-gray)] flex items-center w-full justify-between">
                        <p>${new Date(note.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })}</p>
                    <button onclick="openNoteDetailsModal(${task.id}, ${note.id})" class="view-note-btn p-2 text-[var(--text-gray)] hover:text-green-600 hover:bg-green-500/10 rounded-lg transition-colors">
                        <i class="fa-solid fa-expand"></i>
                    </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.hidNoteDetailsModal = function () {
    let noteDetailModal = document.getElementById("noteDetailModal");
    noteDetailModal.classList.add("hidden");
    noteDetailModal.classList.remove("flex");
}

function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;

    return `${Math.floor(seconds / 86400)} days ago`;
}

// Event listeners for filters
statusFilter.addEventListener('change', () => {
    filters.status = statusFilter.value;
    renderFilteredTasks();
});

priorityFilter.addEventListener('change', () => {
    filters.priority = priorityFilter.value;
    renderFilteredTasks();
});

categoryFilter.addEventListener('change', () => {
    filters.category = categoryFilter.value;
    renderFilteredTasks();
});

subtaskFilter.addEventListener('change', () => {
    filters.subtask = subtaskFilter.value;
    renderFilteredTasks();
});

searchInput.addEventListener('input', () => {
    filters.search = searchInput.value.trim();
    renderFilteredTasks();
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    renderFilteredTasks();
});