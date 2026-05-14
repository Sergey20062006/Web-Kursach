// Перевіряємо, чи користувач авторизований
const userId = localStorage.getItem('userId');
if (!userId) {
    window.location.href = 'login.html';
}

// Функція завантаження кошика
async function loadArchive() {
    try {
        const response = await fetch(`/api/notes/${userId}/archive`);
        const notes = await response.json();
        const grid = document.getElementById('archive-grid');
        
        grid.innerHTML = ''; 

        if (notes.length === 0) {
            grid.innerHTML = '<p style="color: #888; font-size: 18px;">Твій кошик порожній.</p>';
            return;
        }

        // Малюємо картки
        notes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';
            
            let priorityText = '🟢 Звичайний';
            if (note.priority === 2) priorityText = '🟡 Середній';
            if (note.priority === 3) priorityText = '🔴 Важливий';

            let previewText = note.content ? note.content.substring(0, 50) + '...' : 'Чек-лист...';
            
            // Додаємо дві кнопки (Відновити та Видалити) прямо всередину картки
            card.innerHTML = `
                <div style="font-size: 12px; color: #888; margin-bottom: 8px;">${priorityText}</div>
                <h3 style="margin-top: 0; margin-bottom: 10px;">${note.title || 'Без заголовка'}</h3>
                <p style="color: #555; font-size: 14px; margin-bottom: 20px;">${previewText}</p>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-small restore-btn" data-id="${note.id}" style="background-color: #28a745; color: white;"><i class="fas fa-undo"></i></button>
                    <button class="btn-small delete-btn-hard" data-id="${note.id}" style="background-color: #dc3545; color: white;"><i class="fas fa-trash"></i></button>
                </div>
            `;
            grid.appendChild(card);
        });

        // Додаємо дію для кнопок "Відновити"
        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', async (event) => {
                const noteId = event.currentTarget.getAttribute('data-id');
                await fetch(`/api/notes/${noteId}/restore`, { method: 'PUT' });
                loadArchive(); 
            });
        });

        // Додаємо дію для кнопок "Видалити назавжди"
        document.querySelectorAll('.delete-btn-hard').forEach(btn => {
            btn.addEventListener('click', async (event) => {
                const confirmDelete = confirm('Видалити нотатку НАЗАВЖДИ з бази даних?');
                if (confirmDelete) {
                    const noteId = event.currentTarget.getAttribute('data-id');
                    await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
                    loadArchive(); 
                }
            });
        });

    } catch (error) {
        console.error('Помилка завантаження архіву:', error);
    }
}

// Запускаємо при відкритті сторінки
loadArchive();