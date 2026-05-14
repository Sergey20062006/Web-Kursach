// 1. ПЕРЕВІРКА АВТОРИЗАЦІЇ
// Дістаємо дані з пам'яті браузера
const userId = localStorage.getItem('userId');
const username = localStorage.getItem('username');

// Змінна, яка пам'ятає ID нотатки, яку ми зараз відкрили (null - якщо створюємо нову)
let currentEditNoteId = null;

let currentFolderId = null; // null означає, що ми дивимося "Всі нотатки"

// Якщо ID немає, значить користувач не ввійшов 
if (!userId) {
    alert('Будь ласка, увійдіть у систему!');
    window.location.href = 'login.html';
}

// 2. ВІДОБРАЖЕННЯ ПРОФІЛЮ
document.getElementById('profile-name').textContent = username;

// 3. ЛОГІКА ВИПАДАЮЧОГО МЕНЮ ПРОФІЛЮ
const profileBtn = document.getElementById('profile-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

profileBtn.addEventListener('click', () => {
    if (dropdownMenu.style.display === 'block') {
        dropdownMenu.style.display = 'none';
    } else {
        dropdownMenu.style.display = 'block';
    }
});

// 4. ЛОГІКА КНОПКИ "ВИЙТИ"
const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    // Видаляємо всі дані з пам'яті браузера
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
});

// 5. РОБОТА З МОДАЛЬНИМ ВІКНОМ
const modal = document.getElementById('note-modal');
const addNoteBtn = document.getElementById('add-note-btn');
const closeModalBtn = document.getElementById('close-modal');
const modeToggleDiv = document.querySelector('.mode-toggle'); 

// Коли натискаємо на кнопку "Додати нотатку" 
addNoteBtn.addEventListener('click', () => {
    modal.style.display = 'flex'; 
});

// Коли натискаємо на хрестик
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none'; 
});

// Коли клікаємо десь поза білим вікном (на темний фон)
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// 6. ПЕРЕМИКАЧ РЕЖИМІВ (Текст / Чек-лист)
const checklistToggle = document.getElementById('checklist-toggle');
const noteTextArea = document.getElementById('note-text');
const checklistArea = document.getElementById('checklist-area');

checklistToggle.addEventListener('change', () => {
    if (checklistToggle.checked) {
        // Якщо галочка стоїть: ховаємо текст, показуємо чек-лист
        noteTextArea.style.display = 'none';
        checklistArea.style.display = 'block';
    } else {
        // Якщо галочки немає: показуємо текст, ховаємо чек-лист
        noteTextArea.style.display = 'block';
        checklistArea.style.display = 'none';
    }
});

// 7. ЛОГІКА ДОДАВАННЯ ПУНКТІВ ЧЕК-ЛИСТА
const addTodoBtn = document.getElementById('add-todo-btn');
const todoItemsList = document.getElementById('todo-items-list');

addTodoBtn.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'todo-item';
    
    // ДОДАЛИ СЮДИ ГАЛОЧКУ (checkbox)
    div.innerHTML = `
        <input type="checkbox" class="todo-check">
        <input type="text" class="todo-input" placeholder="Що треба зробити?">
        <button class="remove-todo-btn" title="Видалити пункт">&times;</button>
    `;
    
    todoItemsList.appendChild(div);

    const removeBtn = div.querySelector('.remove-todo-btn');
    removeBtn.addEventListener('click', () => {
        div.remove();
    });
});

// 8. ЗБЕРЕЖЕННЯ ТА ОНОВЛЕННЯ НОТАТКИ
const saveNoteBtn = document.getElementById('save-note-btn');

saveNoteBtn.addEventListener('click', async () => {
    const title = document.getElementById('note-title').value;
    const priority = document.getElementById('note-priority').value;
    const folderId = document.getElementById('note-folder').value;
    const isChecklist = checklistToggle.checked;
    
    let content = '';
    let checklistItems = [];

    if (isChecklist) {
        // Збираємо всі пункти: і текст, і чи стоїть галочка "виконано"
        const items = document.querySelectorAll('.todo-item');
        items.forEach(item => {
            const textInput = item.querySelector('.todo-input');
            const checkInput = item.querySelector('.todo-check');
            if (textInput && textInput.value.trim() !== '') {
                checklistItems.push({
                    text: textInput.value.trim(),
                    isDone: checkInput.checked ? 1 : 0 // 1 якщо галочка є, 0 якщо немає
                });
            }
        });
    } else {
        content = document.getElementById('note-text').value;
    }

    // Визначаємо метод і URL
    // Якщо currentEditNoteId існує — значить оновлюємо (PUT). Якщо ні — створюємо (POST).
    const method = currentEditNoteId ? 'PUT' : 'POST';
    const url = currentEditNoteId ? `/api/notes/${currentEditNoteId}` : '/api/notes';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                title: title,
                priority: priority,
                isChecklist: isChecklist,
                content: content,
                checklistItems: checklistItems,
                folderId: folderId
            })
        });

        if (response.ok) {
            modal.style.display = 'none';
            loadNotes(); // Оновлюємо сітку
        }
    } catch (error) {
        console.error('Помилка збереження:', error);
    }
});

// 8.1. ВІДПРАВКА В АРХІВ
const deleteNoteBtn = document.getElementById('delete-note-btn');

deleteNoteBtn.addEventListener('click', async () => {
    if (!currentEditNoteId) {
        modal.style.display = 'none';
        return;
    }

    const confirmDelete = confirm('Ви впевнені, що хочете перемістити цю нотатку в архів?');
    
    if (confirmDelete) {
        try {
            const response = await fetch(`/api/notes/${currentEditNoteId}/archive`, {
                method: 'PUT' // Оновлюємо поле archived
            });

            if (response.ok) {
                modal.style.display = 'none';
                loadNotes(); // Оновлюємо сітку
            }
        } catch (error) {
            console.error('Помилка видалення:', error);
        }
    }
});

// 9. ФУНКЦІЯ ЗАВАНТАЖЕННЯ ТА ВІДОБРАЖЕННЯ НОТАТОК
async function loadNotes() {
    try {
        const response = await fetch(`/api/notes/${userId}`);
        let notes = await response.json();

        const notesGrid = document.getElementById('notes-grid');

        // Якщо обрана якась папка, залишаємо тільки її нотатки
        if (currentFolderId !== null) {
            notes = notes.filter(note => note.folder_id == currentFolderId);
        }
        
        // Очищаємо сітку, залишаючи тільки стартову кнопку "Додати нотатку"
        notesGrid.innerHTML = `
            <div class="note-card add-note-card" id="add-note-btn">
                <i class="fas fa-plus"></i>
                <p>Додати нотатку</p>
            </div>
        `;

        // Оскільки ми перемалювали HTML, треба заново "повісити" подію на кнопку додавання
        document.getElementById('add-note-btn').addEventListener('click', () => {
            currentEditNoteId = null; // Кажемо програмі: "Ми створюємо НОВУ нотатку"

            modeToggleDiv.style.display = 'block';

            // Очищаємо форму від старих даних перед відкриттям
            document.getElementById('note-title').value = '';
            document.getElementById('note-text').value = '';
            document.getElementById('todo-items-list').innerHTML = '';
            checklistToggle.checked = false;
            checklistToggle.dispatchEvent(new Event('change'));
            
            modal.style.display = 'flex';
        });

        // Проходимося по кожній нотатці з бази і створюємо для неї картку
        notes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';
            
            if (note.total_items > 0) {
                // Якщо це чек-лист (є хоча б 1 пункт)
                if (note.total_items === note.done_items) {
                    // Варіант А: Всі пункти виконані
                    card.classList.add('note-completed');
                } else {
                    // Варіант Б: Є невиконані пункти (активний чек-лист)
                    card.classList.add('note-checklist-active');
                }
            }
            // Варіант В: Якщо total_items = 0, то це звичайна текстова нотатка (нічого не робимо, залишається білою)
            
            let priorityText = '🟢 Звичайний';
            if (note.priority === 2) priorityText = '🟡 Середній';
            if (note.priority === 3) priorityText = '🔴 Важливий';

            // Робимо прев'ю тексту
            let previewText = note.content ? note.content.substring(0, 50) + '...' : 'Чек-лист...';
            
            card.innerHTML = `
                <div style="font-size: 12px; color: #888; margin-bottom: 8px;">${priorityText}</div>
                <h3 style="margin-top: 0; margin-bottom: 10px;">${note.title || 'Без заголовка'}</h3>
                <p style="color: #555; font-size: 14px;">${previewText}</p>
            `;

            // Додаємо картку в нашу сітку
            notesGrid.appendChild(card);

            // Додаємо подію кліку на кожну створену картку
            card.addEventListener('click', async () => {
                currentEditNoteId = note.id;

                // ХОВАЄМО блок вибору режиму (користувач не може його змінити: чек-лист чи звчиайни текст)
                modeToggleDiv.style.display = 'none';

                document.getElementById('note-title').value = note.title;
                document.getElementById('note-priority').value = note.priority;
                document.getElementById('note-folder').value = note.folder_id || '';
                
                // Перевіряємо, це текст чи чек-лист
                if (note.content && note.content.trim() !== '') {
                    // ЦЕ ЗВИЧАЙНИЙ ТЕКСТ
                    checklistToggle.checked = false;
                    document.getElementById('note-text').value = note.content;
                    document.getElementById('todo-items-list').innerHTML = ''; // Очищаємо старі мітки
                } else {
                    // ЦЕ ЧЕК-ЛИСТ
                    checklistToggle.checked = true;
                    document.getElementById('note-text').value = '';
                    
                    const resp = await fetch(`/api/notes/${note.id}/items`);
                    const items = await resp.json();
                    
                    const list = document.getElementById('todo-items-list');
                    list.innerHTML = ''; // Очищаємо перед додаванням
                    
                    // Малюємо кожен пункт списку
                    items.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'todo-item';
                        
                        div.innerHTML = `
                            <input type="checkbox" class="todo-check" ${item.is_done ? 'checked' : ''}>
                            <input type="text" class="todo-input" value="${item.task_text}">
                            <button class="remove-todo-btn" title="Видалити пункт">&times;</button>
                        `;
                        list.appendChild(div);
                
                        div.querySelector('.remove-todo-btn').addEventListener('click', () => div.remove());
                    });
                }
                
                checklistToggle.dispatchEvent(new Event('change'));
                
                modal.style.display = 'flex';
            });
        });

    } catch (error) {
        console.error('Помилка завантаження нотаток:', error);
    }
}

// 10. ЖИВИЙ ПОШУК
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', (event) => {
    // 1. Беремо текст, який ввів користувач, і переводимо в малі літери (щоб пошук не залежав від регістру)
    const searchText = event.target.value.toLowerCase().trim();
    
    // 2. Знаходимо всі картки на екрані
    const cards = document.querySelectorAll('.note-card');

    // 3. Перебираємо кожну картку
    cards.forEach(card => {
        if (card.id === 'add-note-btn') return;

        const titleElement = card.querySelector('h3');
        
        if (titleElement) {
            const titleText = titleElement.textContent.toLowerCase();
            
            // Якщо заголовок містить текст пошуку — показуємо, якщо ні — ховаємо
            if (titleText.includes(searchText)) {
                card.style.display = ''; 
            } else {
                card.style.display = 'none'; 
            }
        }
    });
});

// 11. ЛОГІКА БОКОВОГО МЕНЮ 
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');

// Функція відкриття меню
menuBtn.addEventListener('click', () => {
    sidebar.classList.add('open'); 
    sidebarOverlay.style.display = 'block'; 
});

// Функція закриття меню
function closeSidebar() {
    sidebar.classList.remove('open'); 
    sidebarOverlay.style.display = 'none'; 
}

closeSidebarBtn.addEventListener('click', closeSidebar);

sidebarOverlay.addEventListener('click', closeSidebar);

// 12. РОБОТА З ПАПКАМИ
async function loadFolders() {
    try {
        const response = await fetch(`/api/folders/${userId}`);
        const folders = await response.json();
        
        const folderList = document.getElementById('folder-list');
        const noteFolderSelect = document.getElementById('note-folder');
        
        // Очищаємо списки перед малюванням
        folderList.innerHTML = '';
        noteFolderSelect.innerHTML = '<option value="">Без папки</option>';
        
        // Малюємо "Всі нотатки"
        const allNotesHTML = `
            <li>
                <a href="#" class="${currentFolderId === null ? 'active' : ''}" id="view-all-notes">
                    <i class="fas fa-layer-group"></i> Всі нотатки
                </a>
            </li>`;
        folderList.insertAdjacentHTML('beforeend', allNotesHTML);

        // Вішаємо клік на "Всі нотатки"
        document.getElementById('view-all-notes').addEventListener('click', (e) => {
            e.preventDefault();
            currentFolderId = null; // Скидаємо папку
            loadFolders(); // Перемальовуємо, щоб підсвітити активну
            loadNotes();   // Завантажуємо всі нотатки
            closeSidebar();
        });

        // Малюємо кожну папку з бази
        folders.forEach(folder => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="#" class="${currentFolderId == folder.id ? 'active' : ''}">
                    <i class="fas fa-folder"></i> ${folder.name}
                </a>`;
            
            // Коли клікаємо на папку в меню
            li.addEventListener('click', (e) => {
                e.preventDefault();
                currentFolderId = folder.id; // Запам'ятовуємо обрану папку
                loadFolders(); 
                loadNotes(); 
                closeSidebar();
            });
            folderList.appendChild(li);

            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            noteFolderSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Помилка завантаження папок:', error);
    }
}

// Створення нової папки
document.getElementById('create-folder-btn').addEventListener('click', async () => {
    const folderName = prompt('Введіть назву нової папки:');
    if (!folderName || folderName.trim() === '') return;

    try {
        const response = await fetch('/api/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, name: folderName.trim() })
        });
        if (response.ok) {
            loadFolders(); // Оновлюємо список папок
        }
    } catch (error) {
        console.error('Помилка створення папки:', error);
    }
});

// Запускаємо завантаження папок при відкритті сторінки
loadFolders();

// Запускаємо цю функцію ОДРАЗУ, як тільки користувач заходить на сторінку
loadNotes();