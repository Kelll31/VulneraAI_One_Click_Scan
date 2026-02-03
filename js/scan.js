// VulneraAI Quick Scan - Main JavaScript

const API_BASE = 'http://91.201.252.14/api';

// Цены для разных типов сканирования
const SCAN_PRICES = {
    quick: 500,
    full: 1500,
    comprehensive: 3000
};

// Функция для показа уведомлений
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    // Автоматически скрыть через 5 секунд
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// Валидация URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Валидация email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Обработка формы
document.getElementById('scanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const website = document.getElementById('website').value.trim();
    const email = document.getElementById('email').value.trim();
    const scanType = document.querySelector('input[name="scanType"]:checked').value;
    
    // Валидация
    if (!isValidUrl(website)) {
        showAlert('Пожалуйста, введите корректный URL (например: https://example.com)', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Пожалуйста, введите корректный email адрес', 'error');
        return;
    }
    
    // Показываем загрузку
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Создаем заказ на сканирование
        const scanData = {
            website: website,
            email: email,
            scan_type: scanType,
            price: SCAN_PRICES[scanType]
        };
        
        // Сохраняем данные в localStorage для страницы оплаты
        localStorage.setItem('pendingScan', JSON.stringify(scanData));
        
        // Показываем успешное сообщение
        showAlert('Данные сохранены. Перенаправление на страницу оплаты...', 'success');
        
        // Перенаправляем на страницу оплаты через 1.5 секунды
        setTimeout(() => {
            window.location.href = 'payment.html';
        }, 1500);
        
    } catch (error) {
        console.error('Ошибка:', error);
        showAlert('Произошла ошибка. Пожалуйста, попробуйте еще раз.', 'error');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// Анимация при выборе типа сканирования
document.querySelectorAll('input[name="scanType"]').forEach(radio => {
    radio.addEventListener('change', () => {
        // Можно добавить дополнительную анимацию или логику
    });
});

// Автоматическое добавление https:// если не указан протокол
document.getElementById('website').addEventListener('blur', (e) => {
    let url = e.target.value.trim();
    if (url && !url.match(/^https?:\/\//i)) {
        e.target.value = 'https://' + url;
    }
});