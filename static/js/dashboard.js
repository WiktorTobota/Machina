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
const monthNames = ["STYCZEN", "LUTY", "MARZEC", "KWIECIEN", "MAJ", "CZERWIEC", "LIPIEC", "SIERPIEN", "WRZESIEN", "PAèDZIERNIK", "LISTOPAD", "GRUDZIEN"];

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
    try {
        const response = await fetch(`/api/tasks?month=${currentMonth+1}&year=${currentYear}`);
        
        if (!response.ok) {
            throw new Error(`B≥πd HTTP: ${response.status}`);
        }

        let data = await response.json();
        
        // ZABEZPIECZENIE: RÍczne parsowanie, jeúli z backendu przypadkiem przyszed≥ tekst
        if (typeof data === 'string') {
            console.warn("Otrzymano string zamiast obiektu. ParsujÍ rÍcznie.");
            data = JSON.parse(data);
        }

        // ZABEZPIECZENIE: Upewniamy siÍ, øe to tablica, by uniknπÊ b≥Ídu metody .filter()
        if (Array.isArray(data)) {
            currentMonthTasks = data;
        } else {
            console.error("API nie zwrÛci≥o tablicy!", data);
            currentMonthTasks = []; // Fallback na pustπ tablicÍ
        }

    } catch (error) {
        console.error("B≥πd podczas pobierania zadaÒ:", error);
        currentMonthTasks = []; // Zabezpieczenie na wypadek awarii sieci
    } finally {
        // Blok finally wykonuje siÍ ZAWSZE. 
        // DziÍki temu kalendarz narysuje siÍ (bez zadaÒ) nawet, gdy serwer leøy.
        renderCalendar();
        updateTaskList();
    }
}

async function fetchDateFromAPI() {
    try {
        // W przysz≥osci pobierzesz datÍ z API: const response = await fetch('/api/current-date');
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
        // Sprawdzamy, czy w pobranych zadaniach sπ jakies na ten konkretny dzien
        const tasksForThisDay = currentMonthTasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.getDate() === i && taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
        });

        if (tasksForThisDay.length > 0) {
            // Tworzymy pojemnik na kropki, zeby wyswietla≥y siÍ obok siebie, jesli jest kilka zadan
            const dotsWrapper = document.createElement('div');
            dotsWrapper.style.position = 'absolute';
            dotsWrapper.style.bottom = '4px';
            dotsWrapper.style.display = 'flex';
            dotsWrapper.style.gap = '3px';
            
            // Wyciπgamy unikalne kolory, zeby nie rysowaÊ 5 takich samych kropek
            const uniqueColors = [...new Set(tasksForThisDay.map(t => t.colorVar))];
            uniqueColors.forEach(color => {
                const dot = document.createElement('div');
                dot.className = 'day-dot';
                dot.style.position = 'static'; // Nadpisujemy to, co masz w CSS, zeby kropki uk≥ada≥y siÍ w rzÍdzie
                dot.style.backgroundColor = color;
                dotsWrapper.appendChild(dot);
            });
            dayDiv.appendChild(dotsWrapper);
        }

        // KlikniÍcie w dzien na kalendarzu
        dayDiv.addEventListener('click', function() {
            selectedDay = i; 
            selectedMonth = currentMonth;
            selectedYear = currentYear;
            
            renderCalendar(); // Odswiezamy kalendarz (zeby podswietliÊ nowy dzien)
            updateTaskList(); // Odswiezamy listÍ zadan po lewej stronie
        });

        grid.appendChild(dayDiv);
    }
}

// --- 5. OBS£UGA LISTY ZADAN ---
function updateTaskList() {
    const listDiv = document.querySelector('.task-list');
    listDiv.innerHTML = '';

    // Szukamy zadan dla wybranego dnia
    let tasksForSelectedDay = currentMonthTasks.filter(task => {
        const d = new Date(task.dueDate);
        return d.getDate() === selectedDay && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    // Jesli brak zadan ó szukamy najblizszego kolejnego dnia z zadaniami
    let displayDay = selectedDay;
    if (tasksForSelectedDay.length === 0) {
        const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);

        // Sortujemy zadania rosnπco po dacie i szukamy pierwszego po wybranym dniu
        const futureTasks = currentMonthTasks
            .map(task => ({ ...task, dateObj: new Date(task.dueDate) }))
            .filter(task => task.dateObj >= selectedDate)
            .sort((a, b) => a.dateObj - b.dateObj);

        if (futureTasks.length > 0) {
            const nearestDate = futureTasks[0].dateObj;
            displayDay = nearestDate.getDate();

            tasksForSelectedDay = currentMonthTasks.filter(task => {
                const d = new Date(task.dueDate);
                return d.getDate() === nearestDate.getDate() &&
                       d.getMonth() === nearestDate.getMonth() &&
                       d.getFullYear() === nearestDate.getFullYear();
            });
        }
    }

    // Opcjonalny nag≥Ûwek ó zeby user wiedzia≥ skπd sπ te zadania
    if (displayDay !== selectedDay && tasksForSelectedDay.length > 0) {
        listDiv.insertAdjacentHTML('beforeend', `
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">
                Najblizsze zadania: ${displayDay} ${monthNames[selectedMonth]}
            </div>
        `);
    }

    tasksForSelectedDay.forEach(task => {
        const statusClass = task.isCompleted ? 'completed' : '';
        const statusData  = task.isCompleted ? 'completed' : 'pending';
        const dateObj     = new Date(task.dueDate);
        const formattedDate = dateObj.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });

        listDiv.insertAdjacentHTML('beforeend', `
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
        `);
    });

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

// Funkcja czyszczπca stan formularza
function resetTaskForm() {
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
    
    // Reset daty
    const dateBtn = document.getElementById('date-picker-btn');
    dateBtn.textContent = 'Wybierz datÍ...';
    dateBtn.style.color = 'var(--text-main)';
    
    // Reset selectÛw do pierwszej domyúlnej opcji z bazy
    const statusSelect = document.getElementById('task-status');
    const tagSelect = document.getElementById('task-tag');
    if (statusSelect.options.length > 0) statusSelect.selectedIndex = 0;
    if (tagSelect.options.length > 0) tagSelect.selectedIndex = 0;
}


// --- 7. OBS£UGA OKIENKA (POP-UP) I MINI KALENDARZA ---
const modal = document.getElementById('task-modal');
const openBtn = document.getElementById('add-task-btn');
const closeBtn = document.getElementById('close-modal-btn');
const datePickerBtn = document.getElementById('date-picker-btn');
const miniCalendar = document.getElementById('mini-calendar-container');

// Otwieranie okienka
// Otwieranie okienka i leniwe ≥adowanie s≥ownikÛw (Lazy Loading)
openBtn.addEventListener('click', async () => {
    modal.classList.remove('hidden');
    
    // Zmieniamy kursor na czas ≥adowania, øeby user wiedzia≥, øe coú siÍ dzieje
    document.body.style.cursor = 'wait';
    await fetchFormDictionaries();
    document.body.style.cursor = 'default';
});

// Zamykanie okienka (krzyøykiem)
closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    miniCalendar.classList.add('hidden'); 
    resetTaskForm(); // Czyúcimy stan formularza
});

// Zamykanie okienka po klikniÍciu w ciemne t≥o poza nim
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
        miniCalendar.classList.add('hidden');
        resetTaskForm(); // Czyúcimy stan formularza
    }
});

// Chowanie mini-kalendarza po klikniÍciu poza jego obszar (utrata "aktywnoúci")
document.addEventListener('click', (event) => {
    if (!miniCalendar.classList.contains('hidden')) {
        if (!miniCalendar.contains(event.target) && event.target !== datePickerBtn) {
            miniCalendar.classList.add('hidden');
        }
    }
});

// Zmienne tylko dla ma≥ego kalendarza, øeby nie psuÊ g≥Ûwnego
let miniMonth = new Date().getMonth();
let miniYear = new Date().getFullYear();

// Pokazywanie mini kalendarza po klikniÍciu w pole daty
datePickerBtn.addEventListener('click', () => {
    miniCalendar.classList.toggle('hidden');
    // Ustawiamy ma≥y kalendarz na aktualny miesiπc g≥Ûwnego widoku
    miniMonth = currentMonth;
    miniYear = currentYear;
    renderMiniCalendar();
});

// Funkcja rysujπca ma≥y kalendarzyk
function renderMiniCalendar() {
    document.getElementById('mini-month-year').textContent = `${monthNames[miniMonth]} ${miniYear}`;
    const grid = document.getElementById('mini-calendar-grid');
    grid.innerHTML = '';

    const daysInMonth = new Date(miniYear, miniMonth + 1, 0).getDate();
    let firstDayIndex = new Date(miniYear, miniMonth, 1).getDay();
    if (firstDayIndex === 0) firstDayIndex = 7;

    for(let i = 1; i < firstDayIndex; i++) {
        grid.appendChild(document.createElement('div'));
    }

    for(let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;
        
        // Zmniejszamy dni, by pasowa≥y do ma≥ego okienka
        dayDiv.style.minHeight = '30px'; 
        dayDiv.style.fontSize = '14px';

        // Co siÍ dzieje po wybraniu dnia
        dayDiv.addEventListener('click', () => {
            const formattedDate = `${i} ${monthNames[miniMonth].toLowerCase()} ${miniYear}`;
            datePickerBtn.textContent = formattedDate;
            datePickerBtn.style.color = "var(--accent-green)";
            miniCalendar.classList.add('hidden');
        });

        grid.appendChild(dayDiv);
    }
}

// Strza≥ki w mini kalendarzu
document.getElementById('mini-prev').addEventListener('click', () => {
    miniMonth--;
    if(miniMonth < 0) { miniMonth = 11; miniYear--; }
    renderMiniCalendar();
});

document.getElementById('mini-next').addEventListener('click', () => {
    miniMonth++;
    if(miniMonth > 11) { miniMonth = 0; miniYear++; }
    renderMiniCalendar();
});

// --- 8. WYSY£ANIE NOWEGO ZADANIA (POST) ---
const saveBtn = document.querySelector('.btn-save');

saveBtn.addEventListener('click', async () => {
    // 1. Zbieramy dane za pomocπ ID (czysto, szybko, bezpiecznie)
    const titleInput = document.getElementById('task-title').value;
    const descInput = document.getElementById('task-desc').value;
    const statusSelect = document.getElementById('task-status');
    const tagSelect = document.getElementById('task-tag');
    const dateValue = document.getElementById('date-picker-btn').textContent;

    // Pobieramy ID statusu i tagu (wartoúci ukryte w <option value="...">)
    const statusId = statusSelect.value;
    const tagId = tagSelect.value;
    
    // Z tagu pobieramy teø od razu jego kolor, øeby wys≥aÊ go z zadaniem
    // Uøywamy selectedOptions[0] aby dobraÊ siÍ do konkretnego, wybranego elementu na liúcie
    let colorVar = "var(--color-blue)"; // Zabezpieczenie domyúlne
    if (tagSelect.selectedOptions.length > 0) {
        colorVar = tagSelect.selectedOptions[0].getAttribute('data-color') || colorVar;
    }

    // 2. Prosta walidacja frontowa
    if (titleInput.trim() === "" || dateValue === "Wybierz date...") {
        alert("Wypelnij tytul i wybierz date!");
        return;
    }

    // 3. Budujemy Payload (dane dla Pythona)
    const payload = {
        title: titleInput,
        description: descInput,
        status_id: parseInt(statusId), // Parsujemy na liczby, bo baza rzadko przyjmuje stringi do kluczy obcych
        tag_id: parseInt(tagId),
        colorVar: colorVar, 
        dueDate: dateValue 
    };

    // 4. Wys≥anie requestu do API
    try {
        saveBtn.disabled = true; 
        saveBtn.textContent = "ZAPISYWANIE...";

        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`B≥πd serwera: ${response.status}`);
        }

        const result = await response.json();
        console.log("Sukces! Dodano zadanie:", result);

        // 5. Sprzπtanie po sukcesie
        modal.classList.add('hidden');
        resetTaskForm(); // Wywo≥ujemy nowπ, czystπ funkcjÍ
        
        // Odúwieøamy listÍ zadaÒ, øeby nowe zadanie wskoczy≥o na ekran
        fetchTasksForCurrentView();

    } catch (error) {
        console.error("B≥πd zapisu:", error);
        alert("Wystπpi≥ problem z po≥πczeniem z serwerem.");
    } finally {
        // Przywracamy guzik do stanu uøywalnoúci
        saveBtn.disabled = false;
        saveBtn.textContent = "DODAJ ZADANIE";
    }
});

// --- 9. £ADOWANIE S£OWNIK”W DO FORMULARZA (GET - LAZY LOADING) ---
async function fetchFormDictionaries() {
    const statusSelect = document.getElementById('task-status');
    const tagSelect = document.getElementById('task-tag');

    // WZORZEC CACHE: Sprawdzamy, czy dane juø tam sπ.
    // Jeúli tak, przerywamy funkcjÍ (return), by nie robiÊ zbÍdnych zapytaÒ do API.
    if (statusSelect.options.length > 0 && tagSelect.options.length > 0) {
        return;
    }

    try {
        // Puszczamy oba zapytania rÛwnolegle (Promise.all), øeby by≥o 2x szybciej
        const [statusResponse, tagResponse] = await Promise.all([
            fetch('/api/statuses'),
            fetch('/api/tags')
        ]);

        if (statusResponse.ok) {
            const statuses = await statusResponse.json();
            statusSelect.innerHTML = statuses.map(s => 
                `<option value="${s.id}">${s.name}</option>`
            ).join('');
        }

        if (tagResponse.ok) {
            const tags = await tagResponse.json();
            tagSelect.innerHTML = tags.map(t => 
                `<option value="${t.id}" data-color="${t.color}">${t.name}</option>`
            ).join('');
        }
    } catch (error) {
        console.error("B≥πd sieciowy podczas ≥adowania s≥ownikÛw:", error);
    }
}

// START APLIKACJI
fetchDateFromAPI();