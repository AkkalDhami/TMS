// Pomodoro Timer Functionality
let pomodoroInterval;
let pomodoroTime = 25 * 60; // 25 minutes in seconds
let currentPomodoroTime = pomodoroTime;
let isPomodoroRunning = false;

function openPomodoroTimer() {
    const pomodoroContainer = document.getElementById('pomodoroContainer');
    pomodoroContainer.classList.remove('hidden');
    pomodoroContainer.classList.add('flex');
    
    // Populate task dropdown
    const taskSelect = document.getElementById('pomodoroTaskSelect');
    taskSelect.innerHTML = '<option value="">Select a task to focus on...</option>';
    
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const pendingTasks = tasks.filter(task => task.status !== 'completed');
    
    pendingTasks.forEach(task => {
        const option = document.createElement('option');
        option.value = task.id;
        option.textContent = task.text;
        taskSelect.appendChild(option);
    });
    
    updatePomodoroDisplay();
}

function closePomodoroTimer() {
    const pomodoroContainer = document.getElementById('pomodoroContainer');
    pomodoroContainer.classList.add('hidden');
    pomodoroContainer.classList.remove('flex');
    
    if (isPomodoroRunning) {
        pausePomodoro();
    }
}

function startPomodoro() {
    if (isPomodoroRunning) return;
    
    isPomodoroRunning = true;
    document.getElementById('startPomodoroBtn').classList.add('hidden');
    document.getElementById('pausePomodoroBtn').classList.remove('hidden');
    
    pomodoroInterval = setInterval(() => {
        if (currentPomodoroTime > 0) {
            currentPomodoroTime--;
            updatePomodoroDisplay();
        } else {
            // Time's up
            clearInterval(pomodoroInterval);
            isPomodoroRunning = false;
            document.getElementById('startPomodoroBtn').classList.remove('hidden');
            document.getElementById('pausePomodoroBtn').classList.add('hidden');
            
            // Play sound
            const alarmSound = document.getElementById('alarmSound');
            alarmSound.play();
            
            // Show notification
            showToast('Pomodoro timer completed!', 'success');
            
            // Check if a task was selected
            const taskSelect = document.getElementById('pomodoroTaskSelect');
            if (taskSelect.value) {
                showToast(`Time to take a break from: ${taskSelect.options[taskSelect.selectedIndex].text}`, 'info');
            }
        }
    }, 1000);
}

function pausePomodoro() {
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    document.getElementById('startPomodoroBtn').classList.remove('hidden');
    document.getElementById('pausePomodoroBtn').classList.add('hidden');
}

function resetPomodoro() {
    pausePomodoro();
    currentPomodoroTime = pomodoroTime;
    updatePomodoroDisplay();
}

function setPomodoroTime(minutes) {
    pausePomodoro();
    pomodoroTime = minutes * 60;
    currentPomodoroTime = pomodoroTime;
    updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(currentPomodoroTime / 60);
    const seconds = currentPomodoroTime % 60;
    
    document.getElementById('pomodoroMinutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('pomodoroSeconds').textContent = seconds.toString().padStart(2, '0');
    
    // Update progress bar
    const progressPercentage = 100 - (currentPomodoroTime / pomodoroTime * 100);
    document.getElementById('pomodoroProgress').style.width = `${progressPercentage}%`;
}

// Collaboration Feature
function openCollaborationModal(taskId) {
    const collaborationModal = document.getElementById('collaborationModal');
    collaborationModal.classList.remove('hidden');
    collaborationModal.classList.add('flex');
    
    // Get task details
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        document.getElementById('sharedTaskTitle').textContent = task.text;
    }
}

function closeCollaborationModal() {
    const collaborationModal = document.getElementById('collaborationModal');
    collaborationModal.classList.add('hidden');
    collaborationModal.classList.remove('flex');
}

function shareTask() {
    // In a real application, this would send the task to selected team members
    // For now, we'll just show a success message
    showToast('Task shared successfully with team members!', 'success');
    closeCollaborationModal();
}