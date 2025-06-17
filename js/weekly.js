let weeklyData = generateWeeklyData();

function generateWeeklyData() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
        day,
        completed: tasks.filter(task => new Date(task.dueDate).getDay() === days.indexOf(day) && task.status === 'completed').length,
        pending: tasks.filter(task => new Date(task.dueDate).getDay() === days.indexOf(day) && task.status === 'pending').length,
        inProgress: tasks.filter(task => new Date(task.dueDate).getDay() === days.indexOf(day) && task.status === 'in-progress').length,
        total: tasks.filter(task => new Date(task.dueDate).getDay() === days.indexOf(day)).length
    }));
}

// Line Chart Instance
let lineChartInstance = null;

function createLineChart() {
    if (lineChartInstance) lineChartInstance.destroy();

    const ctx = document.getElementById('lineChart');

    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weeklyData.map(d => d.day),
            datasets: [{
                label: 'Completed Tasks',
                data: weeklyData.map(d => d.completed),
                borderColor: '#4CAF50',  // Green
                backgroundColor: '#4CAF5020',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Pending Tasks',
                data: weeklyData.map(d => d.pending),
                borderColor: '#FFC107',  // Yellow
                backgroundColor: '#FFC10720',
                tension: 0.4,
                fill: true
            },
            {
                label: 'In Progress Tasks',
                data: weeklyData.map(d => d.inProgress),
                borderColor: '#2196F3',  // Blue
                backgroundColor: '#2196F320',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Total Tasks',
                data: weeklyData.map(d => d.total),
                borderColor: '#FF5722',  // Orange
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
                    borderColor: 'white' + '20',
                    caretPadding: 10,
                    displayColors: false,
                    callbacks: {
                        title: function (context) {
                            return weeklyData[context[0].dataIndex].date;
                        },
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            return ` ${label}: ${value} tasks`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Number of Tasks',
                        color: 'white'
                    },
                    beginAtZero: true,
                    ticks: {
                        color: 'white',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'white' + '20'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day of the Week',
                        color: 'white'
                    },
                    ticks: {
                        color: 'white',
                        font: {
                            size: 14
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#111',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'white' + '20',
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            return ` ${label}: ${value} tasks`;
                        }
                    }
                }
            }
        }
    });
    
}

// Weekly Chart Controls
function openLineChart() {
    if (shouldUpdateWeekly()) {
        weeklyData = generateWeeklyData();
    }

    document.getElementById('lineChartContainer').classList.remove('opacity-0', 'pointer-events-none');
    document.getElementById('lineChartContainer').classList.add('opacity-100', 'pointer-events-auto');
    setTimeout(createLineChart, 10);
    document.getElementById('lineChartContainer').addEventListener('click', function (event) {
        if (event.target === this) {
            closeLineChart();
        }
    });
}

function closeLineChart() {
    document.getElementById('lineChartContainer').classList.remove('opacity-100', 'pointer-events-auto');
    document.getElementById('lineChartContainer').classList.add('opacity-0', 'pointer-events-none');
    if (lineChartInstance) {
        lineChartInstance.destroy();
        lineChartInstance = null;
    }
}
function shouldUpdateWeekly() {
    return true;
}