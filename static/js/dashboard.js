// --- 1. OBSLUGA ZAKLADEK ---
const tabs = document.querySelectorAll('.nav-tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelector('.nav-tab.active').classList.remove('active');
        tab.classList.add('active');
    });
});

// --- 2. OBSLUGA ZADAN I PASKA POSTEPU ---
const taskItems = document.querySelectorAll('.task-item');
const totalTasks = taskItems.length;

function updateProgress() {
    const completedCount = document.querySelectorAll('.task-item.completed').length;
    document.getElementById('task-counter').textContent = `Wykonane: ${completedCount} / ${totalTasks}`;
    
    const percentage = (completedCount / totalTasks) * 100;
    document.getElementById('task-progress').style.width = `${percentage}%`;
}

taskItems.forEach(item => {
    item.addEventListener('click', function() {
        this.classList.toggle('completed');
        updateProgress();
    });
});

updateProgress();

// --- 3. GENEROWANIE KALENDARZA ---
const monthNames = ["STYCZE—", "LUTY", "MARZEC", "KWIECIE—", "MAJ", "CZERWIEC", "LIPIEC", "SIERPIE—", "WRZESIE—", "PAèDZIERNIK", "LISTOPAD", "GRUDZIE—"];

// Zmienne do nawigacji (to co widzimy)
let currentMonth = 0; 
let currentYear = 0;

// Zmienne do podúwietlenia (to co jest wybrane)
let selectedDay = 0;
let selectedMonth = 0;
let selectedYear = 0;

// NOWOå∆: Twarda pamiÍÊ o tym, jaki jest dzisiaj dzieÒ
let actualTodayDay = 0;
let actualTodayMonth = 0;
let actualTodayYear = 0;

function renderCalendar() {
    document.getElementById('month-year-display').textContent = `${monthNames[currentMonth]} ${currentYear}`;
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    if (firstDayIndex === 0) firstDayIndex = 7;

    for(let i = 1; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        grid.appendChild(emptyDiv);
    }

    for(let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;

        // Podúwietlamy tylko wybrany dzieÒ
        if (i === selectedDay && currentMonth === selectedMonth && currentYear === selectedYear) {
            dayDiv.classList.add('active'); 
        }

        // Przyk≥adowe zadania (kropki)
        if (i === 18 || i === 25) dayDiv.innerHTML += `<div class="day-dot" style="background-color: var(--accent-green);"></div>`;
        if (i === 20) dayDiv.innerHTML += `<div class="day-dot" style="background-color: var(--color-blue);"></div>`;
        if (i === 26) dayDiv.innerHTML += `<div class="day-dot" style="background-color: var(--color-yellow);"></div>`;
        if (i === 31) dayDiv.innerHTML += `<div class="day-dot" style="background-color: var(--color-orange);"></div>`;

        // Co siÍ dzieje przy klikniÍciu w dzieÒ:
        dayDiv.addEventListener('click', function() {
            const currentActive = document.querySelector('.calendar-day.active');
            if(currentActive) currentActive.classList.remove('active');
            
            this.classList.add('active');

            selectedDay = i; 
            selectedMonth = currentMonth;
            selectedYear = currentYear;
            
            console.log("Wybrano nowy dzieÒ:", selectedDay, selectedMonth, selectedYear);
        });

        grid.appendChild(dayDiv);
    }
}

async function fetchDateFromAPI() {
    try {
        const response = await fetch('/api/current-date');
        const data = await response.json();
        
        // NOWOå∆: Zapisujemy na sztywno, co zwrÛci≥ serwer
        actualTodayDay = data.day;
        actualTodayMonth = data.month;
        actualTodayYear = data.year;

        // Ustawiamy widok
        currentMonth = data.month;
        currentYear = data.year;

        // Ustawiamy domyúlny wybÛr na dzisiaj
        selectedDay = data.day;
        selectedMonth = data.month;
        selectedYear = data.year;
        
        renderCalendar();
    } catch (error) {
        console.error("B≥πd pobierania daty z API:", error);
    }
}

document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if(currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    
    // NOWOå∆: Resetujemy wybÛr do obiektywnego "dzisiaj"
    selectedDay = actualTodayDay;
    selectedMonth = actualTodayMonth;
    selectedYear = actualTodayYear;
    
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if(currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    // NOWOå∆: Resetujemy wybÛr do obiektywnego "dzisiaj"
    selectedDay = actualTodayDay;
    selectedMonth = actualTodayMonth;
    selectedYear = actualTodayYear;

    renderCalendar();
});

// Uruchamiamy pobieranie daty przy starcie aplikacji
fetchDateFromAPI();