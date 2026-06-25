document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initTaskManager();
    initTimer();
    initCalculator();
});

/* ==========================================
   Clock & Date Module
   ========================================== */
function initClock() {
    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');

    function updateTime() {
        const now = new Date();
        
        // Time format: HH:MM:SS
        const timeStr = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Date format: Day, Month DD, YYYY
        const dateStr = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        if (timeEl) timeEl.textContent = timeStr;
        if (dateEl) dateEl.textContent = dateStr;
    }

    updateTime();
    setInterval(updateTime, 1000);
}

/* ==========================================
   Task Manager Module
   ========================================== */
function initTaskManager() {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskPriority = document.getElementById('task-priority');
    const tasksList = document.getElementById('tasks-list');
    const taskCountEl = document.getElementById('task-count');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    
    const filterAll = document.getElementById('filter-all');
    const filterActive = document.getElementById('filter-active');
    const filterCompleted = document.getElementById('filter-completed');

    let tasks = JSON.parse(localStorage.getItem('quantum_tasks')) || [];
    let currentFilter = 'all';

    function saveTasks() {
        localStorage.setItem('quantum_tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        if (!tasksList) return;
        
        tasksList.innerHTML = '';
        
        // Filter tasks
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        // Update active count
        const activeCount = tasks.filter(task => !task.completed).length;
        if (taskCountEl) {
            taskCountEl.textContent = `${activeCount} Active`;
        }

        if (filteredTasks.length === 0) {
            const emptyEl = document.createElement('li');
            emptyEl.className = 'task-item';
            emptyEl.style.justifyContent = 'center';
            emptyEl.innerHTML = `<span class="task-text" style="color: var(--text-dark);">No tasks found</span>`;
            tasksList.appendChild(emptyEl);
            return;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            li.innerHTML = `
                <div class="task-item-left">
                    <label class="task-checkbox-container">
                        <input type="checkbox" class="task-toggle" ${task.completed ? 'checked' : ''}>
                        <span class="checkbox-custom"></span>
                    </label>
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <span class="priority-tag ${task.priority}">${task.priority}</span>
                </div>
                <div class="task-actions">
                    <button class="delete-task-btn" aria-label="Delete Task">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            `;

            // Setup event listeners for the dynamic items
            li.querySelector('.task-toggle').addEventListener('change', () => toggleTask(task.id));
            li.querySelector('.delete-task-btn').addEventListener('click', () => deleteTask(task.id));

            tasksList.appendChild(li);
        });
    }

    function addTask(e) {
        e.preventDefault();
        const text = taskInput.value.trim();
        const priority = taskPriority.value;

        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text,
            priority,
            completed: false
        };

        tasks.push(newTask);
        taskInput.value = '';
        saveTasks();
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
    }

    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
    }

    function setFilter(filter, button) {
        currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        renderTasks();
    }

    // Helper to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Event listeners
    if (taskForm) taskForm.addEventListener('submit', addTask);
    if (clearCompletedBtn) clearCompletedBtn.addEventListener('click', clearCompleted);
    
    if (filterAll) filterAll.addEventListener('click', (e) => setFilter('all', e.target));
    if (filterActive) filterActive.addEventListener('click', (e) => setFilter('active', e.target));
    if (filterCompleted) filterCompleted.addEventListener('click', (e) => setFilter('completed', e.target));

    renderTasks();
}

/* ==========================================
   Focus Timer Module (Pomodoro)
   ========================================== */
function initTimer() {
    const timerDisplay = document.getElementById('timer-display');
    const playBtn = document.getElementById('timer-play-btn');
    const pauseBtn = document.getElementById('timer-pause-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const sessionCounterEl = document.getElementById('session-counter');
    const timerStateLabel = document.getElementById('timer-state-label');
    const progressRingBar = document.querySelector('.progress-ring-bar');
    
    const modeButtons = document.querySelectorAll('.mode-btn');

    let timerInterval = null;
    let isRunning = false;
    let totalSeconds = 1500; // 25 min default
    let secondsLeft = 1500;
    let completedSessions = parseInt(localStorage.getItem('quantum_sessions')) || 0;
    let currentMode = 'pomodoro'; // pomodoro, short, long

    // Configure SVG progress ring
    const radius = 96;
    const circumference = 2 * Math.PI * radius; // ~603.18
    
    if (progressRingBar) {
        progressRingBar.style.strokeDasharray = `${circumference} ${circumference}`;
        progressRingBar.style.strokeDashoffset = 0;
    }

    if (sessionCounterEl) {
        sessionCounterEl.textContent = `Completed sessions: ${completedSessions}`;
    }

    function updateDisplay() {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        const displayStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timerDisplay) timerDisplay.textContent = displayStr;
        
        // Dynamically update document title to show countdown
        const titleMode = currentMode === 'pomodoro' ? 'Focus' : 'Break';
        document.title = `(${displayStr}) ${titleMode} | Quantum Focus`;

        updateProgress();
    }

    function updateProgress() {
        if (!progressRingBar) return;
        const progress = secondsLeft / totalSeconds;
        const offset = circumference * (1 - progress);
        progressRingBar.style.strokeDashoffset = offset;
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        
        playBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');

        // Color shift ring based on mode
        updateRingColor();

        timerInterval = setInterval(() => {
            if (secondsLeft > 0) {
                secondsLeft--;
                updateDisplay();
            } else {
                handleTimerComplete();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isRunning) return;
        isRunning = false;
        
        pauseBtn.classList.add('hidden');
        playBtn.classList.remove('hidden');
        
        clearInterval(timerInterval);
    }

    function resetTimer() {
        pauseTimer();
        secondsLeft = totalSeconds;
        updateDisplay();
        
        // Reset progress color
        if (progressRingBar) {
            progressRingBar.style.stroke = 'var(--accent-glow)';
        }
    }

    function switchMode(mode, duration) {
        currentMode = mode;
        totalSeconds = parseInt(duration);
        secondsLeft = totalSeconds;
        
        // Update active class on buttons
        modeButtons.forEach(btn => {
            if (btn.id === `mode-${mode}`) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update top-right badge status
        if (timerStateLabel) {
            if (mode === 'pomodoro') {
                timerStateLabel.textContent = 'Focusing';
                timerStateLabel.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                timerStateLabel.style.color = 'var(--accent-glow)';
                timerStateLabel.style.background = 'rgba(139, 92, 246, 0.1)';
            } else {
                timerStateLabel.textContent = 'Resting';
                timerStateLabel.style.borderColor = 'rgba(6, 182, 212, 0.4)';
                timerStateLabel.style.color = 'var(--accent-cyan)';
                timerStateLabel.style.background = 'rgba(6, 182, 212, 0.1)';
            }
        }

        resetTimer();
    }

    function updateRingColor() {
        if (!progressRingBar) return;
        if (currentMode === 'pomodoro') {
            progressRingBar.style.stroke = 'var(--accent-glow)';
        } else {
            progressRingBar.style.stroke = 'var(--accent-cyan)';
        }
    }

    function handleTimerComplete() {
        pauseTimer();
        
        // Trigger notification sound / alert
        try {
            // Play a synthetic notification beep using Web Audio API
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const osc = context.createOscillator();
            const gain = context.createGain();
            
            osc.connect(gain);
            gain.connect(context.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, context.currentTime); // D5 note
            gain.gain.setValueAtTime(0.3, context.currentTime);
            
            osc.start();
            osc.stop(context.currentTime + 0.3);
        } catch (e) {
            console.log('Audio Context block or unsupported:', e);
        }

        if (currentMode === 'pomodoro') {
            completedSessions++;
            localStorage.setItem('quantum_sessions', completedSessions);
            if (sessionCounterEl) {
                sessionCounterEl.textContent = `Completed sessions: ${completedSessions}`;
            }
            alert("Focus session complete! Time to take a break.");
            // Auto switch to short break
            switchMode('short', 300);
        } else {
            alert("Break complete! Ready to focus?");
            // Auto switch back to pomodoro
            switchMode('pomodoro', 1500);
        }
    }

    // Event listeners
    if (playBtn) playBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = btn.id.replace('mode-', '');
            const duration = btn.dataset.duration;
            switchMode(mode, duration);
        });
    });

    // Initialize display
    switchMode('pomodoro', 1500);
}

/* ==========================================
   Quick Calculator Module
   ========================================== */
function initCalculator() {
    const calcDisplay = document.getElementById('calc-display');
    const calcExpression = document.getElementById('calc-expression');
    const calcButtons = document.querySelectorAll('.calc-btn');

    let currentInput = '';
    let expression = '';
    let shouldResetInput = false;

    function handleInput(val) {
        if (shouldResetInput) {
            currentInput = '';
            shouldResetInput = false;
        }

        // Avoid multiple leading zeros
        if (currentInput === '0' && val === '0') return;
        
        // Limit number of characters in input
        if (currentInput.length > 12) return;

        // Decimal point control
        if (val === '.' && currentInput.includes('.')) return;

        if (currentInput === '0' && val !== '.') {
            currentInput = val;
        } else {
            currentInput += val;
        }

        updateDisplay(currentInput);
    }

    function handleOperator(op) {
        shouldResetInput = false;
        
        if (currentInput === '' && expression !== '') {
            // Change operator if clicked successively
            expression = expression.slice(0, -1) + op;
            updateExpressionDisplay(expression);
            return;
        }

        if (currentInput === '') {
            currentInput = '0';
        }

        expression += currentInput + op;
        currentInput = '';
        updateExpressionDisplay(expression);
        updateDisplay('0');
    }

    function calculate() {
        if (currentInput === '' && expression === '') return;
        
        let finalExpression = expression + (currentInput || '0');
        
        // Remove trailing operator if user hits equal right after operator
        if (['+', '-', '*', '/'].includes(finalExpression.slice(-1))) {
            finalExpression = finalExpression.slice(0, -1);
        }

        // Sanitize mathematical expression to prevent arbitrary code execution
        const sanitizedExpression = finalExpression.replace(/[^0-9+\-*/().]/g, '');

        try {
            // Use safe Function constructor instead of raw eval
            const result = new Function(`return (${sanitizedExpression})`)();
            
            if (result === Infinity || isNaN(result)) {
                showError('Math Error');
            } else {
                // Round to 8 decimal places max to avoid float issues
                const roundedResult = Number(Math.round(result + 'e8') + 'e-8').toString();
                updateDisplay(roundedResult);
                
                expression = '';
                currentInput = roundedResult;
                shouldResetInput = true;
                updateExpressionDisplay('&nbsp;');
            }
        } catch (err) {
            showError('Syntax Error');
        }
    }

    function clearAll() {
        currentInput = '';
        expression = '';
        shouldResetInput = false;
        updateDisplay('0');
        updateExpressionDisplay('&nbsp;');
    }

    function handleBackspace() {
        if (shouldResetInput) {
            clearAll();
            return;
        }
        
        if (currentInput.length > 0) {
            currentInput = currentInput.slice(0, -1);
            if (currentInput === '') {
                updateDisplay('0');
            } else {
                updateDisplay(currentInput);
            }
        }
    }

    function showError(msg) {
        updateDisplay(msg);
        currentInput = '';
        expression = '';
        shouldResetInput = true;
        updateExpressionDisplay('&nbsp;');
    }

    function updateDisplay(val) {
        if (calcDisplay) calcDisplay.value = val;
    }

    function updateExpressionDisplay(val) {
        if (calcExpression) {
            // Show human-readable characters
            const formatted = val.replace(/\*/g, ' × ').replace(/\//g, ' ÷ ').replace(/\+/g, ' + ').replace(/-/g, ' - ');
            calcExpression.innerHTML = formatted || '&nbsp;';
        }
    }

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key >= '0' && key <= '9') handleInput(key);
        if (key === '.') handleInput('.');
        if (key === '+' || key === '-' || key === '*' || key === '/') handleOperator(key);
        if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculate();
        }
        if (key === 'Backspace') handleBackspace();
        if (key === 'Escape' || key === 'c' || key === 'C') clearAll();
    });

    // Event listener mapping
    calcButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('number')) {
                handleInput(btn.dataset.val);
            } else if (btn.classList.contains('operator')) {
                handleOperator(btn.dataset.val);
            } else if (btn.id === 'calc-equals') {
                calculate();
            } else if (btn.id === 'calc-clear') {
                clearAll();
            } else if (btn.id === 'calc-backspace') {
                handleBackspace();
            }
        });
    });

    // Initial state
    clearAll();
}
