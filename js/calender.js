
const currentUser = JSON.parse(localStorage.getItem("currentUser"));
let tasks = [];
let goals = [];
if (currentUser && currentUser.tasks) {
    tasks = currentUser.tasks;
}
if (currentUser && currentUser.goals) {
    goals = currentUser.goals;
}

let currentDate = new Date();

function generateCalendar(date) {
    const calendarDates = document.getElementById("calendarDates");
    calendarDates.innerHTML = "";

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startDay = monthStart.getDay();

    // Previous month days
    for (let i = 0; i < startDay; i++) {
        const prevDate = new Date(monthStart);
        prevDate.setDate(prevDate.getDate() - (startDay - i));
        createDateElement(prevDate);
    }

    // Current month days
    for (let d = 1; d <= monthEnd.getDate(); d++) {
        const currentDay = new Date(date.getFullYear(), date.getMonth(), d);
        createDateElement(currentDay);
    }

    document.getElementById("currentMonth").textContent = date.toLocaleString(
        "default",
        { month: "long", year: "numeric" }
    );
}

function createDateElement(date) {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const dateTasks = getTasksForDate(date);
    const element = document.createElement("div");
    element.className = `relative  border hover:bg-[var(--stat-bg)] p-2  transition-all duration-300 cursor-pointer  ${isToday ? "border-purple-500 bg-[var(--stat-bg)]" : "border-zinc-500/40 bg-[var(--primary-bg)]"
        }  min-h-[240px] flex flex-col`;

    const dateHeader = document.createElement("div");
    dateHeader.className = `text-right pr-3 font-semibold text-[18px] mb-2 ${isToday ? "text-purple-500" : ""
        } `;
    dateHeader.textContent = date.getDate();

    const indicatorsContainer = document.createElement("div");
    indicatorsContainer.className = "flex flex-wrap gap-1 mt-auto justify-center";

    const moreTask = document.createElement('div');
    moreTask.className = 'w-full text-sm sm:text-[16px] font-medium px-2 py-[2px] bg-orange-500/10 text-orange-600 rounded';
    moreTask.innerHTML = `+${dateTasks.slice(3).length} more`


    dateTasks.slice(0, 3).forEach((task) => {
        const indicator = document.createElement("div");
        indicator.className = `mb-1 w-full line-clamp-1 border-l-3 sm:text-sm rounded px-2 py-[4px] ${task.status === "completed" ? "bg-green-500/10 hover:bg-green-500/30 text-green-500 border-green-500" : task.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/30 border-blue-500' : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500'}`;


        dateTasks.length > 3
            ? indicator.innerHTML =
            `
            <h3 class="text-[var(--text-color)] text-[16px]  line-clamp-1 mb-1 text-wrap"> ${task.text}</h3>
            <p class="text-xs sm:text-sm"> 09:23 - 12:23 </p>
            `
            : indicator.innerHTML =
            `
           <h3 class="text-[var(--text-color)] text-sm mb-1 line-clamp-1 sm:text-[16px]"> ${task.text}</h3>
                <p class="text-xs sm:text-sm"> 09:23 - 12:23 </p>
            `;


        indicator.title = `Task: ${task.text} - ${task.status === 'completed' ? "Completed" : task.status == 'in-progress' ? "In Progress" : "Pending"
            }`;
        indicator.style.cursor = "pointer";
        indicatorsContainer.appendChild(indicator);
    });


    element.appendChild(dateHeader);
    element.appendChild(indicatorsContainer);
    dateTasks.length > 3 ? element.appendChild(moreTask) : '';

    element.onclick = () => handleDateClick(date, dateTasks);

    document.getElementById("calendarDates").appendChild(element);
}

function getTasksForDate(date) {
    return tasks.filter((task) => {
        const taskDate = new Date(task.dueDate);
        return (
            taskDate.getFullYear() === date.getFullYear() &&
            taskDate.getMonth() === date.getMonth() &&
            taskDate.getDate() === date.getDate()
        );
    });
}

function getPriorityBadge(priority) {
    const styles = {
        high: "bg-red-500/10 text-red-500",
        medium: "bg-green-500/10 text-green-500",
        low: "bg-yellow-500/10 text-yellow-500",
    };
    return `
    <div class="px-2 py-1 text-xs sm:text-sm font-medium rounded-full ${styles[priority]}">
        ${priority.charAt(0).toUpperCase() + priority?.slice(1)} Priority 
    </div>
    `;
}
function getPriorityBorder(priority) {
    const styles = {
        high: "bg-red-400/10 border-red-500",
        medium: "bg-green-400/10 border-green-500",
        low: "bg-yellow-400/10 border-yellow-500",
    };
    return styles[priority];
}
function getTaskStatus(status) {
    switch (status) {
        case "completed":
            return 'Completed';
        case "pending":
            return 'Pending';
        case "in-progress":
            return 'In Progress';
        default:
            return 'Pending';
    }
}

function handleDateClick(date, tasks) {
    const modalDate = document.getElementById("modalDate");
    let updatedModalDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const completedTasks = tasks.filter(
        (task) => task.status === "completed"
    ).length;
    const pendingTasks = tasks.filter(
        (task) => task.status === "pending"
    ).length;
    const inProgressTasks = tasks.filter(
        (task) => task.status === "in-progress"
    ).length;

    document.getElementById("taskCount").innerHTML = `
    <span>${completedTasks} completed <i class="ri-circle-fill mx-[2px] text-[6px]"></i> ${pendingTasks + inProgressTasks} remaining</span>
    <button onclick="openDailyChart('${date}')" class="text-sm ${tasks.length > 0 ? 'block' : 'hidden'} sm:text-[16.5px] hover:text-orange-600"><i class="ri-bar-chart-fill sm:text-xl mr-1"></i> view chart</button>
    `;
    modalDate.innerHTML = `<a href="../html/task-detail.html?dueDate='${date.toLocaleDateString()}'" class='text-sm sm:text-[16.5px] hover:text-orange-600'><i class="ri-links-line sm:text-xl mr-1"></i></a>  ${updatedModalDate}`

    const tasksList = document.getElementById("tasksList");
    let taskModal = document.querySelector("#taskModal div");
    tasks.length <= 1
        ? (tasksList.className = "grid grid-cols-1")
        : (tasksList.className =
            "grid place-content-center grid-cols-1 md:grid-cols-2 gap-x-3 space-y-2 sm:space-y-0");
    tasks.length <= 1
        ? (taskModal.className =
            "w-[500px] relative sm:w-[500px] bg-[var(--card-bg)] m-2 text-[var(--text-color)] px-2.5 sm:px-5 rounded-lg max-h-[650px] overflow-y-auto")
        : (taskModal.className =
            "w-[500px] sm:w-[800px] bg-[var(--card-bg)] m-2 text-[var(--text-color)] px-2.5 sm:px-5 rounded-lg max-h-[700px] overflow-y-auto");

    tasksList.innerHTML =
        tasks.length > 0
            ? tasks
                .map((task) => {
                    let textClass = "";
                    switch (task.status) {
                        case "completed":
                            textClass = "text-green-500";
                            break;
                        case "pending":
                            textClass = "text-yellow-500";
                            break;
                        case "in-progress":
                            textClass = "text-blue-500";
                            break;
                        default:
                            textClass = "text-yellow-500";
                    }
                    let formattedDueDate = new Intl.DateTimeFormat("en-US",
                        {
                            hour: "2-digit",
                            minute: "2-digit",
                        }
                    ).format(new Date(task.dueDate));


                    return `
<div class="px-3 py-3 border-l-4 rounded-lg  hover:shadow-lg transform hover:-translate-y-1 ${getPriorityBorder(task.priority)} duration-300 mb-4">
  <div class="flex items-start gap-3">
    <div class="flex-1">
      <div class="flex mb-1 justify-between items-center">
        <div class="flex gap-1">
          ${task.status === "completed"
                            ? '<i class="ri-checkbox-circle-fill mr-1 text-green-500 text-[16.5px] sm:text-[18px]"></i>'
                            : `<i class='ri-circle-line mr-1 text-[var(--text-gray)] text-[16.5px] sm:text-[18px]'></i>`
                        }
          <span class="font-medium text-[var(--text-color)]  ${task.status === "completed" ? "line-through text-[var(--text-gray)]" : ""}">${task.text}</span>
        </div>
         
      </div>

     ${task.description ? `<p class="text-[var(--text-gray)] text-[13px] pl-7 line-clamp-1 sm:text-sm">${task.description || ""}</p> ` : ""}
      <div class="flex items-center mt-2 justify-between text-sm">
        <div class="flex relative items-center justify-between w-full text-[var(--text-gray)] ">
          <div class="flex items-center gap-1">
            <p class="flex text-xs sm:text-sm font-medium items-center gap-1 px-2.5 rounded-full py-1"><i class="ri-timer-line"></i> ${formattedDueDate}</p>
            <p class="flex text-xs ${textClass} sm:text-sm font-medium items-center gap-1 rounded-full py-1">${getTaskStatus(task.status)}</p>
          </div>
           <div onclick="window.location.href='../html/task-detail.html?taskId=${task.id}'" class="text-sm sm:text-xl cursor-pointer hover:text-blue-500">
             <i class="ri-external-link-line"></i>
           </div>
        </div>
      </div>
    </div>
  </div>
</div>
                    `;
                })
                .join("")
            : `<div class="text-center py-6 w-full">
                    <i class="ri-emotion-sad-line text-4xl  mb-4"></i>
                    <p class="text-[var(--text-gray)] text-2xl font-semibold mt-2.5">No tasks for this date</p>
                </div>
                `;

    document.getElementById("taskModal").classList.remove("hidden");
    document.getElementById("taskModal").classList.add("flex");
    console.log(tasks);
    document.getElementById("totalTasks").innerHTML = tasks.length;
    document.getElementById("pendingTasks").innerHTML = pendingTasks
    document.getElementById("inProgressTasks").innerHTML = inProgressTasks;
    document.getElementById("completedTasks").innerHTML = completedTasks;
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "completed").length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    document.getElementById("taskProgress").innerHTML = `${percentage}%`;

    document.getElementById("taskModal").addEventListener("click", (e) => {
        if (e.target.id === "taskModal") {
            closeModal();
        }
    });
}


function closeModal() {
    document.getElementById("taskModal").classList.add("hidden");
    document.getElementById("taskModal").classList.remove("flex");
}

// Event Listeners
document.getElementById("prevMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar(currentDate);
});

document.getElementById("nextMonth").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar(currentDate);
});

generateCalendar(currentDate);

let dailyChartInstance = null;
// daily chart distribution
function openDailyChart(date = new Date()) {
    const ctx = document.getElementById("dailyDistributionChart").getContext("2d");
    document
        .getElementById("dailyChartContainer")
        .classList.remove("opacity-0", "hidden");
    document
        .getElementById("dailyChartContainer")
        .classList.add("opacity-100", "flex");
    setTimeout(() => generateDailyChartByType(ctx, date, 'bar'), 10);
    document
        .getElementById("dailyChartContainer")
        .addEventListener("click", function (event) {
            if (event.target === this) {
                closeDailyChart();
            }
        });
}

function closeDailyChart() {
    document
        .getElementById("dailyChartContainer")
        .classList.remove("opacity-100", "flex");
    document
        .getElementById("dailyChartContainer")
        .classList.add("opacity-0", "hidden");
    if (dailyChartInstance) {
        dailyChartInstance.destroy();
        dailyChartInstance = null;
    }
}

function generateDailyChartByType(ctx, targetDate, chartType = 'bar') {

    const date = new Date(targetDate);

    const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === date.toDateString();
    });

    const taskCounts = {
        completed: dayTasks.filter(task => task.status === 'completed').length,
        pending: dayTasks.filter(task => task.status === 'pending').length,
        inProgress: dayTasks.filter(task => task.status === 'in-progress').length
    };

    const total = dayTasks.length;

    const percentages = {
        completed: total ? ((taskCounts.completed / total) * 100).toFixed(1) : 0,
        pending: total ? ((taskCounts.pending / total) * 100).toFixed(1) : 0,
        inProgress: total ? ((taskCounts.inProgress / total) * 100).toFixed(1) : 0
    };

    if (dailyChartInstance) {
        dailyChartInstance.destroy();
    }

    const commonConfig = {
        labels: ['Completed', 'Pending', 'In Progress'],
        datasets: [{
            data: [taskCounts.completed, taskCounts.pending, taskCounts.inProgress],
            backgroundColor: [
                '#4CAF50',
                '#FFC107',
                '#2196F3'
            ],
            borderColor: [
                '#388E3C',
                '#FFA000',
                '#1976D2'
            ],
            borderWidth: 2
        }]
    };

    const chartSpecificOptions = {
        bar: {
            indexAxis: 'x',
            elements: {
                bar: {
                    borderRadius: 4,
                    borderSkipped: false
                }
            },
            barThickness: 50
        },
        pie: {
            cutout: '0%',
            radius: '90%'
        },
        doughnut: {
            cutout: '60%',
            radius: '90%'
        },
        polarArea: {
            radius: '90%'
        }
    };

    dailyChartInstance = new Chart(ctx, {
        type: chartType,
        data: commonConfig,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            ...chartSpecificOptions[chartType],
            plugins: {
                legend: {
                    display: chartType !== 'bar',
                    position: 'bottom',
                    labels: {
                        color: 'gray',
                        font: { size: 14 },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: '#121212',
                    titleColor: 'white',
                    bodyColor: 'white',
                    padding: 12,
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            const percentage = Object.values(percentages)[context.dataIndex];
                            return ` ${value} tasks (${percentage}%)`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Tasks Distribution - ${new Date(targetDate).toLocaleDateString("en-US", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}`,
                    color: 'gray',
                    font: { size: 16, weight: 'bold' },
                    padding: 20
                }
            },
            scales: chartType === 'bar' ? {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'gray',
                        font: { size: 12 }
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'gray',
                        font: { size: 14, weight: 'bold' }
                    },
                    beginAtZero: true,

                }
            } : undefined
        }
    });

    return dailyChartInstance;
}