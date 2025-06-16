let lineChartInstance = null;

// Add this new function
export function generateWeeklyChart(targetDate) {
    try {
        const ctx = document.getElementById('weeklyDistributionChart');
        if (!ctx) {
            console.error('Canvas element "weeklyDistributionChart" not found');
            return null;
        }

        const date = new Date(targetDate);
        if (isNaN(date.getTime())) {
            console.error('Invalid date provided');
            return null;
        }

        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday

        const days = [];
        const chartData = {
            completed: [],
            pending: [],
            inProgress: [],
            total: []
        };

        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + i);

            const dayStr = currentDate.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' });
            days.push(dayStr);

            const dayTasks = tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                return taskDate.toDateString() === currentDate.toDateString();
            });

            chartData.completed.push(dayTasks.filter(task => task.status === 'completed').length);
            chartData.pending.push(dayTasks.filter(task => task.status === 'pending').length);
            chartData.inProgress.push(dayTasks.filter(task => task.status === 'in-progress').length);
            chartData.total.push(dayTasks.length);
        }

        if (lineChartInstance) {
            lineChartInstance.destroy();
        }

        lineChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
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
                                return days[context[0].dataIndex];
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
                            color: 'gray'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Day of the Week',
                            color: 'gray'
                        },
                        ticks: {
                            color: 'gray',
                            font: { size: 14 }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        return lineChartInstance;
    } catch (error) {
        console.error('Error generating weekly chart:', error);
        return null;
    }
}


export function getChartInstance() {
    return lineChartInstance;
}

// Add cleanup function
export function destroyChart() {
    if (lineChartInstance) {
        lineChartInstance.destroy();
        lineChartInstance = null;
    }
}

// Instead of generateWeeklyChart();();, use:
// generateWeeklyChart(new Date()); // Pass current date or specific date
