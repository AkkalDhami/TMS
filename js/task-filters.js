import { generateWeeklyChart } from "../utils/weeklyChart.js";

import { generateDailyChart, generateDailyChartByType } from "../utils/dailyChart.js";

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}


window.hidNoteDetailsModal = function () {
  let noteDetailModal = document.getElementById("noteDetailModal");
  noteDetailModal.classList.add("hidden");
  noteDetailModal.classList.remove("flex");
}
window.closeTaskDetailsModal = function () {
  const detailsModal = document.getElementById("taskDetailsModal");
  if (detailsModal) {
    detailsModal.classList.add("hidden");
    detailsModal.classList.remove("flex");
  }
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

window.openNoteDetailsModal = function (taskId, noteId,) {
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
document.addEventListener("DOMContentLoaded", function () {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const taskSearch = document.getElementById("task-search");
  const priorityFilter = document.getElementById("priority-filter");
  const categoryFilter = document.getElementById("category-filter");
  const sortBy = document.getElementById("sort-by");
  const tasksTable = document.getElementById("recentTasksTable");

  if (!tasksTable) return;

  let allTasks = [];

  let currentPage = 1;
  const itemsPerPage = 6;
  let filteredTasks = [];

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

  function showTaskDetailsModal(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const dueDate = new Date(task.dueDate);
    const createdDate = new Date(task.createdAt);
    const completedDate = new Date(task.completedAt);
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;

    document.getElementById("detailTaskText").innerHTML = `<div>
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

    // Set repeat status
    document.getElementById("detailTaskRepeat").textContent =
      task.repeat === "none"
        ? "No repeat"
        : task.repeat.charAt(0).toUpperCase() + task.repeat.slice(1);

    // Set dates
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
    const formattedStartedDate = task?.startedAt === null ? 'Not Started' : new Date(task?.startedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const dueDateElement = document.getElementById("detailTaskDueDate");
    dueDateElement.textContent = formattedDate;
    document.getElementById("taskDuration").textContent = returnTimeToCompleteTask(task.startedAt, task.completedAt);
    document.getElementById("detailTaskCreated").textContent =
      formattedCreatedDate;
    document.getElementById("detailTaskCompleted").textContent =
      formattedCompletedDate;
    document.getElementById("detailTaskStarted").textContent =
      formattedStartedDate;
    let detailTaskCreator = document.getElementById("detailTaskCreator");
    let detailTaskEditedDate = document.getElementById("detailTaskEditedDate");

    currentUser
      ? (detailTaskCreator.textContent = `Task Created by: ${currentUser.name}`)
      : (detailTaskCreator.textContent = " Task Created by: Anonymous");

    if (task.editedAt) {
      const editedDate = new Date(task.editedAt);
      const formattedEditedDate = editedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      detailTaskEditedDate.textContent = `Last Edited: ${formattedEditedDate}`;
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

    // Handle subtasks section
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
          "pl-2 duration-300 flex items-center gap-2 hover:bg-[var(--stat-bg)] py-2 border-b border-[var(--text-gray)]/10 last:border-0";
        subtaskItem.innerHTML = `
                <i class="fas ${subtask.completed
            ? "ri-checkbox-circle-fill text-green-500"
            : "ri-circle-line text-gray-400"
          } text-sm"></i>
                <span class="${subtask.completed ? "line-through opacity-70" : ""
          }">${i + 1}. ${subtask.text}</span>
            `;
        subtasksDetailList.appendChild(subtaskItem);
      });

      subtasksSection.classList.remove("hidden");
    } else {
      subtasksSection.classList.add("hidden");
    }



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
               </div>
              </div>
            </div>
          </div>`;
    });

  }

  function initializeTasks() {
    let tasks = [];

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser && currentUser.tasks) {
      tasks = currentUser.tasks;
    } else {
      tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    }

    allTasks = tasks;
    applyFilters();
  }

  function applyFilters() {
    const activeFilterBtn = document.querySelector(".filter-btn.active");
    const statusFilter = activeFilterBtn
      ? activeFilterBtn.getAttribute("data-filter")
      : "all";
    const searchText = taskSearch ? taskSearch.value.toLowerCase() : "";
    const priorityValue = priorityFilter ? priorityFilter.value : "";
    const categoryValue = categoryFilter ? categoryFilter.value : "";
    const [sortField, sortDirection] = sortBy
      ? sortBy.value.split("-")
      : ["dueDate", "asc"];

    filteredTasks = [...allTasks];


    if (statusFilter !== "all") {
      filteredTasks = filteredTasks.filter((task) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        if (dueDate) dueDate.setHours(0, 0, 0, 0);

        const upcoming = new Date();
        upcoming.setDate(upcoming.getDate() + 7);
        upcoming.setHours(0, 0, 0, 0);
        console.log(task)
        switch (statusFilter) {
          case "pending":
            return (
              task.status === "pending"
            );
          case "inprogress":
            return task.status === "in-progress";
          case "completed":
            return task.status === "completed";
          case "today":
            return dueDate && dueDate.getTime() === today.getTime();
          case "upcoming":
            return dueDate && dueDate > today && dueDate <= upcoming;
          case 'with-subtask':
            return task.subtasks.length > 0
          case 'without-subtask':
            return task.subtasks.length === 0
          case "overdue":
            return dueDate && dueDate < today && task.status !== "completed";
          default:
            return true;
        }

      });
    }

    if (searchText) {
      filteredTasks = filteredTasks.filter(
        (task) =>
          (task.title || task.text || "").toLowerCase().includes(searchText) ||
          (task.description || "").toLowerCase().includes(searchText)
      );
    }

    // Priority filter
    if (priorityValue) {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === priorityValue
      );
    }

    // Category filter
    if (categoryValue) {
      filteredTasks = filteredTasks.filter(
        (task) => task.category === categoryValue
      );
    }

    // Sort tasks
    filteredTasks.sort((a, b) => {
      switch (sortField) {
        case "dueDate":
          const dateA = a.dueDate
            ? new Date(a.dueDate)
            : new Date(9999, 11, 31);
          const dateB = b.dueDate
            ? new Date(b.dueDate)
            : new Date(9999, 11, 31);
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;

        case "priority":
          const priorityValues = { high: 3, medium: 2, low: 1, "": 0 };
          return sortDirection === "asc"
            ? priorityValues[a.priority || ""] -
            priorityValues[b.priority || ""]
            : priorityValues[b.priority || ""] -
            priorityValues[a.priority || ""];

        case "createdDate":
          const createdA = new Date(a.createdAt || 0);
          const createdB = new Date(b.createdAt || 0);
          return sortDirection === "asc"
            ? createdA - createdB
            : createdB - createdA;

        default:
          return 0;
      }
    });

    currentPage = 1;
    renderTasks(filteredTasks);

    updateFilteredCounts(filteredTasks);
  }

  // Update counts in the dashboard based on filtered tasks
  function updateFilteredCounts(filteredTasks) {

    const totalTasksCount = document.getElementById("totalTasksCount");
    const completedTasksCount = document.getElementById("completedTasksCount");
    const inProgressCount = document.getElementById("inProgressCount");
    const completionRate = document.getElementById("completionRate");
    const upcomingTasksCount = document.getElementById("upcomingTasksCount");
    const dueSoonCount = document.getElementById("dueSoonCount");
    const overdueCount = document.getElementById("overdueCount");
    const priorityCount = document.getElementById("priorityCount");

    if (
      document
        .querySelector(".filter-btn.active")
        .getAttribute("data-filter") === "all" &&
      !taskSearch.value &&
      !priorityFilter.value &&
      !categoryFilter.value
    ) {
      if (totalTasksCount) {
        totalTasksCount.textContent = allTasks.length;
      }

      const completed = allTasks.filter((task) => task.status === "completed").length;
      if (completedTasksCount) {
        completedTasksCount.textContent = completed;
      }

      const inProgress = allTasks.filter((task) => task.status === "in-progress").length;
      if (inProgressCount) {
        inProgressCount.textContent = inProgress;
      }

      if (completionRate) {
        const rate =
          allTasks.length > 0
            ? Math.round((completed / allTasks.length) * 100)
            : 0;
        completionRate.textContent = `${rate}%`;
      }

      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      const upcoming = allTasks.filter((task) => {
        if (!task.dueDate || task.status === "completed") return false;
        const dueDate = new Date(task.dueDate);
        return dueDate > now && dueDate <= nextWeek;
      }).length;

      if (upcomingTasksCount) {
        upcomingTasksCount.textContent = upcoming;
      }

      // Calculate due soon (next 24 hours)
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      const dueSoon = allTasks.filter((task) => {
        if (!task.dueDate || task.status === "completed") return false;
        const dueDate = new Date(task.dueDate);
        return dueDate > now && dueDate <= tomorrow;
      }).length;

      if (dueSoonCount) {
        dueSoonCount.textContent = dueSoon;
      }

      // Calculate overdue tasks
      const overdue = allTasks.filter((task) => {
        if (!task.dueDate || task.status === "completed") return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < now;
      }).length;

      if (overdueCount) {
        overdueCount.textContent = overdue;
      }

      // Calculate high priority tasks
      const highPriority = allTasks.filter(
        (task) => task.priority === "high" && task.status !== "completed"
      ).length;

      if (priorityCount) {
        priorityCount.textContent = highPriority;
      }
    }
  }

  document.getElementById("updateDailyDistributionBtn").addEventListener("click", function (e) {
    e.preventDefault();
    const dueDateInput = document.getElementById("dailyDistributionDate");
    const chartType = document.getElementById("chartType");

    const dueDate = new Date(dueDateInput.value);
    const ctx = document.getElementById("dailyDistributionChart").getContext("2d");
    chartType.addEventListener("change", function () {
      if (!isNaN(dueDate.getTime())) {
        generateDailyChartByType(ctx, dueDate, chartType == '-1' ? 'line' : chartType.value);

      }
    });

    if (dueDateInput) {
      dueDate.setHours(0, 0, 0, 0);
      if (!isNaN(dueDate.getTime())) {
        generateDailyChartByType(ctx, dueDate, chartType.value);
      } else {
        alert("Please enter a valid date.");
      }
    }
  });

  generateWeeklyChart(new Date());

  // Render tasks in the table
  function renderTasks(tasks) {
    if (!tasksTable) return;

    const pageInfo = document.getElementById("pageInfo");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");


    const totalPages = Math.ceil(tasks.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedTasks = tasks.slice(start, start + itemsPerPage);
    tasksTable.innerHTML = "";



    if (tasks.length === 0) {
      const emptyRow = document.createElement("tr");
      emptyRow.innerHTML = `
                <td colspan="8" class="py-12">
                    <div class="flex flex-col items-center justify-center">
                        <div class="w-20 h-20 mb-4 rounded-full flex items-center justify-center bg-purple-500/10 text-purple-500">
                            <i class="ri-file-search-line text-4xl"></i>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">No Tasks Found</h3>
                        <p class="text-[var(--text-gray)] text-center  max-w-md mb-4">
                            We couldn't find any tasks matching your current filters.<br> Try adjusting your filters or add a new task.
                        </p>
                        <div class="flex gap-3">
                            <button id="clear-filters-btn" class="px-4 py-2 rounded-lg border border-purple-500/20 hover:bg-purple-500/10 transition-colors">
                                <i class="ri-filter-off-line mr-1"></i> Clear Filters
                            </button>
                            <button onclick="window.location.href='../html/todo.html#progressSection'" class="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors">
                                <i class="ri-add-line mr-1"></i> Add New Task
                            </button>
                        </div>
                    </div>
                </td>
            `;

      tasksTable.appendChild(emptyRow);

      const clearFiltersBtn = document.getElementById("clear-filters-btn");
      if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", function () {

          document.querySelector('[data-filter="all"]').click();
          if (taskSearch) taskSearch.value = "";
          if (priorityFilter) priorityFilter.value = "";
          if (categoryFilter) categoryFilter.value = "";
          if (sortBy) sortBy.value = "dueDate-asc";
          applyFilters();
        });
      }

      pageInfo.textContent = `Page 0 of 0`;
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }
    paginatedTasks.forEach((task) => {
      const row = document.createElement("tr");
      row.className = "task-text hover:bg-[var(--stat-bg)] cursor-pointer duration-300";
      row.dataset.taskId = task.id;

      const dueDate = new Date(task.dueDate);
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      let todayDate = new Date();
      let canvas = document.getElementById("dailyDistributionChart");
      let ctx = canvas.getContext("2d");
      generateWeeklyChart(dueDate);
      generateDailyChart(ctx, todayDate);


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

      let repeatClass = "";
      switch (task.repeat) {
        case "daily":
          repeatClass = "bg-green-500/10 text-green-500";
          break;
        case "weekly":
          repeatClass = "bg-orange-500/10 text-orange-500";
          break;
        case "monthly":
          repeatClass = "bg-purple-500/10 text-purple-500";
          break;
        case "none":
          repeatClass = "bg-yellow-500/10 text-yellow-500";
          break;
        default:
          repeatClass = "bg-gray-500/10 text-gray-500";
          break;
      }

      // Status class
      let statusClass = "";
      switch (task.status) {
        case 'completed':
          statusClass = "bg-green-500/10 text-green-500";
          break;
        case 'in-progress':
          statusClass = "bg-blue-500/10 text-blue-600";
          break;
        case 'pending':
          statusClass = "bg-yellow-500/10 text-yellow-500";
          break;
        default:
          statusClass = "bg-yellow-500/10 text-yellow-500";
          break;
      }


      const priorityDisplay = task.priority
        ? `${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`
        : "Normal";

      row.innerHTML = `
            <td class="py-4 px-4">
                <div class="flex items-center">
                ${task.status === 'completed'
          ? '<i class="ri-checkbox-circle-fill mr-2 text-green-500 text-[16.5px] sm:text-[18px]"></i>'
          : '<i class="ri-circle-line mr-2 text-gray-600/80 text-[16.5px] sm:text-[18px]"></i>'
        }
                    <span class="font-medium text-[var(--text-color)] ${task.status === 'completed'
          ? "line-through text-[var(--text-gray)]"
          : ""
        }">${task.text.length > 20 ? task.text.slice(0, 20) + '....' : task.text}</span>
                </div>
            </td>

            <td class="py-4 px-4">
                <span class="task-category">${task?.description?.length > 30 ? task?.description?.slice(0, 30) + '....' : task?.description || 'No description'}</span>
            </td>
          
            <td class="py-4 px-4 text-[var(--text-color)]">${formattedDate}</td>

            <td class="py-4 px-4">
                <span class="px-2 py-1 ${priorityClass} rounded-full sm:text-sm text-xs">${priorityDisplay}</span>
            </td>
    
            <td class="py-4 px-4">
                <span class="px-2 py-1 ${repeatClass} rounded-full sm:text-sm text-xs">${task?.repeat?.charAt(0).toUpperCase() + task.repeat?.slice(1)}</span>
            </td>
    
            <td class="py-4 px-4">
                <span class="px-2 py-1  ${statusClass}  rounded-full sm:text-sm text-xs">${task.status === "completed"
          ? "Completed"
          : task.status === "in-progress"
            ? "In Progress"
            : "Pending"}</span>
            </td>
          
        `;

      recentTasksTable.appendChild(row);
    });

    pageInfo.innerHTML = `Page <span class="font-semibold">${currentPage}</span> of <span class="font-medium">${totalPages}</span>`;


    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  tasksTable.addEventListener("click", function (e) {
    const target = e.target;
    if (
      target.classList.contains("task-text") ||
      target.closest(".task-text")
    ) {
      const row = target.closest("tr");
      const taskId = parseInt(row.dataset.taskId);
      document.getElementById("taskDetailsModal").classList.remove("hidden");
      document.getElementById("taskDetailsModal").classList.add("flex");
      showTaskDetailsModal(taskId);
    }
  });


  document.getElementById("prevBtn").addEventListener("click", goToPreviousPage);
  document.getElementById("nextBtn").addEventListener("click", goToNextPage);

  // Pagination buttons
  function goToNextPage() {
    const totalPages = Math.ceil(allTasks.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderTasks(filteredTasks);

    }
  }

  function goToPreviousPage() {
    if (currentPage > 1) {
      currentPage--;
      renderTasks(filteredTasks);

    }
  }


  // Initialize event listeners
  function initializeEventListeners() {
    if (filterButtons) {
      filterButtons.forEach((btn) => {
        btn.addEventListener("click", function () {
          filterButtons.forEach((b) =>
            b.classList.remove("active", "bg-purple-500", "text-white")
          );
          filterButtons.forEach((b) =>
            b.classList.add(
              "bg-[var(--card-bg)]",
              "border",
              "border-purple-500/20"
            )
          );

          this.classList.add("active", "bg-purple-500", "text-white");
          this.classList.remove(
            "bg-[var(--card-bg)]",
            "border",
            "border-purple-500/20"
          );

          applyFilters();
        });
      });
    }

    // Search input
    if (taskSearch) {
      taskSearch.addEventListener("input", debounce(applyFilters, 300));
    }

    // Dropdown filters
    if (priorityFilter) {
      priorityFilter.addEventListener("change", applyFilters);
    }

    if (categoryFilter) {
      categoryFilter.addEventListener("change", applyFilters);
    }

    if (sortBy) {
      sortBy.addEventListener("change", applyFilters);
    }

    // Reset filters button
    const addResetButton = () => {
      const resetBtn = document.getElementById("reset-filters");

      resetBtn.addEventListener("click", function () {
        // Reset filter buttons
        filterButtons.forEach((b) =>
          b.classList.remove("active", "bg-purple-500", "text-white")
        );
        filterButtons.forEach((b) =>
          b.classList.add(
            "bg-[var(--card-bg)]",
            "border",
            "border-purple-500/20"
          )
        );

        const allButton = document.querySelector('[data-filter="all"]');
        if (allButton) {
          allButton.classList.add("active", "bg-purple-500", "text-white");
          allButton.classList.remove(
            "bg-[var(--card-bg)]",
            "border",
            "border-purple-500/20"
          );
        }

        // Reset dropdowns and search
        if (taskSearch) taskSearch.value = "";
        if (priorityFilter) priorityFilter.value = "";
        if (categoryFilter) categoryFilter.value = "";
        if (sortBy) sortBy.value = "dueDate-asc";

        applyFilters();
      });
    };

    addResetButton();
  }

  // Helper function to debounce search input
  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  initializeEventListeners();
  initializeTasks();
});


// Add scroll functionality for filter buttons
const filterContainer = document.querySelector(
  ".filter-task .flex.items-center.flex-nowrap"
);
const scrollLeftBtn = document.getElementById("scrollLeftBtn");
const scrollRightBtn = document.getElementById("scrollRightBtn");

const scrollAmount = 200;

scrollLeftBtn.addEventListener("click", () => {
  filterContainer.scrollLeft -= scrollAmount;
});

scrollRightBtn.addEventListener("click", () => {
  filterContainer.scrollLeft += scrollAmount;
});

const updateScrollButtons = () => {
  scrollLeftBtn.style.opacity = filterContainer.scrollLeft > 0 ? "1" : "0.5";
  scrollRightBtn.style.opacity =
    filterContainer.scrollLeft <
      filterContainer.scrollWidth - filterContainer.clientWidth
      ? "1"
      : "0.5";
};

filterContainer.addEventListener("scroll", updateScrollButtons);
window.addEventListener("resize", updateScrollButtons);
updateScrollButtons();
