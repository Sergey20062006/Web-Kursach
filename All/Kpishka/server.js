require('dotenv').config();

const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


// ПІДКЛЮЧЕННЯ ДО БАЗИ ДАНИХ 
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,         
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME   
});

db.connect((err) => {
    if (err) {
        console.error('Помилка підключення до бази даних:', err);
        return;
    }
    console.log('Успішно підключено до бази даних MySQL!');
});

// МАРШРУТ ДЛЯ РЕЄСТРАЦІЇ
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        //Шифруємо пароль (робимо його нечитабельним набором символів)
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
        
        db.query(sql, [username, hashedPassword], (err, result) => {
            if (err) {
                // Якщо помилка 'ER_DUP_ENTRY', значить такий логін вже є
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Користувач з таким логіном вже існує!' });
                }
                console.error('Помилка БД:', err);
                return res.status(500).json({ message: 'Помилка бази даних' });
            }
            res.json({ message: 'Реєстрація успішна!' });
        });
    } catch (error) {
        console.error('Помилка сервера:', error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

// МАРШРУТ ДЛЯ ВХОДУ
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 1. Шукаємо користувача в базі за логіном
    const sql = 'SELECT * FROM users WHERE BINARY username = ?';
    
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Помилка БД:', err);
            return res.status(500).json({ message: 'Помилка бази даних' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Користувача не знайдено' });
        }

        const user = results[0];

        // 2. Порівнюємо введений пароль із зашифрованим у базі
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({ 
                message: 'Вхід успішний!',
                user: { id: user.id, username: user.username } 
            });
        } else {
            res.status(401).json({ message: 'Невірний пароль' });
        }
    });
});

// Головний маршрут: коли користувач просто заходить на сайт
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// МАРШРУТ ДЛЯ СТВОРЕННЯ НОТАТКИ
app.post('/api/notes', (req, res) => {
    const { userId, title, priority, isChecklist, content, checklistItems, folderId } = req.body;
    // Якщо folderId не передали (або порожній рядок), записуємо null
    const finalFolderId = folderId ? folderId : null; 

    const sqlNote = 'INSERT INTO notes (user_id, title, content, priority, folder_id) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sqlNote, [userId, title, content, priority, finalFolderId], (err, result) => {
        if (err) {
            console.error('Помилка запису нотатки:', err);
            return res.status(500).json({ message: 'Помилка бази даних' });
        }

        const newNoteId = result.insertId; 

        // Якщо це був чек-лист, записуємо його пункти в таблицю `mitca`
        if (isChecklist && checklistItems.length > 0) {
            // Формуємо масив значень для MySQL [note_id, 'текст', 0]
            const values = checklistItems.map(itemText => [newNoteId, itemText, 0]);
            const sqlMitca = 'INSERT INTO mitca (note_id, task_text, is_done) VALUES ?';

            db.query(sqlMitca, [values], (errMitca) => {
                if (errMitca) {
                    console.error('Помилка запису чек-листа:', errMitca);
                    return res.status(500).json({ message: 'Помилка запису пунктів' });
                }
                res.json({ message: 'Нотатку з чек-листом успішно збережено' });
            });
        } else {
            res.json({ message: 'Нотатку успішно збережено' });
        }
    });
});

// МАРШРУТ ДЛЯ ОТРИМАННЯ НОТАТОК КОРИСТУВАЧА
app.get('/api/notes/:userId', (req, res) => {
    const userId = req.params.userId;

    // Вибираємо нотатки тільки цього користувача і тільки ті, що не в кошику (archived = 0)
    // Сортуємо їх так, щоб найновіші були першими (ORDER BY created DESC)
    // крім нотатки, рахуємо загальну кількість міток (total_items) і кількість виконаних (done_items)
    const sql = `
        SELECT n.*, 
        (SELECT COUNT(*) FROM mitca WHERE note_id = n.id) AS total_items,
        (SELECT COUNT(*) FROM mitca WHERE note_id = n.id AND is_done = 1) AS done_items
        FROM notes n 
        WHERE n.user_id = ? AND n.archived = 0 
        ORDER BY n.priority DESC, n.created DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Помилка отримання нотаток:', err);
            return res.status(500).json({ message: 'Помилка бази даних' });
        }
        res.json(results);
    });
});

// МАРШРУТ ДЛЯ ОТРИМАННЯ ПУНКТІВ ЧЕК-ЛИСТА КОНКРЕТНОЇ НОТАТКИ
app.get('/api/notes/:noteId/items', (req, res) => {
    const noteId = req.params.noteId;
    
    const sql = 'SELECT * FROM mitca WHERE note_id = ?';
    
    db.query(sql, [noteId], (err, results) => {
        if (err) {
            console.error('Помилка отримання міток:', err);
            return res.status(500).json({ message: 'Помилка бази даних' });
        }
        res.json(results);
    });
});

// МАРШРУТ ДЛЯ ОНОВЛЕННЯ ІСНУЮЧОЇ НОТАТКИ
app.put('/api/notes/:noteId', (req, res) => {
    const noteId = req.params.noteId;

    const { title, priority, isChecklist, content, checklistItems, folderId } = req.body;
    const finalFolderId = folderId ? folderId : null;

    const sqlNote = 'UPDATE notes SET title = ?, content = ?, priority = ?, folder_id = ? WHERE id = ?';
    
    db.query(sqlNote, [title, content, priority, finalFolderId, noteId], (err) => {
        if (err) return res.status(500).json({ message: 'Помилка бази даних' });

        // Якщо це чек-лист
        if (isChecklist) {
            // видаляємо старі мітки цієї нотатки і записуємо нові
            db.query('DELETE FROM mitca WHERE note_id = ?', [noteId], () => {
                if (checklistItems && checklistItems.length > 0) {
                    // Тепер ми будемо передавати масив об'єктів: текст і стан галочки (0 або 1)
                    const values = checklistItems.map(item => [noteId, item.text, item.isDone]);
                    const sqlMitca = 'INSERT INTO mitca (note_id, task_text, is_done) VALUES ?';
                    
                    db.query(sqlMitca, [values], () => res.json({ message: 'Оновлено успішно' }));
                } else {
                    res.json({ message: 'Оновлено успішно' });
                }
            });
        } else {
            res.json({ message: 'Оновлено успішно' });
        }
    });
});

// МАРШРУТ ДЛЯ ПЕРЕМІЩЕННЯ В АРХІВ
app.put('/api/notes/:noteId/archive', (req, res) => {
    const noteId = req.params.noteId;
    const sql = 'UPDATE notes SET archived = 1 WHERE id = ?';
    
    db.query(sql, [noteId], (err) => {
        if (err) return res.status(500).json({ message: 'Помилка бази даних' });
        res.json({ message: 'Нотатку переміщено в архів' });
    });
});

// МАРШРУТ ДЛЯ ОТРИМАННЯ НОТАТОК З АРХІВУ
app.get('/api/notes/:userId/archive', (req, res) => {
    const userId = req.params.userId;
    // Шукаємо нотатки де archived = 1 (в кошику)
    const sql = 'SELECT * FROM notes WHERE user_id = ? AND archived = 1 ORDER BY priority DESC, created DESC';
    
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Помилка бази даних' });
        res.json(results);
    });
});

// МАРШРУТ ДЛЯ ВІДНОВЛЕННЯ З АРХІВУ
app.put('/api/notes/:noteId/restore', (req, res) => {
    const noteId = req.params.noteId;
    const sql = 'UPDATE notes SET archived = 0 WHERE id = ?';
    
    db.query(sql, [noteId], (err) => {
        if (err) return res.status(500).json({ message: 'Помилка відновлення' });
        res.json({ message: 'Нотатку відновлено' });
    });
});

// МАРШРУТ ДЛЯ ПОВНОГО ВИДАЛЕННЯ
app.delete('/api/notes/:noteId', (req, res) => {
    const noteId = req.params.noteId;
    const sql = 'DELETE FROM notes WHERE id = ?';
    
    db.query(sql, [noteId], (err) => {
        if (err) return res.status(500).json({ message: 'Помилка видалення' });
        res.json({ message: 'Видалено назавжди' });
    });
});

// Отримати всі папки користувача
app.get('/api/folders/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = 'SELECT * FROM folders WHERE user_id = ?';
    
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Помилка бази даних' });
        res.json(results);
    });
});

// Створити нову папку
app.post('/api/folders', (req, res) => {
    const { userId, name } = req.body;
    const sql = 'INSERT INTO folders (user_id, name) VALUES (?, ?)';
    
    db.query(sql, [userId, name], (err, result) => {
        if (err) return res.status(500).json({ message: 'Помилка бази даних' });
        res.json({ id: result.insertId, name: name }); 
    });
});

app.listen(PORT, () => {
    console.log(`Сервер успішно запущено! Перейди за посиланням: http://localhost:${PORT}`);
});