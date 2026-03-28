// --- 1. ZARZ•DZANIE STANEM I ZAK£ADKAMI ---
let currentMonthTasks = []; // Tu bÍdziemy trzymaÊ zadania na dany miesiπc

const tabs = document.querySelectorAll('.nav-tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelector('.nav-tab.active').classList.remove('active');
        tab.classList.add('active');
    });
});

// --- 2. ZMIENNE DO KALENDARZA ---
const monthNames = ["STYCZE—", "LUTY", "MARZEC", "KWIECIE—", "MAJ", "CZERWIEC", "LIPIEC", "SIERPIE—", "WRZESIE—", "PAèDZIERNIK", "LISTOPAD", "GRUDZIE—"];

let currentMonth = 0; 
let currentYear = 0;
let selectedDay = 0;
let selectedMonth = 0;
let selectedYear = 0;
let actualTodayDay = 0;
let actualTodayMonth = 0;
let actualTodayYear = 0;

// --- 3. POBIERANIE DANYCH ---
// Symulujemy pobranie Twojego nowego, prostego formatu danych
async function fetchTasksForCurrentView() {
    // W przysz≥oúci tu wpiszesz úcieøkÍ do swojego Pythona, np:
    // const response = await fetch(`/api/tasks?month=${currentMonth+1}&year=${currentYear}`);
    // const data = await response.json();
    
    // Na razie ≥adujemy Twoje przyk≥adowe dane:
    currentMonthTasks = [
        { id: 1, title: "Projektowanie UI", dueDate: "2026-03-18T10:00:00", isCompleted: true, colorVar: "var(--accent-green)" },
        { id: 2, title: "Napisac wiadomosc", dueDate: "2026-03-29T12:00:00", isCompleted: false, colorVar: "var(--color-blue)" },
        { id: 3, title: "Inne zadanie", dueDate: "2026-03-29T15:00:00", isCompleted: false, colorVar: "var(--color-yellow)" }
    ];

    renderCalendar();
    updateTaskList();
}

async function fetchDateFromAPI() {
    try {
        // W przysz≥oúci pobierzesz datÍ z API: const response = await fetch('/api/current-date');
        // Na ten moment ustawiamy datÍ rÍcznie na dzisiaj dla testÛw
        const today = new Date();
        actualTodayDay = today.getDate();
        actualTodayMonth = today.getMonth();
        actualTodayYear = today.getFullYear();

        currentMonth = actualTodayMonth;
        currentYear = actualTodayYear;
        selectedDay = actualTodayDay;
        selectedMonth = actualTodayMonth;
        selectedYear = actualTodayYear;
        
        // Zamiast renderowaÊ od razu, najpierw pobieramy zadania
        fetchTasksForCurrentView();
    } catch (error) {
        console.error("B≥πd pobierania daty:", error);
    }
}

// --- 4. RYSOWANIE KALENDARZA I KROPEK ---
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

        if (i === selectedDay && currentMonth === selectedMonth && currentYear === selectedYear) {
            dayDiv.classList.add('active'); 
        }

        // --- AUTOMATYCZNE KROPKI ---
        // Sprawdzamy, czy w pobranych zadaniach sπ jakieú na ten konkretny dzieÒ
        const tasksForThisDay = currentMonthTasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.getDate() === i && taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
        });

        if (tasksForThisDay.length > 0) {
            // Tworzymy pojemnik na kropki, øeby wyúwietla≥y siÍ obok siebie, jeúli jest kilka zadaÒ
            const dotsWrapper = document.createElement('div');
            dotsWrapper.style.position = 'absolute';
            dotsWrapper.style.bottom = '4px';
            dotsWrapper.style.display = 'flex';
            dotsWrapper.style.gap = '3px';
            
            // Wyciπgamy unikalne kolory, øeby nie rysowaÊ 5 takich samych kropek
            const uniqueColors = [...new Set(tasksForThisDay.map(t => t.colorVar))];
            uniqueColors.forEach(color => {
                const dot = document.createElement('div');
                dot.className = 'day-dot';
                dot.style.position = 'static'; // Nadpisujemy to, co masz w CSS, øeby kropki uk≥ada≥y siÍ w rzÍdzie
                dot.style.backgroundColor = color;
                dotsWrapper.appendChild(dot);
            });
            dayDiv.appendChild(dotsWrapper);
        }

        // KlikniÍcie w dzieÒ na kalendarzu
        dayDiv.addEventListener('click', function() {
            selectedDay = i; 
            selectedMonth = currentMonth;
            selectedYear = currentYear;
            
            renderCalendar(); // Odúwieøamy kalendarz (øeby podúwietliÊ nowy dzieÒ)
            updateTaskList(); // Odúwieøamy listÍ zadaÒ po lewej stronie
        });

        grid.appendChild(dayDiv);
    }
}

// --- 5. OBS£UGA LISTY ZADA— ---
function updateTaskList() {
    const listDiv = document.querySelector('.task-list');
    listDiv.innerHTML = ''; // Czyúcimy obecne zadania na ekranie
    
    // Wybieramy z listy tylko te zadania, ktÛre pasujπ do klikniÍtego dnia
    const tasksForSelectedDay = currentMonthTasks.filter(task => {
        const d = new Date(task.dueDate);
        return d.getDate() === selectedDay && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    tasksForSelectedDay.forEach(task => {
        const statusClass = task.isCompleted ? 'completed' : '';
        const statusData = task.isCompleted ? 'completed' : 'pending';
        
        // Formatowanie daty, np. "29 Mar"
        const dateObj = new Date(task.dueDate);
        const formattedDate = dateObj.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });

        const taskHTML = `
            <div class="task-item ${statusClass}" data-status="${statusData}" data-id="${task.id}">
                <div class="task-info">
                    <div class="task-icon" style="background: ${task.colorVar}; color: #121212; opacity: 0.9;">??</div>
                    <span>${task.title}</span>
                </div>
                <div class="task-meta">
                    <span>${formattedDate}</span>
                    <div class="dot" style="background-color: ${task.colorVar};"></div>
                </div>
            </div>
        `;
        listDiv.insertAdjacentHTML('beforeend', taskHTML);
    });

    // Podpinamy klikanie po wygenerowaniu nowych zadaÒ
    attachTaskClickEvents();
    updateProgress();
}

function attachTaskClickEvents() {
    const items = document.querySelectorAll('.task-item');
    items.forEach(item => {
        item.addEventListener('click', function() {
            this.classList.toggle('completed');
            updateProgress();
        });
    });
}

function updateProgress() {
    const taskItems = document.querySelectorAll('.task-item');
    const totalTasks = taskItems.length;
    const completedCount = document.querySelectorAll('.task-item.completed').length;
    
    document.getElementById('task-counter').textContent = `Wykonane: ${completedCount} / ${totalTasks}`;
    const percentage = totalTasks === 0 ? 0 : (completedCount / totalTasks) * 100;
    document.getElementById('task-progress').style.width = `${percentage}%`;
}

// --- 6. PRZYCISKI ZMIANY MIESI•CA ---
document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if(currentMonth < 0) { currentMonth = 11; currentYear--; }
    
    selectedDay = actualTodayDay;
    selectedMonth = actualTodayMonth;
    selectedYear = actualTodayYear;
    
    fetchTasksForCurrentView(); // Pobieramy zadania dla nowego miesiπca
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if(currentMonth > 11) { currentMonth = 0; currentYear++; }

    selectedDay = actualTodayDay;
    selectedMonth = actualTodayMonth;
    selectedYear = actualTodayYear;

    fetchTasksForCurrentView(); // Pobieramy zadania dla nowego miesiπca
});

// START APLIKACJI
fetchDateFromAPI();