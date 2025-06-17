import { generateDailyChartByType } from "../utils/dailyChart.js";
import { getDueStatus } from "../utils/dueStatus.js";
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

let tasks = [];

if (currentUser && currentUser.tasks) {
    tasks = currentUser.tasks;
}
let params = new URLSearchParams(window.location.search);
let id = params.get('taskId');
let dueDate = params.get('dueDate');

let task1 = tasks.filter(task => task.id === parseInt(id));
let task2 = tasks.filter(task => `'${new Date(task.dueDate).toLocaleDateString().toString()}'` == (dueDate));
let taskCardContainer = document.querySelector(".task-cards-container");
if (task1.length > 0) {
    renderTask(task1);
    document.querySelector(".chartContainer").classList.add("hidden");
} else if (task2.length > 0) {
    document.querySelector(".chartContainer").classList.remove("hidden");
    renderTask(task2);
    renderCategoryChart(task2);
    renderPriorityChart(task2);
    renderRepeatableChart(task2);
} else {
    taskCardContainer.innerHTML = `<div class="flex flex-col gap-2 text-[var(--text-gray)]"> 
    <h2 class="text-2xl font-semibold">No task found!</h2>
    <p class="text-[var(--text-gray)]/80">Please check the task ID or due date.</p>
    <p class="text-[var(--text-gray)]/80">If you are looking for a specific task, please check the task ID or due date.</p>

    </div>`;
}

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

// Render category distribution chart
function renderCategoryChart(tasks) {
    const categories = {};
    let dueDate = tasks[0].dueDate;
    tasks.forEach(task => {
        categories[task.category] = (categories[task.category] || 0) + 1;
    });
    if (Object.keys(categories).length === 0) {
        document.getElementById('categoryChartContainer').innerHTML = `<p class="text-[var(--text-gray)]">No tasks available to display category distribution.</p>`;
        return;
    }

    const ctx = document.getElementById('categoryChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    '#8b5cf6',
                    '#3b82f6',
                    '#ef4444',
                    '#22c55e',
                    '#f59e0b',
                    '#64748b',
                    '#a3a3a3',
                    '#f3f4f6',
                    '#e5e7eb',
                    '#d1d5db'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index'
                },
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: `Category Distribution for ${formatDate(dueDate)}`,
                    color: 'gray',
                    font: { size: 16, weight: 'bold' },
                    padding: 20
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

// Render priority distribution chart
function renderPriorityChart(tasks) {
    const priorities = {
        high: tasks.filter(task => task.priority === 'high').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        low: tasks.filter(task => task.priority === 'low').length
    };

    const ctx = document.getElementById('priorityChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                data: [priorities.high, priorities.medium, priorities.low],
                backgroundColor: ['#ef4444', '#4CAF50', '#FFC107']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: `Priority Distribution for ${formatDate(tasks[0].dueDate)}`,
                    color: 'gray',
                    font: { size: 16, weight: 'bold' },
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// task distribution by repeat
function renderRepeatableChart(tasks) {
    const repeatableTasks = tasks.filter(task => task.repeat);
    const dailyCount = repeatableTasks.filter(task => task.repeat === 'daily').length;
    const weeklyCount = repeatableTasks.filter(task => task.repeat === 'weekly').length;
    const monthlyCount = repeatableTasks.filter(task => task.repeat === 'monthly').length;
    const noneCount = repeatableTasks.filter(task => task.repeat === 'none').length;


    const ctx = document.getElementById('repeatableChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Daily', 'Weekly', 'Monthly', 'No Repeat'],
            datasets: [{
                data: [dailyCount, weeklyCount, monthlyCount, noneCount],
                backgroundColor: ['#8b5cf6', '#3b82f6', '#ef4444', '#22c55e']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value} tasks`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Repeatable Tasks Distribution for ${formatDate(tasks[0].dueDate)}`,
                    color: 'gray',
                    font: { size: 16, weight: 'bold' },
                    padding: 12
                }
            }

        }
    });

}


function returnTimeToCompleteTask(startedAt, completedAt) {
    if (!startedAt || !completedAt) return "N/A";
    const diffMs = new Date(completedAt) - new Date(startedAt);
    if (diffMs <= 0) return "N/A";

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(diffMins / (60 * 24));
    const hours = Math.floor((diffMins % (60 * 24)) / 60);
    const minutes = diffMins % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);

    return parts.join(', ');
}


// render tasks
function renderTask(tasks) {
    taskCardContainer.innerHTML = "";
    console.log(tasks)
    tasks.forEach((task) => {
        let { id, text, category, dueDate, createdAt, startedAt, editedAt, lastNotified, notes, priority, status, repeat, subtasks, hasSubtasks, description, tags, completedAt } = task;

        const fromatDueDate = new Date(dueDate).toLocaleDateString("en-US", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        document.querySelector("#taskDueDate").innerHTML = `${fromatDueDate}`;

        let ctx = document.getElementById("dailyDistributionChart").getContext("2d");


        generateDailyChartByType(ctx, new Date(dueDate), 'bar');
        const completedSubtask = hasSubtasks
            ? task.subtasks.filter((st) => st.completed).length
            : 0;
        const subtasksTotal = hasSubtasks ? task.subtasks.length : 0;
        taskCardContainer.innerHTML += `
         <div id="${id}"
                class="p-5 rounded-lg bg-[var(--card-bg)]  shadow-md hover:shadow-lg transition-shadow border-2 border-gray-500/20 hover:border-purple-500 duration-300">

                <div class="flex items-start gap-[4px] sm:gap-2">
                    <div class="mt-1 w-5 h-5 flex-shrink-0 flex items-center justify-center">
                        <i class="${status === 'completed' ? 'ri-checkbox-circle-fill text-green-500' : 'ri-circle-line text-[var(--text-gray)]'}  mr-2  text-[16.5px] sm:text-[18px]"></i>
                    </div>
                    <div class="w-full">
                        <div class="mb-[2px]">
                            <h3 class="text-lg font-semibold ${status === 'completed' ? 'line-through opacity-70' : ''}">${text}</h3>
                            <p class="text-[var(--text-gray)] text-xs sm:text-[16.5px]">${description || 'No description'}</p>
                        </div>
                        <div class="flex items-center text-[var(--text-gray)] justify-end mt-2 font-normal text-xs sm:text-[14px] gap-2">
                      ${task.status !== 'completed' ? getDueStatus(task.dueDate) : ''} 
                        </div>
                       ${tags?.length > 0 ? `<div id="detailTaskTags" class="flex flex-wrap gap-2 my-3">
                            ${tags.map((tag) => {
            return `<div class="px-3 py-1 bg-zinc-500/10 rounded-lg duration-300  hover:bg-zinc-500/20">
                                <p class="text-xs sm:text-sm font-medium">#${tag}</p>
                            </div>`
        }).join(' ')}
                         </div>` : ''}
                        <section class="rounded-lg py-3 mt-2">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 space-x-1.5 gap-[18px_12px]">

                                <div
                                    class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-purple-500">
                                    <div>
                                        <p class="text-sm sm:text-[18px] text-purple-500 mb-2 font-semibold">
                                            <i class="ri-calendar-line"></i>&nbsp; CREATED AT
                                        </p>
                                        <p class="text-xs sm:text-[16.5px]  font-medium">${formatedDate(createdAt)}</p>
                                    </div>
                                </div>

                                <div
                                    class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-fuchsia-500">
                                    <div>
                                        <p class="text-sm sm:text-[18px] text-fuchsia-500 mb-2 font-semibold">
                                            <i class="ri-calendar-2-line"></i>&nbsp; STARTED AT
                                        </p>
                                        <p class="text-xs sm:text-[16.5px]  font-medium">${formatedDate(startedAt)}</p>
                                    </div>
                                </div>

                                <div
                                    class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-green-500">
                                    <div>
                                        <p class="text-sm sm:text-[18px] mb-2 text-green-500 font-semibold">
                                            <i class="ri-timer-line"></i>&nbsp; DUE DATE
                                        </p>
                                        <p class="text-xs sm:text-[16.5px]  font-medium">${formatedDate(dueDate)}</p>
                                    </div>
                                </div>

                                
                                <div class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-indigo-500">
                                <div>
                                    <p class="text-xs sm:text-[16.5px] text-indigo-500 mb-2  font-semibold"> <i
                                                class="ri-calendar-line"></i>&nbsp; LAST COMPLETED</p>
                                    <p class="text-xs sm:text-sm  font-medium">${completedAt ? `${timeAgo(completedAt)}` : 'Not Completed yet'}</p>
                                </div>
                            </div>  

                                <div
                                    class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-teal-500">
                                    <div>
                                        <p class="text-sm sm:text-[18px] text-teal-500 mb-2 font-semibold">
                                            <i class="ri-time-line"></i>&nbsp; LAST EDITED
                                        </p>
                                        <p class="text-xs sm:text-[16.5px]  font-medium">${editedAt ? `${timeAgo(editedAt)}` : 'Not edited yet'}</p>
                                    </div>
                                </div>

                               <div
                                    class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-violet-500">
                                    <div>
                                        <p class="text-sm sm:text-[18px] text-violet-500 mb-2 font-semibold">
                                        
                                            <i class="ri-notification-3-line"></i>&nbsp; LAST NOTIFIED
                                        </p>
                                        <p class="text-xs sm:text-[16.5px] font-medium">${lastNotified ? `${timeAgo(lastNotified)}` : 'Not notified yet'}</p>
                                    </div>
                                </div>

                                <div
                                    class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-orange-500">
                                    <div>
                                        <p class="text-sm sm:text-[18px] mb-2 text-orange-500 font-semibold">
                                            <i class="ri-repeat-line"></i>&nbsp; REPEATED
                                        </p>
                                        <p class="text-xs sm:text-[16.5px]  font-medium">  ${repeat?.charAt(0).toUpperCase() + repeat.slice(1)}</p>
                                    </div>
                                </div>

                                <div
                                    class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-blue-500">
                                    <div>
                                        <p class="text-sm sm:text-[18px] mb-2 text-blue-500 font-semibold">
                                            <i class="ri-flashlight-line"></i>&nbsp; PRIORITY
                                        </p>
                                        <p class="text-xs sm:text-[16.5px] font-medium">${priority?.charAt(0).toUpperCase() + priority.slice(1)}</p>
                                    </div>
                                </div>

                                
                                <div
                                    class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-cyan-500">
                                    <div>
                                        <p class="text-sm sm:text-[18px] text-cyan-500 mb-2 font-semibold">
                                            <i class="ri-node-tree"></i>&nbsp; CATEGORY
                                        </p>
                                        <p class="text-xs sm:text-[16.5px]  font-medium">${category?.charAt(0).toUpperCase() + category.slice(1)}</p>
                                    </div>
                                </div>

                                <div
                                    class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-pink-500">
                                    <div>
                                        <p class="text-sm sm:text-[18px] mb-2 text-pink-500 font-semibold">
                                           <i class="ri-fire-line"></i>&nbsp; STATUS
                                        </p>
                                        <p class="text-xs sm:text-[16.5px] font-medium">${task.status === "completed" ? "Completed" : task.status === "in-progress" ? "In Progress" : "Pending"}</p>
                                    </div>
                                </div>
            

                                <div
                                    class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-fuchsia-500">
                                    <div>
                                        <p class="text-sm sm:text-[18px] text-fuchsia-500 mb-2 font-semibold">
                                          <i class="far fa-user"></i>&nbsp; CREATED BY
                                        </p>
                                        <p class="text-xs sm:text-[16.5px]  font-medium">${currentUser.name}</p>
                                    </div>
                                </div>

                                <div
                                    class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-red-500">
                                    <div>
                                        <p class="text-sm uppercase sm:text-[18px] text-red-500 mb-2 font-semibold">
                                          <i class="ri-hourglass-2-line"></i>&nbsp; Total Duration
                                        </p>
                                        <p class="text-xs sm:text-[16.5px]  font-medium">${status !== 'completed' ? 'Not Completed Yet' : returnTimeToCompleteTask(startedAt, completedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="notesSection" class="mt-6 border-t border-[var(--text-gray)]/10 pt-4">
                            <h3 class="font-medium text-purple-500 text-[14px] sm:text-xl mb-3">
                                Notes &amp; Documentation
                            </h3>
                        ${notes.length > 0
                ? `<div id="notesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-5 gap-6 mb-2">
                ${notes.map((note) => {
                    let { id, title, content, updatedAt, createdAt } = note;
                    return `  <div class="note-card bg-[var(--secondary-bg)] hover:bg-[var(--stat-bg)] duration-300 rounded-xl  transition-all border-t-4 border-teal-500 overflow-hidden"
                                    data-note-id="note0">
                                    <div class="px-6 py-3">
                                        <div class="flex items-start justify-between mb-4">
                                            <h3 class="text-lg font-semibold">${title}</h3>
                                        </div>

                                        <p class="text-[var(--text-gray)] break-words line-clamp-3 whitespace-pre-line">${content} </p>
                                    </div>
                                    <div class="note-actions px-6 pb-3">
                                        <div class="flex justify-between text-sm space-x-3">
                                            <div class="text-[var(--text-gray)]">
                                                <span>${formatedDate(createdAt)}</span>
                                            </div>
                                            <div class="flex items-center gap-1">
                                                <button onclick="openNoteDetailsModal(${task.id}, ${id})"
                                                    class="view-note-btn p-2 text-[var(--text-gray)] hover:text-green-600 hover:bg-green-500/10 rounded-lg transition-colors">
                                                    <i class="fa-solid fa-expand"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>`
                }).join(" ")}
                              
            </div>`
                : `<p class="text-[var(--text-gray)] italic">No notes available for this task.</p>`}    
                        </section>
                   
                        <section id="subtaskSection" class="mt-6 border-t border-[var(--text-gray)]/10 pt-4">
                            <h3 class="font-medium text-purple-500 text-[14px] sm:text-xl mb-3">
                                Subtasks
                            </h3>
                        ${hasSubtasks
                ? `   <div class="my-2.5">
                                <div
                                    class="flex  font-medium items-center justify-between text-xs sm:text-sm text-[var(--text-gray)] mb-1.5">
                                    <div class="flex my-1 items-center gap-3">
                                        <span>${completedSubtask} of ${subtasksTotal} completed</span>
                                    </div>
                                    <span>${Math.round(
                    (completedSubtask / subtasksTotal) * 100
                )}% complete</span>
                                </div>
                                <div class="h-1.5 my-1 bg-gray-200/50 rounded-md overflow-hidden">
                                    <div class="h-full bg-green-500 rounded-full transition-all duration-1000"
                                        style="width: ${(completedSubtask / subtasksTotal) * 100}%"></div>
                                </div>
                            </div>

                            <div id="subtasksDetailList" class="max-h-[300px] overflow-y-auto rounded-lg py-5 px-1">
                            ${subtasks.map((subtask, i) => {
                    let { id, text, completed } = subtask;

                    return ` <div id="${id}"
                                    class="pl-2 mb-2 duration-300 flex gap-2 bg-[var(--secondary-bg)] hover:bg-[var(--stat-bg)] py-4 rounded-md px-3">
                                    <i
                                        class="${completed ? 'ri-checkbox-circle-fill text-green-500' : 'ri-circle-line text-[var(--text-gray)]'}  mr-2  text-[16.5px] sm:text-[18px]"></i>
                                    <span class="${completed ? 'line-through opacity-70' : ''}">${i + 1}. &nbsp;${text}</span>
                                </div>`
                }).join(" ")}
                              
                            </div>`
                : `<p class="text-[var(--text-gray)] italic">No subtask available for this task.</p>`}
                        </section>
                        <div class="flex justify-between flex-wrap gap-2 mt-4">
                            <div
                                class="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full bg-cyan-500/10 text-cyan-600 ">
                                ${category?.charAt(0).toUpperCase() + category.slice(1)}
                            </div>
                            <div class="flex flex-wrap gap-1.5">
                                <span
                                    class="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${priorityClass(priority)}">
                                      ${priority?.charAt(0).toUpperCase() + priority.slice(1)} Priority</span>
                                <span
                                    class="px-3 py-1.5  rounded-full text-xs sm:text-sm font-medium ${statusClass(status)}"> ${task.status === "completed" ? "Completed" : task.status === "in-progress" ? "In Progress" : "Pending"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    });
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
    if (seconds < 60) return `${seconds} second${Math.floor(seconds) <= 1 ? '' : 's'} ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) <= 1 ? '' : 's'} ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) <= 1 ? '' : 's'} ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) <= 1 ? '' : 's'} ago`;
    if (seconds < 31104000) return `${Math.floor(seconds / 2592000)} month${Math.floor(seconds / 2592000) <= 1 ? '' : 's'} ago`;
    return `${Math.floor(seconds / 31104000)} year${Math.floor(seconds / 31104000) <= 1 ? '' : 's'} ago`;
}

// date formated
function formatedDate(date) {
    const newDate = new Date(date);
    const fromatDate = newDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    return fromatDate;
}

// status class 
function statusClass(status) {
    switch (status) {
        case "completed":
            return "bg-green-500/10 text-green-500";
        case "in-progress":
            return "bg-blue-500/10 text-blue-500";
        case "pending":
            return "bg-purple-500/10 text-purple-500";
        default:
            return "bg-yellow-500/10 text-yellow-500";
    }
}
function priorityClass(priority) {
    switch (priority) {
        case "high":
            return "bg-red-500/10 text-red-500";
        case "medium":
            return "bg-green-500/10 text-green-500";
        case "low":
            return "bg-yellow-500/10 text-yellow-500";
        default:
            return "bg-yellow-500/10 text-yellow-500";
    }
}
