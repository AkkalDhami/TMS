
// Add a new chart instance for daily view
let dailyChartInstance = null;
let tasks = [];
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (currentUser && currentUser.tasks) {
    tasks = currentUser.tasks;
}

export function generateDailyChart(ctx, targetDate) {
    if (currentUser && currentUser.tasks) {
        tasks = currentUser.tasks;
    }
    const date = new Date(targetDate);

    // Initialize hourly data
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const chartData = {
        completed: new Array(24).fill(0),
        pending: new Array(24).fill(0),
        inProgress: new Array(24).fill(0),
        total: new Array(24).fill(0)
    };

    // Filter tasks for the selected date
    const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === date.toDateString();
    });

    // Group tasks by hour
    dayTasks.forEach(task => {
        const taskDate = new Date(task.dueDate);
        const hour = taskDate.getHours();

        if (task.status === 'completed') {
            chartData.completed[hour]++;
        } else if (task.status === 'pending') {
            chartData.pending[hour]++;
        } else if (task.status === 'in-progress') {
            chartData.inProgress[hour]++;
        }
        chartData.total[hour]++;
    });

    // Create or update chart
    if (dailyChartInstance) {
        dailyChartInstance.destroy();
    }

    dailyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Completed Tasks',
                data: chartData.completed,
                borderColor: '#4CAF50',
                backgroundColor: '#4CAF5020',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Pending Tasks',
                data: chartData.pending,
                borderColor: '#FFC107',
                backgroundColor: '#FFC10720',
                tension: 0.4,
                fill: true
            },
            {
                label: 'In Progress Tasks',
                data: chartData.inProgress,
                borderColor: '#2196F3',
                backgroundColor: '#2196F320',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Total Tasks',
                data: chartData.total,
                borderColor: '#FF5722',
                backgroundColor: '#FF572220',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                axis: 'x',
                intersect: false
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    position: 'nearest',
                    backgroundColor: '#121212',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'white20',
                    callbacks: {
                        title: function (context) {
                            return `${hours[context[0].dataIndex]} - ${date.toLocaleDateString()}`;
                        },
                        label: function (context) {
                            return ` ${context.dataset.label}: ${context.raw} tasks`;
                        }
                    }
                },
                legend: {
                    labels: {
                        color: 'gray',
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Number of Tasks',
                        color: 'gray'
                    },
                    beginAtZero: true,
                    ticks: {
                        color: 'gray',
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'white20'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hour of Day',
                        color: 'gray'
                    },
                    ticks: {
                        color: 'gray',
                        font: { size: 14 },
                        callback: function (value) {
                            return `${value}:00`;
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    return dailyChartInstance;
}

// Add cleanup function for daily chart
export function destroyDailyChart() {
    if (dailyChartInstance) {
        dailyChartInstance.destroy();
        dailyChartInstance = null;
    }
}

// Add function to open daily chart
export function openDailyChart(date = new Date()) {
    const ctx = document.getElementById('dailyDistributionChart').getContext('2d');
    document.getElementById('dailyChartContainer').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('dailyChartContainer').classList.add('opacity-100', 'pointer-events-auto');
    setTimeout(() => generateDailyChart(ctx, date), 10);
    document.getElementById('dailyChartContainer').addEventListener('click', function (event) {
        if (event.target === this) {
            closeDailyChart();
        }
    });
}

// Add function to close daily chart
export function closeDailyChart() {
    document.getElementById('dailyChartContainer').classList.remove('opacity-100', 'pointer-events-auto');
    document.getElementById('dailyChartContainer').classList.add('opacity-0', 'pointer-events-none');
    destroyDailyChart();
}


export function generateDailyChartByType(ctx, targetDate = new Date().toLocaleDateString(), chartType = 'bar') {
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
