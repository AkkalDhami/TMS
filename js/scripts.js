let currUser = JSON.parse(localStorage.getItem("users")) || [];
let tasks = [];
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (currentUser && currentUser.tasks) {
    tasks = currentUser.tasks;
}
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('projectId');
const wsId = urlParams.get('wsId');
let workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
let workspace = workspaces.find(w => w.id === wsId)
let project = workspace?.projects.find(p => p.id === projectId)
let currentFilter = "all";
let editingTaskId = null;
let alarmInterval = null;

console.log(projectId, wsId, workspace, project); // e.g., "12345"

document.addEventListener("DOMContentLoaded", () => {
    if (!currentUser || !currentUser.isLoggedIn) {
        window.location.href = "login.html";
    }
    if (currentUser && currentUser.isLoggedIn) {
        if (
            window.location.pathname.includes("login.html") ||
            window.location.pathname.includes("signup.html")
        ) {
            window.location.href = "todo.html";
        }
    }
    loadTasks();

    checkDueDates();
    setInterval(checkDueDates, 60000);
});

let voiceModal = document.getElementById("voiceModal");
const voiceOutput = document.getElementById("voiceOutput");
let finalTranscript = "";
let activeInputId = ""; // Track which input field we're updating

// Check for browser support
if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    alert("Speech Recognition not supported in this browser.");
}

// Main function to start voice recognition for any input field
function speak(inputId) {
    activeInputId = inputId;

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';

    voiceModal.classList.remove("hidden");
    voiceModal.classList.add("flex");
    recognition.onresult = function (event) {
        finalTranscript = event.results[0][0].transcript;
        voiceOutput.innerText = finalTranscript;
        console.log("Transcript:", finalTranscript);
    };

    recognition.onerror = function (event) {
        console.error("Speech recognition error:", event.error);
        if (event.error === "network") {
            voiceOutput.innerText = "Please check your internet connection and try again.";
        } else if (event.error === "not-allowed") {
            voiceOutput.innerText = "Please allow microphone access.";
        } else {
            voiceOutput.innerText = "Permission denied or unknown error.";
        }
    };

    recognition.start();
}


// Apply the result to the correct input field
function applyVoiceScript() {
    if (finalTranscript && activeInputId) {
        const inputEl = document.getElementById(activeInputId);
        if (inputEl) {
            inputEl.value += finalTranscript;
            inputEl.focus();
        }
    }
    voiceOutput.innerText = "Listening for your command...";
    finalTranscript = "";
    closeVoiceModal();
}


function closeVoiceModal() {
    voiceModal.classList.add("hidden");
    voiceModal.classList.remove("flex");
    voiceOutput.innerText = "Listening for your command...";
    finalTranscript = "";
}

let tags = [];
let tagsContainer = document.getElementById("tagsContainer");
function addTaskTag() {
    const taskTags = document.getElementById("taskTags").value.trim();
    if (taskTags) {
        tags.push(taskTags);
        tagsContainer.innerHTML = "";
        tags.forEach((tag, i) => {
            tagsContainer.innerHTML += `  <div id="${i}"
                    class="tag bg-[var(--card-bg)] text-[var(--text-color)] border-2 border-gray-500/60 rounded-lg hover:border-purple-500 duration-200 px-3 py-1">
                    <span class="tag-name">#${tag}</span>
                    <span class="remove-tag pl-2 cursor-pointer hover:text-red-500" onclick="removeTags(${i})">
                      <i class="fa-solid fa-xmark"></i>
                    </span>
                  </div>`;
        })
        document.getElementById("taskTags").value = "";
    }
    return;
}

function removeTags(ind) {
    tags.splice(ind, 1);
    tagsContainer.innerHTML = "";
    tags.forEach((tag, i) => {
        tagsContainer.innerHTML += `  <div id="${i}"
                class="tag bg-[var(--card-bg)] text-[var(--text-color)] border-2 border-gray-500/60 rounded-lg hover:border-purple-500 duration-200 px-3 py-1">
                <span class="tag-name">#${tag}</span>
                <span class="remove-tag pl-2 cursor-pointer hover:text-red-500" onclick="removeTags(${i})">
                  <i class="fa-solid fa-xmark"></i>
                </span>
              </div>`;
    })
}

document.getElementById("toDoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    addTask();
    tagsContainer.innerHTML = "";
    tags = [];
});


document.querySelectorAll(".filter-btn").forEach((btn) => {
    if (btn.dataset.filter === currentFilter)
        btn.classList.add("active", "bg-purple-600", "text-white");
    btn.addEventListener("click", () => {
        document
            .querySelector(".filter-btn.active")
            .classList.remove("active", "bg-purple-600", "text-white");
        btn.classList.add("active", "bg-purple-600", "text-white");
        currentFilter = btn.dataset.filter;
        loadTasks();
    });
});

document.getElementById("sortSelect").addEventListener("change", loadTasks);



document
    .getElementById("taskTags")
    .addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.stopPropagation();
            e.preventDefault();
            addTaskTag();
            console.log("Tags:", tags);
        }
    });

function addTask() {
    const taskInput = document.getElementById("taskInput");
    const categorySelect = document.getElementById("categorySelect");
    const prioritySelect = document.getElementById("prioritySelect");
    const dueDateInput = document.getElementById("dueDateInput");
    const startDateInput = document.getElementById("startDateInput");
    const remainderInput = document.getElementById("remainderSelect");
    const taskText = taskInput.value.trim();
    const repeatSelect = document.getElementById("repeatSelect");
    const taskDescription = document.getElementById("taskDescription");
    const dueDateValue = dueDateInput.value;
    const remainderInputValue = remainderInput.value;

    if (categorySelect.value === "") {
        showToast("Please select a category.", "error");
        return;
    } else if (prioritySelect.value === "") {
        showToast("Please select a priority.", "error");
        return;
    } else if (!startDateInput.value) {
        showToast("Please select a valid starting date.", "error");
        return;
    }
    else if (!dueDateValue) {
        showToast("Please select a valid due date.", "error");
        return;
    }
    else if (repeatSelect.value === "") {
        showToast("Please select a repeat option.", "error");
        return;
    } else if (!taskText) {
        showToast("Please enter a valid task title", "error");
        return;
    } else if (remainderInput.value === "") {
        showToast("Please select a remainder.", "error");
        return;
    } else if (taskDescription.value.trim() === "") {
        showToast("Please enter a valid task description", "error");
        return;
    }
    else {
        const task = {
            id: Date.now(),
            text: taskText,
            description: taskDescription.value.trim(),
            status: "pending",
            subtasks: [],
            remainder: remainderInputValue * 60,
            category: categorySelect.value,
            priority: prioritySelect.value,
            createdAt: new Date().toISOString(),
            startedAt: new Date(startDateInput.value).toISOString(),
            dueDate: new Date(dueDateValue).toISOString(),
            repeat: repeatSelect.value,
            lastNotified: null,
            notes: [],
            editedAt: null,
            completedAt: null,
            tags: tags,
        };

        let existingTask = tasks.find(
            (t) => t.text === taskText && t.category === categorySelect.value
        );
        if (existingTask) {
            if (existingTask.repeat === "none") {
                showToast("Task already exists.", "error");
                return;
            } else {
                resetRepeatingTask(existingTask);
                showToast("Task added successfully!", "success");
                saveTasks();
                loadTasks();
            }
        }

        tasks.unshift(task);
        saveTasks();
        loadTasks();

        taskInput.value = "";
        dueDateInput.value = "";
        categorySelect.value = "";
        prioritySelect.value = "";
        taskDescription.value = "";

        showToast("Task added successfully!", "success");
    }
}

function returnTaskRepeation(task) {
    switch (task.repeat) {
        case "none":
            return "Repeated None";
        case "daily":
            return "Repeated Daily";
        case "weekly":
            return "Repeated Weekly";
        case "monthly":
            return "Repeated Monthly";
        case "yearly":
            return "Repeated Yearly";
        default:
            return "No Repeat";
    }
}


function loadTasks() {
    const taskList = document.getElementById("taskLists");
    let cardViewContainer = document.querySelector("#cardViewContainer div");
    if (!taskList) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = tasks.dueDate ? new Date(tasks.dueDate) : null;
    if (dueDate) dueDate.setHours(0, 0, 0, 0);
    let taskCount = document.getElementById("taskCount");
    let filteredTasks = tasks.filter((task) => {
        switch (currentFilter) {
            case 'all':
                taskCount.textContent = `All Tasks: ${tasks.length}`
                return true
            case 'pending':
                taskCount.textContent = `Pending Tasks: ${tasks.filter(task => task.status === "pending").length}`
                return task.status === "pending"
            case 'completed':
                taskCount.textContent = `Completed Tasks: ${tasks.filter(task => task.status === "completed").length}`
                return task.status === "completed"
            case 'in-progress':
                taskCount.textContent = `In Progress Tasks: ${tasks.filter(task => task.status === "in-progress").length}`
                return task.status === "in-progress"
            case 'overdue':
                taskCount.textContent = `Overdue Tasks: ${tasks.filter(task => new Date(task.dueDate) < today && task.status !== "completed").length}`
                return new Date(task.dueDate) < today && task.status !== "completed";
            case 'today':
                taskCount.innerHTML = `
                 Today's Tasks: ${tasks.filter(task => new Date(task.dueDate).toDateString() === new Date().toDateString()).length} 
                  <div class="font-medium text-xs sm:text-sm mt-2">
                        <span class="text-orange-500">NOTE: </span>
                        <span class="text-green-500">Tasks are categorized according to their assigned due dates.</span>
                  </div> `
                return (
                    new Date(task.dueDate).toDateString() === new Date().toDateString()
                );
            case 'with-subtask':
                taskCount.textContent = `Tasks with subtask: ${tasks.filter(task => task.subtasks.length > 0).length}`
                return task.subtasks.length > 0;
            case 'without-subtask':
                taskCount.textContent = `Tasks without subtask: ${tasks.filter(task => task.subtasks.length === 0).length}`
                return task.subtasks.length === 0;

            default:
        }

    });

    const sortMethod = document.getElementById("sortSelect").value;

    filteredTasks.sort((a, b) => {
        if (sortMethod === "date-desc")
            return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortMethod === "date-asc")
            return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortMethod === "priority") {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        if (sortMethod === "due-date")
            return new Date(a.dueDate) - new Date(b.dueDate);
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = "";
        cardViewContainer.innerHTML = "";
        let html = `
            <li class="flex flex-col items-center justify-center py-10 text-center">
                <div class="w-16 h-16 mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <i class="ri-calendar-todo-line text-3xl text-purple-500"></i>
                </div>
                <span class="text-xl font-semibold text-[var(--text-color)] mb-2">No tasks available</span>
                <p class="text-[var(--text-gray)] max-w-md">Add a new task using the form above to get started with your productivity journey.</p>
            </li>`;
        taskList.innerHTML = html;
        document.querySelector("#tasksTableView").innerHTML = `
            
                <td colspan="8" class="py-4 px-4 text-center flex flex-col items-center justify-center text-[var(--text-gray)]">
                    <div class="w-16 h-16 mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <i class="ri-calendar-todo-line text-3xl text-purple-500"></i>
                </div>
                <span class="text-xl font-semibold text-[var(--text-color)] mb-2">No tasks available</span>
                <p class="text-[var(--text-gray)] max-w-md">Add a new task using the form above to get started with your productivity journey.</p>
                </td>
        `;
        cardViewContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 text-center">
                <div class="w-16 h-16 mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <i class="ri-calendar-todo-line text-3xl text-purple-500"></i>
                </div>
                <span class="text-xl font-semibold text-[var(--text-color)] mb-2">No tasks available</span>
                <p class="text-[var(--text-gray)] max-w-md">Add a new task using the form above to get started with your productivity journey.</p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = "";
    cardViewContainer.innerHTML = "";


    filteredTasks.forEach((task) => {
        const dueDate = new Date(task.dueDate);
        const formattedDate = dueDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        const createdAt = new Date(task.createdAt);
        const formattedCreatedAt = createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        // Status class
        let statusClass = "";
        switch (task.status) {
            case "completed":
                statusClass = "text-green-500";
                break;
            case "in-progress":
                statusClass = "text-blue-500";
                break;
            case "pending":
                statusClass = "text-yellow-500";
                break;
            default:
                statusClass = "text-yellow-500";
                break;
        }

        const hasSubtasks = task.subtasks && task.subtasks.length > 0;
        const subtasksCompleted = hasSubtasks
            ? task.subtasks.filter((st) => st.completed).length
            : 0;
        const subtasksTotal = hasSubtasks ? task.subtasks.length : 0;

        const li = document.createElement("li");
        li.className = `task-item bg-[var(--secondary-bg)] transform hover:translate-y-[-4px] relative py-3 mb-4 ring-l-2 rounded-xl border-l-5 ${task.status === "completed"
            ? "border-green-500"
            : task.status === "in-progress"
                ? "border-blue-500"
                : "border-purple-500"
            }  backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`;
        li.dataset.taskId = task.id;

        li.addEventListener("click", (e) => {
            if (
                e.target === li ||
                e.target.classList.contains("task-text") ||
                e.target.classList.contains("task-details")
            ) {
                showTaskDetailsModal(task.id);
            }
        });

        li.innerHTML = `
   
            <div class="flex h-full items-start p-2 sm:p-4 gap-2 sm:gap-3 relative">
            
                    <div class="pt-2">
                        <input type="checkbox" ${task.status === "completed" ? "checked" : ""} onchange="toggleTask(${task.id})" 
                            class="sm:h-4.5 w-4 sm:w-4.5 h-4 cursor-pointer accent-purple-500 rounded-full">
                    </div>
               
                <div class="flex-grow task-details">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                     <div class="flex-grow">
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <h3 class="task-text line-clamp-1 text-[17px] font-medium ${task.status === "completed" ? "line-through opacity-70" : ""}  text-[var(--text-color)] hover:text-purple-500 transition-colors cursor-pointer">
                                ${task.text}
                            </h3>
                             <button onclick='toggleLockTask(this)' class="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500 text-sm sm:text-xl rounded-md">
                            ${new Date() >= new Date(task?.startedAt) ? '<i class="ri-lock-unlock-line"></i>' : '<i class="ri-lock-line"></i>'}
                            </button>
                        </div>    
                         <p class="text-xs line-clamp-1 sm:text-sm opacity-70 my-1">${task?.description === undefined ? " " : task.description}</p>
                        <div class="flex flex-wrap text-xs sm:text-sm items-center justify-between">
                          <div class="flex flex-wrap text-xs sm:text-sm items-center gap-4">
                                <span class="flex items-center opacity-70 gap-1 py-1 rounded-full font-medium whitespace-nowrap">
                                   Due: ${formattedDate}
                                </span>
                                <span class="font-medium ${task.priority === "high"
                ? "text-red-500"
                : task.priority === "medium"
                    ? " text-green-500"
                    : "text-yellow-500"
            }"> 
                                <i class="ri-flag-line mr-[2px]"></i>
                                 ${task.priority?.charAt(0).toUpperCase() +
            task.priority?.slice(1)
            } Priority
                                </span>
                          </div>
                          <div class="flex items-center gap-1">
                                <span class="text-xs font-medium ">
                    ${task.status !== 'completed' ? getDueStatus(task.dueDate) : ''}
                               </span>
                          </div>
                        </div>
                     </div>
                    </div>
                    
                    ${hasSubtasks
                ? `
                    <div class="my-2.5">
                        <div class="flex  font-medium items-center justify-between text-xs sm:text-sm text-[var(--text-gray)] mb-1.5">
                          <div class="flex my-1 items-center gap-3">
                                <span><i class="ri-node-tree"></i> ${subtasksCompleted}/${subtasksTotal} subtasks</span>
                          </div>
                            <span>${Math.round(
                    (subtasksCompleted / subtasksTotal) * 100
                )}% complete</span>
                        </div>
                        <div class="h-1.5 my-1 bg-gray-200/50 rounded-md overflow-hidden">
                            <div class="h-full bg-green-500 rounded-full transition-all duration-1000" 
                                style="width: ${(subtasksCompleted / subtasksTotal) * 100
                }%"></div>
                        </div>
                        
                    </div>
                    `
                : ""
            }
                    
                    <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center gap-1">
                            <button onclick="breakdownTask(${task.id})" 
                                class="text-purple-500 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/15 transition-colors" 
                                title="Break down task">
                             <i class="ri-list-check-2"></i>
                            </button>
                            <button onclick="openEditModal(${task.id})" 
                                class="text-blue-500 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg bg-blue-500/10  hover:bg-blue-500/15 transition-colors" 
                                title="Edit task">
                              <i class="ri-edit-line"></i>
                            </button>
                            <button onclick="handleDelete(${task.id})" 
                                class="text-red-500 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg bg-red-500/10  hover:bg-red-500/15 transition-colors" 
                                title="Delete task">
                        <i class="ri-delete-bin-line"></i>
                            </button>
                            <button onclick="showTaskDetailsModal(${task.id})"
                                class="text-orange-500 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg bg-orange-500/10  hover:bg-orange-500/15 transition-colors"
                                title="View task details">
                                <i class="ri-external-link-line"></i>
                            </button>
                 
                            <button onclick="openNotesModal(${task.id})"
                                class="text-teal-500 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg bg-teal-500/10  hover:bg-teal-500/15 transition-colors"
                                title="Add notes">
                                <i class="ri-sticky-note-add-line"></i>
                            </button>


                        </div>
                         <div class="text-xs sm:text-sm font-medium ${statusClass}  px-2 py-1 rounded-full">
                             ${task.status === "completed" ? "Completed" : task.status === "in-progress" ? "In Progress" : "Pending"}
                         </div>
                    </div>
                </div>
            </div>
            
             

            ${hasSubtasks
                ? `
            <div class="subtasks-container max-h-[300px] overflow-y-auto px-1.5 sm:px-4 pb-3 pt-0 ml-8 mr-4">
                <div class="subtasks-list space-y-2 mt-1">
                    ${task.subtasks
                    .map(
                        (subtask, i) => `
                        <div class="subtask-item bg-[var(--card-bg)] hover:bg-[var(--stat-bg)] duration-300 flex items-center gap-2 p-2 pl-3 justify-between rounded-md border-l-3 ${subtask.completed
                                ? " border-green-500 "
                                : " border-purple-500 "
                            } 
                            transition-colors duration-300">
                        <div class="flex items-center gap-2">
                                <input type="checkbox" ${subtask.completed ? "checked" : ""
                            }  onchange="toggleSubtaskFromList(${task.id
                            }, ${subtask.id})" 
                                    class="h-3 w-3 cursor-pointer accent-purple-500 rounded-full">
                                <span class="text-sm ${subtask.completed
                                ? "line-through text-[var(--text-gray)]"
                                : "text-[var(--text-color)]"
                            }">
                                  ${i + 1}. &nbsp;${subtask.text}
                               </span>
                          </div>
                         <div class="flex text-[var(--text-gray)] items-center gap-1 sm:gap-3">
                              <button onclick="editSubtask(${task.id}, ${subtask.id
                            })" 
                                class="p-1.5 rounded-lg  hover:text-blue-500 transition-colors" 
                                title="Edit subtask">
                              <i class="ri-edit-line"></i>
                            </button>
                            <button onclick="removeSubtask(${task.id}, ${subtask.id
                            })" 
                                class="p-1.5 rounded-lg  hover:text-red-500 transition-colors" 
                                title="Delete subtask">
                        <i class="ri-delete-bin-line"></i>
                            </button>
                         </div>
                    </div>
                    `
                    )
                    .join("")}
                </div>
            </div>
            `
                : ""
            }
        `;

        taskList.appendChild(li);
        tableView(filteredTasks);

        let card = document.createElement("div");
        card.className = `rounded-[1.5rem] relative bg-[var(--secondary-bg)] shadow-2xl px-3 sm:px-5 py-4 sm:py-6 space-y-6  border-2 border-gray-500/30 hover:border-purple-500 duration-300`;

        card.innerHTML = `
        
              <div class="space-y-1.5">
                <div class="flex items-center">
                  <input  onchange="toggleTask(${task.id})"  type="checkbox" ${task.status === "completed" ? "checked" : ""
            } class="mr-3 w-4 h-4 accent-purple-500 cursor-pointer">
                  <span class="font-medium text-[var(--text-color)] ${task.status === "completed" ? "line-through opacity-70" : ""
            } ">${task.text}</span>
                </div>
                  <p class="text-xs pl-8 sm:text-sm opacity-70 line-clamp-1 my-1">${task?.description === undefined ? " " : task.description}</p>
                <div class="flex mt-3 justify-between  items-center">
                  <span class="px-3 py-1 bg-teal-500/10 text-teal-600 rounded-full text-xs sm:text-sm font-medium">
                    ${task.category?.charAt(0)?.toUpperCase() + task.category?.slice(1)}
                  </span>
                  <span class="text-xs sm:text-sm text-cyan-500">Repeated ${task?.repeat?.charAt(0)?.toUpperCase() +
            task.repeat?.slice(1)
            }</span>

                </div>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div
                  class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-purple-500">
                  <div>
                    <p class="text-xs sm:text-sm  mb-2 text-[var(--text-gray)] font-semibold">CREATED AT</p>
                    <p class="text-xs sm:text-sm  font-medium">${formattedCreatedAt}</p>
                  </div>
                </div>
                <div
                  class="p-3 bg-[var(--secondary-bg)] rounded-xl border duration-300 border-gray-500/30 hover:border-purple-500">
                  <div>
                    <p class="text-xs sm:text-sm  mb-2 text-[var(--text-gray)] font-semibold">DUE DATE</p>
                    <p class="text-xs sm:text-sm  font-medium">${formattedDate}</p>
                  </div>
                </div>
              </div>

            ${hasSubtasks
                ? `<div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-[var(--text-gray)]">${subtasksCompleted} of ${task.subtasks.length
                } completed</span>
                  <span class="text-sm text-[var(--text-gray)]">${Math.floor(
                    (subtasksCompleted / subtasksTotal) * 100
                )}%</span>
                </div>
                <div class="relative">
                  <div class="h-2 bg-gray-300/50 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 rounded-full" style="width: ${(subtasksCompleted / subtasksTotal) * 100
                }%"></div>
                  </div>
                </div>


                <div class="mt-3 max-h-[150px] overflow-y-auto space-y-2">
                 ${task.subtasks
                    .map(
                        (subtask, i) =>
                            ` <div class="subtask-item bg-[var(--card-bg)] hover:bg-[var(--stat-bg)] duration-300 flex items-center gap-2 p-2 pl-3 pr-2 justify-between rounded-md border-l-3  ${subtask.completed
                                ? " border-green-500 "
                                : " border-purple-500 "
                            }  
                        transition-colors">
                    <div class="flex items-center gap-2">
                      <input type="checkbox" ${subtask.completed ? "checked" : ""
                            } onchange="toggleSubtaskFromList(${task.id}, ${subtask.id
                            })"
                        class="h-3 w-3 cursor-pointer accent-purple-500 rounded-full">
                      <span class="text-sm ${subtask.completed ? "line-through opacity-70" : ""
                            } text-[var(--text-gray)]">
                     ${i + 1}. &nbsp;${subtask.text}
                      </span>
                    </div>
                    <div class="flex text-[var(--text-gray)] items-center ">
                      <button onclick="editSubtask(${task.id}, ${subtask.id})"
                        class="p-1.5 rounded-lg  hover:text-blue-500 transition-colors" title="Edit subtask">
                        <i class="ri-edit-line"></i>
                      </button>
                      <button onclick="removeSubtask(${task.id}, ${subtask.id})"
                        class="p-1.5 rounded-lg  hover:text-red-500 transition-colors" title="Delete subtask">
                        <i class="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>`
                    )
                    .join("")}

                </div>
              </div>`
                : " "
            }

              <div class="flex  items-center justify-between pt-3 border-t border-gray-600/30">
                <div class="flex items-center gap-3">
                  <div class="px-3 py-1.5 ${task.priority === "low"
                ? "bg-yellow-500/10 text-yellow-600"
                : task.priority === "medium"
                    ? "bg-green-500/10 text-green-600"
                    : "bg-red-500/10 text-red-600"
            } rounded-full text-xs sm:text-sm font-medium">
                    ${task?.priority?.charAt(0)?.toUpperCase() +
            task.priority?.slice(1)
            } Priority
                  </div>

                  <div
                    class="flex items-center gap-1 px-3 py-1.5 ${task.status === "completed"
                ? "bg-green-500/10 text-green-500"
                : task.status === "in-progress"
                    ? "bg-blue-500/10 text-blue-500"
                    : "bg-yellow-500/10 text-yellow-500"
            } rounded-full text-xs sm:text-sm font-medium">
                   ${task.status === "completed" ? "Completed" : task.status === "in-progress" ? "In Progress" : "Pending"}
                  </div>
                </div>
                <div class="flex items-center  gap-2">
                  <button onclick="toggleDropdown(event)" class="p-2 hover:bg-[var(--stat-bg)] rounded-full cursor-pointer text-[var(--text-gray)]">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  <div
                    class="z-10 dropdown-menu flex-col hidden absolute bg-[var(--card-bg)] bottom-[1rem] right-[3.8rem] rounded-lg border border-gray-500/30 py-2 px-3">
                    <button onclick="openSubtaskDetailsModal(${task.id})"
                      class="text-cyan-500 p-2 text-start  hover:bg-[var(--stat-bg)] transition-all"
                      title="View subtasks">
                      <i class="ri-list-check-2"></i>
                      View Subtasks
                    </button>
                    <button onclick="breakdownTask(${task.id})"
                      class="text-purple-500 p-2 text-start  hover:bg-[var(--stat-bg)] transition-all"
                      title="Break down task">
                      <i class="ri-node-tree"></i>
                      Add Subtask
                    </button>
                    <button onclick="openNotesModal(${task.id})"
                      class="text-green-500 p-2 text-start  hover:bg-[var(--stat-bg)] transition-all" title="Add note">
                      <i class="ri-sticky-note-line"></i>
                      Add Note
                    </button>

                    <button onclick="handleDelete(${task.id})"
                      class="text-red-500 p-2 text-start  hover:bg-[var(--stat-bg)] transition-all" title="Delete task">
                      <i class="ri-delete-bin-line"></i>
                      Delete Task
                    </button>
                    <button onclick="openEditModal(${task.id})"
                      class="text-blue-500 p-2 text-start hover:bg-[var(--stat-bg)] transition-all" title="Edit task">
                      <i class="ri-edit-line"></i>
                      Edit Task
                    </button>
                    <button onclick="showTaskDetailsModal(${task.id})"
                      class="text-orange-500 p-2 text-start hover:bg-[var(--stat-bg)] transition-all" title="View task">
                      <i class="ri-external-link-line"></i>
                      View More
                    </button>

                  </div>
                </div>

              </div>
        `;

        cardViewContainer.appendChild(card);
    });
}

function toggleSubtaskFromList(taskId, subtaskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;
    console.log("taskId: ", taskId, "subtaskId: ", subtaskId);

    const subtask = task.subtasks.find((st) => st.id === subtaskId);
    if (!subtask) return;

    currentParentTaskId = taskId;

    subtask.completed = !subtask.completed;

    const allCompleted = task.subtasks.every((st) => st.completed);
    const anyCompleted = task.subtasks.some((st) => st.completed);
    task.status = allCompleted
        ? "completed"
        : anyCompleted
            ? "in-progress"
            : "pending";
    if (task.status === "completed" && task.repeat !== "none") {
        resetRepeatingTask(task);
        showToast("Task completed! Reset for next occurrence.", "success");
    }

    // console.log(task, subtask);

    saveTasks();
    loadTasks();


    renderSubtaskDetails();

    showToast(
        subtask.completed
            ? "Subtask completed successfully!"
            : "Subtask marked as incomplete",
        "success"
    );
}

function toggleLockTask(thiss) {
    let cls = thiss.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.classList.toggle('pointer-events-none') && thiss.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.classList.toggle('opacity-50')
    return cls;

}

function getDueStatus(dueDateStr) {
    const now = new Date();
    const dueDate = new Date(dueDateStr);
    const diffMs = dueDate - now;
    const isOverdue = diffMs < 0;
    const diff = Math.abs(diffMs);


    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    if (isOverdue) {
        if (days === 0 && hours === 0) {
            return `❌ Overdue by ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (days === 0) {
            return `❌ Overdue by ${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            return `❌ Overdue by ${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
        }
    } else {
        if (days === 0 && hours === 0 && minutes <= 1) {
            return `🟡 Due very soon`;
        } else if (days === 0 && hours === 0) {
            return `🕐 Due in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (days === 0) {
            return `⏳ Due in ${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (days === 1) {
            return `📅 Due tomorrow (${hours}h ${minutes}m remaining)`;
        } else {
            return `📆 Due in ${days} days, ${hours} hour${hours !== 1 ? 's' : ''}`;
        }
    }
}

function renderTaskDisplayButtons() {
    let taskDisplayBtns = document.querySelector("#taskDisplayBtns");
    if (taskDisplayBtns) {
        taskDisplayBtns.addEventListener("click", (e) => {
            taskDisplayBtns.querySelectorAll("button").forEach((btn) => {
                btn.classList.remove("active");
            });
            e.target.classList.add("active");
            e.target.closest("button").classList.add("active");

            if (
                e.target.closest("button").dataset.view === "tableView" ||
                e.target.dataset.view === "tableView"
            ) {
                document.querySelector(".table-view").classList.remove("hidden");
                document.querySelector("#taskLists").classList.add("hidden");
                document.querySelector("#cardViewContainer").classList.add("hidden");
            }
            if (
                e.target.closest("button").dataset.view === "listView" ||
                e.target.dataset.view === "listView"
            ) {
                document.querySelector("#taskLists").classList.remove("hidden");
                document.querySelector(".table-view").classList.add("hidden");
                document.querySelector("#cardViewContainer").classList.add("hidden");
            }
            if (
                e.target.closest("button").dataset.view === "cardView" ||
                e.target.dataset.view === "cardView"
            ) {
                document.querySelector("#cardViewContainer").classList.remove("hidden");
                document.querySelector(".table-view").classList.add("hidden");
                document.querySelector("#taskLists").classList.add("hidden");
            }
        });
    }
}
renderTaskDisplayButtons();

function tableView(filteredTasks) {
    const tasksTableView = document.getElementById("tasksTableView");
    if (!tasksTableView) {
        console.error("tasksTableView element not found");
        return;
    }
    tasksTableView.innerHTML = "";
    filteredTasks.forEach((task) => {
        const row = document.createElement("tr");
        row.className = "task-text hover:bg-[var(--stat-bg)] duration-300";
        row.dataset.taskId = task.id;

        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);

        const formattedDate = dueDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });


        let priorityClass = "";
        switch (task.priority) {
            case "high":
                priorityClass = "bg-red-500/10 text-red-500";
                break;
            case "medium":
                priorityClass = "bg-blue-500/10 text-blue-500";
                break;
            case "low":
                priorityClass = "bg-yellow-500/10 text-yellow-500";
                break;
        }

        // Repeat class
        let repeatClass = "";
        switch (task.repeat) {
            case "daily":
                repeatClass = "bg-green-500/10 text-green-500";
                break;
            case "weekly":
                repeatClass = "bg-blue-500/10 text-blue-500";
                break;
            case "monthly":
                repeatClass = "bg-purple-500/10 text-purple-500";
                break;
            default:
                repeatClass = "bg-yellow-500/10 text-yellow-500";
                break;
        }

        // Status class
        let statusClass = "";
        switch (task.status) {
            case "completed":
                statusClass = "bg-green-500/10 text-green-500";
                break;
            case "in-progress":
                statusClass = "bg-blue-500/10 text-blue-500";
                break;
            case "pending":
                statusClass = "bg-yellow-500/10 text-yellow-500";
                break;
            default:
                statusClass = "bg-yellow-500/10 text-yellow-500";
                break;
        }


        const priorityDisplay = task.priority
            ? `${task.priority?.charAt(0).toUpperCase() + task.priority.slice(1)}`
            : "Normal";
        row.innerHTML = `
              <td class="py-4 px-4">
              <div class="flex items-center">
                        <input type="checkbox" onchange="toggleTask(${task.id
            })"  class="mr-3 accent-purple-500 cursor-pointer" ${task.status === "completed" ? "checked" : ""
            }>
                        <span class="font-medium text-[var(--text-color)] ${task.status === "completed"
                ? "line-through text-[var(--text-gray)]"
                : ""
            }">${task.text.length > 16 ? task.text.slice(0, 16) + '....' : task.text}</span>
                    </div>
              </td>
              <td class="py-4 px-4">
                  <span class="task-category">${task?.description?.length > 26 ? task?.description?.slice(0, 26) + '....' : task?.description || 'No Description'}</span>
              </td>
              <td class="py-4 px-4 text-[var(--text-color)]">${formattedDate}</td>
  
              <td class="py-4 px-4">
                  <span class="px-2 py-1 ${priorityClass} rounded-full sm:text-sm text-xs">${priorityDisplay}</span>
              </td>
      
              <td class="py-4 px-4">
                  <span class="px-2 py-1  ${statusClass}  rounded-full sm:text-sm text-xs">${task.status === "completed"
                ? "Completed"
                : task.status === "in-progress"
                    ? "In Progress"
                    : "Pending"
            }</span>
              </td>
                <td class="py-4 px-4 text-sm">
                  <span class="rounded-full ${repeatClass} px-2 py-1">${task?.repeat?.charAt(0).toUpperCase() + task.repeat?.slice(1)
            }</span>
              </td>
              <td class="action-btn relative py-4 px-4">
               <button onclick="toggleDropdown(event)" class="text-[18px] cursor-pointer hover:text-orange-500 hover:ring hover:ring-orange-500/30 focus:outline-none focus:ring focus:ring-orange-500/50 rounded-lg p-2" aria-label="Actions">
                <i class="ri-menu-4-line "></i>
               </button>
                <div class="hidden z-10 dropdown-menu flex-col absolute bg-[var(--card-bg)] top-0 right-[90px] rounded-lg border border-gray-500/30 py-2 px-3">
                         <button onclick="openSubtaskDetailsModal(${task.id})" 
                              class="text-cyan-500 p-2 text-start  hover:bg-[var(--stat-bg)] transition-all" 
                              title="View subtasks">
                            <i class="ri-list-check-2"></i>
                            View Subtasks
                          </button>
                          <button onclick="breakdownTask(${task.id})" 
                              class="text-purple-500 p-2 text-start  hover:bg-[var(--stat-bg)] transition-all" 
                              title="Break down task">
                           <i class="ri-node-tree"></i>
                          Add Subtask
                          </button>
                            <button onclick="openNotesModal(${task.id})"
                            class="text-green-500 p-2 text-start  hover:bg-[var(--stat-bg)] transition-all" title="Add note">
                            <i class="ri-sticky-note-line"></i>
                            Add Note
                            </button>
                          <button onclick="handleDelete(${task.id})" 
                              class="text-red-500 p-2 text-start  hover:bg-[var(--stat-bg)] transition-all" 
                              title="Delete task">
                            <i class="ri-delete-bin-line"></i>
                               Delete Task
                          </button>
                          <button onclick="openEditModal(${task.id})" 
                              class="text-blue-500 p-2 text-start hover:bg-[var(--stat-bg)] transition-all" 
                              title="Edit task">
                            <i class="ri-edit-line"></i>
                            Edit Task 
                          </button>
                          <button onclick="showTaskDetailsModal(${task.id})" 
                              class="text-orange-500 p-2 text-start hover:bg-[var(--stat-bg)] transition-all" 
                              title="View task">
                            <i class="ri-external-link-line"></i>
                                 View More
                          </button>

                      </div>
              </td>
          `;
        tasksTableView.appendChild(row);
    });
}

function toggleDropdown(event) {
    event.stopPropagation();

    const dropdownMenu = event.currentTarget.nextElementSibling;

    if (dropdownMenu.classList.contains("hidden")) {
        closeAllDropdowns();
        dropdownMenu.classList.remove("hidden");
        dropdownMenu.classList.add("flex");
    } else {
        dropdownMenu.classList.add("hidden");
        dropdownMenu.classList.remove("flex");
    }
}

function openNotesModal(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    const modal = document.getElementById("add-note-modal");
    const modalContent = modal.querySelector("div > div");
    modal.classList.toggle("hidden");

    if (!modal.classList.contains("hidden")) {
        setTimeout(() => {
            modal.classList.add("flex");
            modalContent.classList.remove("scale-95", "opacity-0");
            modalContent.classList.add("scale-100", "opacity-100");
        }, 10);
    } else {
        modal.classList.add("hidden");
        modalContent.classList.remove("scale-100", "opacity-100");
        modalContent.classList.add("scale-95", "opacity-0");
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
            modalContent.classList.remove("scale-100", "opacity-100");
            modalContent.classList.add("scale-95", "opacity-0");
        }
    });

    let form = document.getElementById("addNoteForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const noteTitle = document.getElementById("note-title").value.trim();
        const noteContent = document.getElementById("note-content").value.trim();
        if (noteTitle === ' ' && noteContent === ' ') {
            showToast("Please add note tittle", 'error');
            return;
        } else {

            const note = {
                id: Date.now(),
                title: noteTitle,
                content: noteContent,
                createdAt: new Date().toISOString(),
                updatedAt: null,
            };
            !task.notes ? (task.notes = [] || task.notes.push(note))
                : task.notes.push(note);
            saveTasks();
            loadTasks();

            hideNotesModal();
            showToast("Note added successfully!", "success");
            noteTitle.value = "";
            noteContent.value = "";
        }
    });
}

function hideNotesModal() {
    const modal = document.getElementById("add-note-modal");
    const modalContent = modal.querySelector("div > div");
    modal.classList.add("hidden");
    modalContent.classList.remove("scale-100", "opacity-100");
    modalContent.classList.add("scale-95", "opacity-0");
    modal.removeEventListener("click", hideNotesModal);
    modal.removeEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
            modalContent.classList.remove("scale-100", "opacity-100");
            modalContent.classList.add("scale-95", "opacity-0");
        }
    });
}

document.addEventListener("click", () => {
    closeAllDropdowns();
});

function closeAllDropdowns() {
    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
        menu.classList.add("hidden");
        menu.classList.remove("flex");
    });
}

function listView(filteredTasks) {
    const taskList = document.getElementById("taskLists");
    if (!taskList) return;
    taskList.innerHTML = "";
    filteredTasks.forEach((task) => {
        const dueDate = new Date(task.dueDate);
        const formattedDate = dueDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        const hasSubtasks = task.subtasks && task.subtasks.length > 0;
        const subtasksCompleted = hasSubtasks
            ? task.subtasks.filter((st) => st.completed).length
            : 0;
        const subtasksTotal = hasSubtasks ? task.subtasks.length : 0;

        const li = document.createElement("li");
        li.className = `task-item bg-[var(--secondary-bg)] py-3 mb-4 ring-l-2 rounded-xl border-l-5 ${task.status === "completed"
            ? "border-green-500"
            : task.status === "in-progress"
                ? "border-blue-500"
                : "border-purple-500"
            }  backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`;
        li.dataset.taskId = task.id;

        li.addEventListener("click", (e) => {
            if (
                e.target === li ||
                e.target.classList.contains("task-text") ||
                e.target.classList.contains("task-details")
            ) {
                showTaskDetailsModal(task.id);
            }
        });

        li.innerHTML = `
            <div class="flex items-start p-2 sm:p-4 gap-3 relative">
                <div class="pt-1">
                    <input type="checkbox" ${task.status === "completed" ? "checked" : ""
            } 
                        onchange="toggleTask(${task.id})" 
                        class="h-5 w-5 cursor-pointer accent-purple-500 rounded-full">
                </div>
                
                <div class="flex-grow task-details">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                     <div class="flex-grow">
                         <div class="flex items-center justify-between flex-wrap gap-2">
                            <h3 class="task-text text-[17px] font-medium ${task.status === "completed"
                ? "line-through opacity-70"
                : ""
            } 
                                text-[var(--text-color)] hover:text-purple-500 transition-colors cursor-pointer">
                                ${task.text}
                            </h3>
                              <span class="px-2.5 py-1  border border-purple-600/40 
                                rounded-full text-xs font-medium whitespace-nowrap">
                                ${task.category}
                            </span>
                         </div>    
                        <div class="flex flex-wrap my-1 text-xs sm:text-sm items-center justify-between">
                          <div class="flex flex-wrap my-1 text-xs sm:text-sm items-center gap-4">
                                <span class="flex items-center opacity-70 gap-1 py-1 rounded-full font-medium whitespace-nowrap">
                                    <i class="ri-calendar-line mr-1"></i> ${formattedDate}
                                </span>
                                <span class="font-medium ${task.priority === "high"
                ? "text-red-600"
                : task.priority === "medium"
                    ? " text-green-600"
                    : "text-yellow-600"
            }"> 
                                <i class="ri-flag-line mr-[2px]"></i>
                                 ${task.priority.charAt(0).toUpperCase() +
            task.priority?.slice(1)
            } Priority
                                </span>
                          </div>
                          <div class="flex items-center gap-1">
                                <span class="text-xs ${task.repeat === "none" ? "" : "py-1 px-2"
            } bg-cyan-600/10 rounded-full font-medium text-cyan-600">
                                    ${task.repeat === "daily"
                ? "Repeated Daily"
                : task.repeat === "weekly"
                    ? "Repeated Weekly"
                    : task.repeat === "monthly"
                        ? "Repeated Monthly"
                        : ""
            }
                                </span>
                          </div>
                        </div>
                     </div>
                    </div>
                    
                    ${hasSubtasks
                ? `
                    <div class="my-2.5">
                        <div class="flex font-medium items-center justify-between text-xs sm:text-sm text-[var(--text-gray)] mb-1.5">
                          <div class="flex my-1 items-center gap-3">
                                <span><i class="ri-node-tree"></i> ${subtasksCompleted}/${subtasksTotal} subtasks</span>
                          </div>
                            <span>${Math.round(
                    (subtasksCompleted / subtasksTotal) * 100
                )}% complete</span>
                        </div>
                        <div class="h-1.5 my-1 bg-gray-200/50 rounded-md overflow-hidden">
                            <div class="h-full bg-purple-500 rounded-full transition-all duration-1000" 
                                style="width: ${(subtasksCompleted / subtasksTotal) * 100
                }%"></div>
                        </div>
                        
                    </div>
                    `
                : ""
            }
                    
                    <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center gap-1">
                            <button onclick="breakdownTask(${task.id})" 
                                class="text-purple-500 p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/15 transition-colors" 
                                title="Break down task">
                                <i class="fas fa-sitemap"></i>
                            </button>
                            <button onclick="openEditModal(${task.id})" 
                                class="text-blue-500 p-2 rounded-lg bg-blue-500/10  hover:bg-blue-500/15 transition-colors" 
                                title="Edit task">
                              <i class="ri-edit-line"></i>
                            </button>
                            <button onclick="handleDelete(${task.id})" 
                                class="text-red-500 p-2 rounded-lg bg-red-500/10  hover:bg-red-500/15 transition-colors" 
                                title="Delete task">
                        <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            ${hasSubtasks
                ? `
            <div class="subtasks-container max-h-[300px] overflow-y-auto px-1.5 sm:px-4 pb-3 pt-0 ml-8 mr-4">
                <div class="subtasks-list space-y-2 mt-1">
                    ${task.subtasks
                    .map(
                        (subtask) => `
                        <div class="subtask-item  bg-[var(--card-bg)] hover:bg-[var(--stat-bg)] duration-300 flex items-center gap-2 p-2 pl-3 rounded-md border-l-3 ${subtask.completed
                                ? " border-green-500 "
                                : " border-purple-500 "
                            } 
                            transition-colors duration-300">
                            <input type="checkbox" ${subtask.completed ? "checked" : ""
                            } 
                                onchange="toggleSubtaskFromList(${task.id}, ${subtask.id
                            })" 
                                class="h-4 w-4 cursor-pointer accent-purple-500 rounded-full">
                            <span class="text-sm ${subtask.completed
                                ? "line-through text-[var(--text-gray)]"
                                : "text-[var(--text-color)]"
                            }">
                                ${subtask.text}
                            </span>
                        </div>
                    `
                    )
                    .join("")}
                </div>
            </div>
            `
                : ""
            }
        `;

        taskList.appendChild(li);
    });
}

function resetFilters() {
    currentFilter = "all";
    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("active", "bg-purple-600", "text-white");
    });
    document
        .querySelector(".filter-btn[data-filter='all']")
        .classList.add("active", "bg-purple-600", "text-white");

    document.getElementById("sortSelect").value = "date-desc";
    loadTasks();
}
document
    .getElementById("clearFiltersBtn")
    .addEventListener("click", resetFilters);
function resetRepeatingTask(task) {
    const now = new Date();
    let newDueDate = new Date(task.dueDate);
    while (newDueDate <= now) {
        if (task.repeat === "daily") newDueDate.setDate(newDueDate.getDate() + 1);
        else if (task.repeat === "weekly")
            newDueDate.setDate(newDueDate.getDate() + 7);
        else if (task.repeat === "monthly")
            newDueDate.setMonth(newDueDate.getMonth() + 1);
        else if (task.repeat === "yearly") newDueDate.setFullYear(newDueDate.getFullYear() + 1);
    }
    task.dueDate = newDueDate.toISOString();
    task.status = "pending";
    task.lastNotified = null;
}

document.addEventListener("DOMContentLoaded", loadTasks);
const modal = document.getElementById("deleteModal");
let taskToDelete = null;

function openDeleteModal() {
    modal.classList.remove("hidden");
}

function closeDeleteModal() {
    modal.classList.add("hidden");
    taskToDelete = null;
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        closeDeleteModal();
    }
});
function handleDelete(id) {
    taskToDelete = id;
    openDeleteModal();
}

function confirmDelete() {
    if (taskToDelete) {
        tasks = tasks.filter((task) => task.id !== taskToDelete);
        saveTasks();
        loadTasks();

        showToast("Task deleted successfully!", "success");
        closeDeleteModal();
    }
}
function openEditModal(id) {
    const task = tasks.find((t) => t.id === id);

    if (!task) {
        console.error(`Task with ID ${id} not found.`);
        return;
    }

    editingTaskId = id;
    let editModal = document.getElementById("editModal")
    document.getElementById("editTaskText").value = task.text;
    document.getElementById("editTaskDescription").value = task.description || "";
    document.getElementById("editCategory").value = task.category;
    document.getElementById("editPriority").value = task.priority;
    document.getElementById("editDueDate").value = task.dueDate.slice(0, 16);
    document.getElementById("editRepeat").value = task.repeat;
    editModal.classList.remove("hidden");
    editModal.classList.add("flex");

    editModal.addEventListener("click", (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });



}
function closeEditModal() {
    document.getElementById("editModal").classList.add("hidden");
    document.getElementById("editModal").classList.remove("flex");
    editingTaskId = null;
}

document.addEventListener("click", (e) => {
    if (e.target.matches(".overlay") || e.target.matches(".edit-modal")) {
        closeEditModal();
    }
});

function saveEditedTask() {
    const task = tasks.find((t) => t.id === editingTaskId);

    if (!task) {
        console.error(`Task with ID ${editingTaskId} not found.`);
        showToast("Error: Task not found.", "error");
        return;
    }

    const remainderValue = document.getElementById("editRemainder").value;

    task.text = document.getElementById("editTaskText").value.trim();
    task.description = document.getElementById("editTaskDescription").value.trim();
    task.category = document.getElementById("editCategory").value;
    task.priority = document.getElementById("editPriority").value;
    document.getElementById("editDueDate").value = task.dueDate.slice(0, 16);
    task.dueDate = new Date(
        document.getElementById("editDueDate").value
    ).toISOString();
    task.repeat = document.getElementById("editRepeat").value;
    task.remainder = remainderValue * 60;

    task.subtasks = subtasks;
    task.editedAt = new Date().toISOString();
    saveTasks();
    loadTasks();

    closeEditModal();
    showToast("Task updated successfully!", "success");
}

function saveTasks() {
    if (currentUser) {
        currentUser.tasks = tasks;

        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        if (Array.isArray(currUser)) {
            const userIndex = currUser.findIndex(
                (user) => user.username === currentUser.username
            );
            if (userIndex !== -1) {
                currUser[userIndex].tasks = tasks;
                localStorage.setItem("users", JSON.stringify(currUser));
            }
        }
    } else {
        console.error("No current user found");
    }
}



function checkDueDates() {
    const now = new Date();

    tasks.forEach((task) => {
        const dueDate = new Date(task.dueDate);
        const alarmDateTime = new Date(dueDate.getTime() - task.remainder * 1000);

        if (
            task.status === "pending" &&
            alarmDateTime <= now &&
            task.lastNotified !== alarmDateTime.toISOString()
        ) {
            showAlarmToast(task);
            task.lastNotified = alarmDateTime.toISOString();

            if (task.repeat !== "none") {
                resetRepeatingTask(task);
            }
        }
    });

    saveTasks();
    loadTasks();
}

function playAlarm() {
    const alarm = document.getElementById("alarmSound");
    alarm.play().catch((error) => console.log("Error playing alarm:", error));
}

function stopAlarm() {
    const alarm = document.getElementById("alarmSound");
    alarm.pause();
    alarm.currentTime = 0;
    if (alarmInterval) {
        clearInterval(alarmInterval);
        alarmInterval = null;
    }
}

function removeToast(toast) {
    toast.classList.add("hide");
    if (toast.timeoutId) clearTimeout(toast.timeoutId);
    setTimeout(() => toast.remove(), 500);
}

function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="column ">
                       
            <i class="text-white ${type === "success"
            ? "ri-checkbox-circle-fill"
            : type === "error"
                ? "ri-error-warning-fill"
                : "fa-solid fa-triangle-exclamation"
        }"></i>
                         <span>${message}</span>
                      </div>
                      <i class="fa-solid fa-xmark" onclick="removeToast(this.parentElement)"></i>`;
    document.querySelector("#toastContainer").appendChild(toast);
    toast.timeoutId = setTimeout(() => removeToast(toast), 4000);
}

function showAlarmToast(task) {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast warning";

    const reminderMinutes = task.remainder / 60;
    toast.innerHTML = `
        <div class="column">
            <i class="text-yellow-500 fas fa-bell text-[16px]"></i>
            <span>'${task.text}' is due in ${reminderMinutes} minutes!</span>
        </div>
        <i class="fa-solid fa-xmark toast-dismis" onclick="removeToast(this.parentElement); dismissAlarmToast(this)"></i>
    `;

    toastContainer.appendChild(toast);
    playAlarm();
    alarmInterval = setInterval(playAlarm, 3000);
}

function dismissToast(button) {
    const toast = button.parentNode;
    toast.classList.add("toast-exit");
    toast.addEventListener("animationend", () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    });
}

function dismissAlarmToast(button) {
    stopAlarm();
    dismissToast(button);
}

let currentParentTaskId = null;
let subtasks = [];

// Add this function to handle task breakdown
function breakdownTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) {
        return;
    }
    currentParentTaskId = id;
    subtasks = task.subtasks || [];
    document.getElementById("parentTaskText").textContent = `${task.text}`;
    if (subtasks.length > 0) {
        const allCompleted = subtasks.every((st) => st.completed);
        task.status = allCompleted ? "completed" : "in-progress";
    } else {
        task.status = "pending";
    }
    if (task.status === "completed" && task.repeat !== "none") {
        resetRepeatingTask(task);
        showToast("Task completed! Reset for next occurrence.", "success");
    }
    saveTasks();
    renderSubtasks();
    renderSubtaskDetails();
    document.getElementById("subtaskModal").classList.remove("hidden");
    document.getElementById("subtaskModal").classList.add("flex");
    document.getElementById("newSubtaskInput").focus();
}

function renderSubtasks() {
    const subtasksList = document.getElementById("subtasksList");
    subtasksList.innerHTML = "";

    if (subtasks.length === 0) {
        subtasksList.innerHTML =
            '<p class="text-[var(--text-gray)] italic">No subtasks yet. Add some below!</p>';
        return;
    }

    const task = tasks.find((t) => t.id === currentParentTaskId);
    if (!task) {
        return;
    }

    subtasks.forEach((subtask, index) => {
        const subtaskItem = document.createElement("div");
        subtaskItem.className =
            "flex items-center justify-between p-3 bg-[var(--secondary-bg)] rounded-lg";
        subtaskItem.innerHTML = `
            <div class="flex items-center gap-2">
                <input type="checkbox" ${subtask.completed ? "checked" : ""} 
                    onchange="toggleSubtask(${index})" class="h-3 w-3 cursor-pointer accent-purple-500">
                <span class="${subtask.completed ? "line-through opacity-70" : ""
            }">${index + 1}.  ${subtask.text}</span>
            </div>
        `;
        subtasksList.appendChild(subtaskItem);
    });
}

function addSubtask() {
    const input = document.getElementById("newSubtaskInput");
    const text = input.value.trim();

    if (text) {
        subtasks.push({
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
        });

        input.value = "";
        renderSubtasks();
        renderSubtaskDetails();
    }
}

function toggleSubtask(index) {
    if (subtasks[index]) {
        subtasks[index].completed = !subtasks[index].completed;

        const allCompleted = subtasks.every((st) => st.completed);
        const anyCompleted = subtasks.some((st) => st.completed);

        const task = tasks.find((t) => t.id === currentParentTaskId);
        if (task) {
            task.status = allCompleted
                ? "completed"
                : anyCompleted
                    ? "in-progress"
                    : "in-progress";
            saveTasks();
        }

        renderSubtaskDetails();
        renderSubtasks();
    }
}
let editingSubtaskId = null;

function removeSubtask(taskID, subTaskID) {
    const task = tasks.find((t) => t.id === taskID);
    if (task) {
        task.subtasks = task.subtasks.filter((st) => st.id !== subTaskID);

        if (task.subtasks.length > 0) {
            const allCompleted = task.subtasks.every((st) => st.completed);
            const anyCompleted = task.subtasks.some((st) => st.completed);

            task.status = allCompleted
                ? "completed"
                : anyCompleted
                    ? "in-progress"
                    : "pending";
        }

        saveTasks();
        loadTasks();

        renderSubtaskDetails();
        showToast("Subtask removed successfully!", "success");
        editingSubtaskId = null;
        currentParentTaskId = null;
    }
}

function editSubtask(taskID, subTaskID) {
    const task = tasks.find((t) => t.id === taskID);
    let editTaskModal = document.getElementById("editSubtaskModal");
    if (!task) {
        console.error(`Task with ID ${taskID} not found.`);
        return;
    }
    const input = document.getElementById("editSubtaskInput");
    editTaskModal.classList.remove("hidden");
    editTaskModal.classList.add("flex");
    if (task) {
        const subtask = task.subtasks.find((st) => st.id === subTaskID);
        if (subtask) {
            input.value = subtask.text;
            editingSubtaskId = subTaskID;
        }
        currentParentTaskId = taskID;
    }
    editTaskModal.addEventListener("click", (e) => {
        if (e.target === editTaskModal) {
            closeEditSubtaskModal();
        }
    });
}

function saveEditedSubtask() {
    const input = document.getElementById("editSubtaskInput");
    if (input.value === "") {
        showToast("Subtask text cannot be empty!", "error");
        return;
    }
    const task = tasks.find((t) => t.id === currentParentTaskId);

    const subtask = task.subtasks.find((st) => st.id === editingSubtaskId);
    if (subtask) {
        subtask.text = input.value.trim();
        saveTasks();
        loadTasks();
        renderSubtasks();
        renderSubtaskDetails();

        showToast("Subtask updated successfully!", "success");
        closeEditSubtaskModal();
    }
}

function saveSubtasks() {
    const task = tasks.find((t) => t.id === currentParentTaskId);

    if (task) {
        task.subtasks = subtasks;
        task.hasSubtasks = subtasks.length > 0;

        if (subtasks.length > 0) {
            const allCompleted = subtasks.every((st) => st.completed);
            const anyCompleted = subtasks.some((st) => st.completed);

            task.status = allCompleted
                ? "completed"
                : anyCompleted
                    ? "in-progress"
                    : "pending";
        }

        saveTasks();
        loadTasks();

        renderSubtaskDetails();
        showToast("Subtasks saved successfully!", "success");
    }

    closeSubtaskModal();
}

function closeSubtaskModal() {
    document.getElementById("subtaskModal").classList.add("hidden");
    document.getElementById("subtaskModal").classList.remove("flex");
    currentParentTaskId = null;
    subtasks = [];
}
function closeSubtaskDetailsModal() {
    document.getElementById("subtaskDetailsModal").classList.add("hidden");
    document.getElementById("subtaskDetailsModal").classList.remove("flex");
    currentParentTaskId = null;
    subtasks = [];
}
function openSubtaskDetailsModal(taskID) {
    let subtaskDetailsModal = document.getElementById("subtaskDetailsModal");
    subtaskDetailsModal.classList.remove("hidden");
    subtaskDetailsModal.classList.add("flex");
    currentParentTaskId = taskID;
    renderSubtaskDetails();

    subtaskDetailsModal.addEventListener("click", (e) => {
        if (e.target === subtaskDetailsModal) {
            closeSubtaskDetailsModal();
        }
    });
}


function renderSubtaskDetails() {
    let subtaskDetails = document.getElementById("subtaskDetails");
    subtaskDetails.innerHTML = "";
    const task = tasks.find((t) => t.id === currentParentTaskId);
    subtasks = task.subtasks || [];

    if (subtasks.length === 0) {
        subtaskDetails.innerHTML =
            '<p class="text-[var(--text-gray)] italic">No subtasks yet.</p>';
        return;
    }

    if (!task) {
        console.error(`Task with ID ${currentParentTaskId} not found.`);
        return;
    }
    subtasks.forEach((subtask) => {
        subtaskDetails.innerHTML += `
            <div class="subtask-item bg-[var(--secondary-bg)] hover:bg-[var(--stat-bg)] duration-300 flex items-center gap-2 p-2 pl-3 justify-between rounded-md border-l-3 ${subtask.completed ? " border-green-500 " : " border-purple-500 "
            }  transition-colors ">
            <div class="flex items-center gap-2">
              <input type="checkbox" ${subtask.completed ? "checked" : ""
            }  onchange="toggleSubtaskFromList(${task.id}, ${subtask.id})" "
                class="h-3 w-3 cursor-pointer accent-purple-500 rounded-full">
              <span class="text-sm text-[var(--text-color)]">
                ${subtask.text}
              </span>
            </div>
            <div class="flex text-[var(--text-gray)] items-center gap-1 sm:gap-3">
              <button onclick="editSubtask(${task.id}, ${subtask.id})"
                class="p-1.5 rounded-lg  hover:text-blue-500 transition-colors" title="Edit subtask">
                <i class="ri-edit-line"></i>
              </button>
              <button onclick="removeSubtask(${task.id}, ${subtask.id})"
                class="p-1.5 rounded-lg  hover:text-red-500 transition-colors" title="Delete subtask">
                <i class="ri-delete-bin-line"></i>
              </button>
            </div>
           
          </div>
        `;
    });
}

function closeEditSubtaskModal() {
    document.getElementById("editSubtaskModal").classList.add("hidden");
    document.getElementById("editSubtaskModal").classList.remove("flex");
    document.getElementById("editSubtaskInput").value = "";
}

function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (task.subtasks && task.subtasks.length > 0) {
        const newStatus = task.status !== "completed";
        task.status = newStatus ? "completed" : "pending";
        task.status = newStatus ? "completed" : "pending";
        task.subtasks.forEach((subtask) => {
            subtask.completed = newStatus;
        });
        if (task.status === "completed" && task.repeat !== "none") {
            resetRepeatingTask(task);
            showToast("Task completed! Reset for next occurrence.", "success");
        } else {
            showToast(
                newStatus
                    ? "Task and all subtasks completed!"
                    : "Task and all subtasks marked as incomplete",
                "success"
            );
        }
    } else {
        task.status = task.status === "completed" ? "pending" : "completed";
        if (task.status === "completed" && task.repeat !== "none") {
            resetRepeatingTask(task);
            showToast("Task completed! Reset for next occurrence.", "success");
        } else {
            showToast(
                task.status === "completed"
                    ? "Task completed successfully!"
                    : "Task marked as incomplete",
                "success"
            );
        }
    }
    task.status === 'completed' ? task.completedAt = new Date().toISOString() : task.completedAt = null
    saveTasks();
    loadTasks();

}

// Add event listener for Enter key in subtask input
document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("newSubtaskInput")
        ?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addSubtask();
            }
        });
});

// Update the dismissToast function to handle both string IDs and DOM elements
function dismissToast(toastIdOrElement) {
    let toast;

    if (typeof toastIdOrElement === "string") {
        toast = document.getElementById(toastIdOrElement);
    } else {
        toast = toastIdOrElement.closest(".toast") || toastIdOrElement.parentNode;
    }

    if (!toast) return;

    // Clear any existing timeout
    if (toast.timeoutId) {
        clearTimeout(toast.timeoutId);
    }

    // Add exit animation
    toast.classList.add("opacity-0", "translate-x-full");
    toast.classList.remove("opacity-100", "translate-x-0");

    // Remove after animation completes
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
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

// Add this function to show task details in a modal
function showTaskDetailsModal(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const dueDate = new Date(task.dueDate);
    const createdDate = new Date(task.createdAt);
    const completedDate = new Date(task.completedAt);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    document.getElementById("detailTaskText").innerHTML = `
    <div>
        <h3>${task.text}</h3>
       <p class="text-xs sm:text-sm opacity-70 my-1">${task?.description === undefined ? "No description" : task.description}</p>
    </div>

     <a href="../html/task-detail.html?taskId=${taskId}" class="text-[var(--text-gray)] duration-300 hover:text-indigo-600  text-[16.5px] sm:text-[18px]"><i class="ri-external-link-line"></i></a>`;

    document.getElementById('dueStatus').innerHTML = `${task.status !== 'completed' ? getDueStatus(task.dueDate) : ''}`

    const statusElement = document.getElementById("detailTaskStatus");
    statusElement.textContent =
        task.status === "completed"
            ? "Completed"
            : task.status === "in-progress"
                ? "In Progress"
                : "Pending";

    document.getElementById("detailTaskCategory").innerHTML = `
        <span class="">
            ${task.category}
        </span>
    `;

    const priorityElement = document.getElementById("detailTaskPriority");
    priorityElement.textContent =
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

    document.getElementById("detailTaskRepeat").textContent =
        task.repeat === "none"
            ? "No repeat"
            : task.repeat.charAt(0).toUpperCase() + task.repeat.slice(1);

    const formattedDate = dueDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    const formattedCreatedDate = createdDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    const formattedCompletedDate = task.completedAt === null ? 'Not Completed' : completedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    console.log(task?.startedAt, new Date().toISOString());
    const formattedStartedDate = task?.startedAt === null ? 'Not Started' : new Date(task?.startedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
    const dueDateElement = document.getElementById("detailTaskDueDate");
    dueDateElement.textContent = formattedDate;
    document.getElementById("detailTaskCreated").textContent = ""
    document.getElementById("detailTaskCreated").textContent =
        formattedCreatedDate;
    document.getElementById("detailTaskCompleted").textContent =
        formattedCompletedDate;
    document.getElementById("taskDuration").textContent = returnTimeToCompleteTask(task.startedAt, task.completedAt);
    document.getElementById("detailTaskStarted").textContent =
        formattedStartedDate;

    let detailTaskCreator = document.getElementById("detailTaskCreator");
    let detailTaskEditedDate = document.getElementById("detailTaskEditedDate");

    currentUser
        ? (detailTaskCreator.textContent = `Task Created by: ${currentUser.name}`)
        : (detailTaskCreator.textContent = " Task Created by: Anonymous");
    if (task.editedAt) {
        detailTaskEditedDate.textContent = `Last Edited: ${timeAgo(task.editedAt)}`;
    } else {
        detailTaskEditedDate.textContent = "Last Edited: Not edited yet";
    }

    const detailTaskTags = document.getElementById("detailTaskTags");

    detailTaskTags.innerHTML = "";
    if (task.tags && task.tags.length > 0) {
        task.tags.forEach((tag) => {
            detailTaskTags.innerHTML += `<div class="px-3 py-1 bg-zinc-400/10 rounded-lg duration-300  hover:bg-zinc-500/20">
             <p class="text-xs sm:text-sm font-medium">#${tag}</p>
        </div>`;

        });
    }

    const subtasksSection = document.getElementById("subtasksSection");
    if (hasSubtasks) {
        const subtasksCompleted = task.subtasks.filter((st) => st.completed).length;
        const subtasksTotal = task.subtasks.length;
        const completionPercentage = Math.round(
            (subtasksCompleted / subtasksTotal) * 100
        );

        document.getElementById(
            "subtasksProgress"
        ).textContent = `${completionPercentage}% complete`;
        document.getElementById(
            "subtasksProgressBar"
        ).style.width = `${completionPercentage}%`;

        const subtasksDetailList = document.getElementById("subtasksDetailList");
        subtasksDetailList.innerHTML = "";

        task?.subtasks.forEach((subtask, i) => {
            const subtaskItem = document.createElement("div");
            subtaskItem.className =
                "pl-2 duration-300 flex gap-2 hover:bg-[var(--stat-bg)] py-2 border-b border-[var(--text-gray)]/10 last:border-0";
            subtaskItem.innerHTML = `
                 <i class="${subtask.completed ? 'ri-checkbox-circle-fill text-green-500' : 'ri-circle-line text-[var(--text-gray)]'} mr-2  text-[16.5px] sm:text-[18px]"></i>
                <span class="${subtask.completed ? "line-through opacity-70" : ""
                }">${i + 1}. &nbsp;${subtask.text}</span>
            `;
            subtasksDetailList.appendChild(subtaskItem);
        });

        subtasksSection.classList.remove("hidden");
        document.getElementById("manageSubtasksBtn").classList.remove("hidden");
    } else {
        subtasksSection.classList.add("hidden");
        document.getElementById("manageSubtasksBtn").classList.add("hidden");
    }

    document.getElementById("editTaskBtn").addEventListener("click", () => {
        openEditModal(taskId);
        closeTaskDetailsModal();
    });

    document.getElementById("manageSubtasksBtn").addEventListener("click", () => {
        breakdownTask(taskId);
        closeTaskDetailsModal();
    });

    const detailsModal = document.getElementById("taskDetailsModal");
    detailsModal.classList.remove("hidden");
    detailsModal.classList.add("flex");

    detailsModal.addEventListener("click", (e) => {
        if (e.target === detailsModal) {
            closeTaskDetailsModal();
        }
    });

    let notesList = document.getElementById("notesList");
    notesList.innerHTML = "";
    let notes = task.notes || [];
    if (notes.length === 0) {
        notesList.innerHTML =
            '<p class="text-[var(--text-gray)] italic">No notes yet. Add some below!</p>';
    }
    notes.forEach((note, i) => {
        let { title, content, createdAt } = note;
        let formattedDate = new Date(createdAt);
        createdAt = formattedDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
        notesList.innerHTML += `
        <div
            class="note-card bg-[var(--secondary-bg)] hover:bg-[var(--stat-bg)] duration-300 rounded-xl  transition-all border-t-4 border-teal-500 overflow-hidden"
            data-note-id="note${i}">
            <div class="px-6 py-3">
              <div class="flex items-start justify-between mb-4">
                <h3 class="text-lg font-semibold">${title}</h3>
              </div>
            
              <p class="text-[var(--text-gray)] break-words whitespace-pre-line">${content.length < 70 ? content : content.slice(0, 70) + "..."
            }</p>

              </div>
              <div class="note-actions px-6 pb-3">
              <div class="flex justify-between text-sm space-x-3">
              <div class="text-[var(--text-gray)]">
                <span>${createdAt}</span>
              </div>
               <div class="flex items-center gap-1">
                    <button onclick="openNoteDetailsModal(${taskId}, ${note.id})"
                      class="view-note-btn p-2 text-[var(--text-gray)] hover:text-green-600 hover:bg-green-500/10 rounded-lg transition-colors">
                    <i class="fa-solid fa-expand"></i>
                    </button>

                    <button onclick="editNote(${taskId}, ${note.id})"
                      class="edit-note-btn p-2 text-[var(--text-gray)] hover:text-blue-600 hover:bg-blue-500/10  rounded-lg transition-colors">
                      <i class="ri-edit-line"></i>
                    </button>
                    <button onclick="deleteNote(${taskId}, ${note.id})"
                      class="delete-note-btn p-2 text-[var(--text-gray)] hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors">
                      <i class="fas fa-trash-alt"></i>
                    </button>
               </div>
              </div>
            </div>
          </div>`;
    });
}

// delete note
function deleteNote(taskId, noteId) {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
        task.notes = task.notes.filter((note) => note.id !== noteId);
        saveTasks();
        loadTasks();

        hideNotesModal();
        showToast("Note deleted successfully!", "success");
        closeTaskDetailsModal();
    }
}

function hideEditNoteModal() {
    let editNoteModal = document.getElementById("editNoteModal");
    editNoteModal.classList.add("hidden");
    editNoteModal.classList.remove("flex");
}

// edit note
function editNote(taskId, noteId) {
    const task = tasks.find((t) => t.id === taskId);
    let editNoteModal = document.getElementById("editNoteModal")
    if (task) {
        const note = task.notes.find((n) => n.id === noteId);
        if (note) {
            let editNoteTitle = document.getElementById("editNoteTitle");
            let editNoteContent = document.getElementById("editNoteContent");

            closeTaskDetailsModal();
            editNoteTitle.value = note.title;
            editNoteContent.value = note.content;

            editNoteModal.classList.remove("hidden");
            editNoteModal.classList.add("flex");
            document.getElementById("saveEditedNoteBtn").onclick = function () {
                saveEditedNote(taskId, noteId);
            };
        }
    }
    editNoteModal.addEventListener("click", (e) => {
        if (e.target === editNoteModal) {
            hideEditNoteModal();
        }
    })
}
// save edited note
function saveEditedNote(taskId, noteId) {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
        const note = task.notes.find((n) => n.id === noteId);
        let editNoteTitle = document.getElementById("editNoteTitle");
        let editNoteContent = document.getElementById("editNoteContent");
        if (note) {
            if (
                editNoteTitle.value.trim() === "" ||
                editNoteContent.value.trim() === ""
            ) {
                showToast("Note title and content cannot be empty!", "error");
                return;
            }
            note.title = editNoteTitle.value;
            note.content = editNoteContent.value;
            note.updatedAt = new Date().toISOString();
            saveTasks();
            loadTasks();

            hideNotesModal();
            showToast("Note updated successfully!", "success");
            closeTaskDetailsModal();
            hideEditNoteModal();
        }
    }
}

// Function to close the task details modal
function closeTaskDetailsModal() {
    const detailsModal = document.getElementById("taskDetailsModal");
    if (detailsModal) {
        detailsModal.classList.add("hidden");
        detailsModal.classList.remove("flex");
    }
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

// open note detail modal
function openNoteDetailsModal(taskId, noteId,) {
    closeTaskDetailsModal();
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

function hidNoteDetailsModal() {
    let noteDetailModal = document.getElementById("noteDetailModal");
    noteDetailModal.classList.add("hidden");
    noteDetailModal.classList.remove("flex");
}
