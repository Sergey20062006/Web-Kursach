// Знаходимо форми та кнопки-посилання
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');

// Коли клікаємо на "Зареєструватися"
showRegisterBtn.addEventListener('click', function(event) {
    event.preventDefault();
    loginForm.style.display = 'none';    // Ховаємо форму входу
    registerForm.style.display = 'block'; // Показуємо форму реєстрації
});

// Коли клікаємо на "Увійти"
showLoginBtn.addEventListener('click', function(event) {
    event.preventDefault();
    registerForm.style.display = 'none'; // Ховаємо форму реєстрації
    loginForm.style.display = 'block';   // Показуємо форму входу
});

// ЛОГІКА РЕЄСТРАЦІЇ
registerForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;

    // Перевіряємо, чи збігаються паролі
    if (password !== passwordConfirm) {
        alert('Помилка: Паролі не збігаються!');
        return;
    }

    // Відправляємо дані на сервер за допомогою fetch
    try {
        const response = await fetch('/register', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json' // Кажемо серверу, що шлемо JSON
            },
            body: JSON.stringify({ username: username, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Супер! ' + data.message + ' Тепер ти можеш увійти.');
            registerForm.reset(); // Очищаємо поля форми реєстрації
            
            // Автоматично перемикаємо на форму входу
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        } else {
            alert('Помилка: ' + data.message);
        }
    } catch (error) {
        console.error('Помилка відправки:', error);
        alert('Сталася помилка з\'єднання з сервером.');
    }
});

// ЛОГІКА ВХОДУ
loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Зберігаємо ID користувача в пам'яті браузера (щоб знати, чиї нотатки показувати)
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('username', data.user.username);

            alert('Успішно!');
            
            window.location.href = 'dashboard.html';
        } else {
            alert('Помилка: ' + data.message);
        }
    } catch (error) {
        console.error('Помилка входу:', error);
        alert('Сталася помилка при спробі входу.');
    }
});