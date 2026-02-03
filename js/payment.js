// VulneraAI Payment Page JavaScript

const API_BASE = 'http://91.201.252.14/api';

// Типы сканирования (для отображения)
const SCAN_TYPE_NAMES = {
    quick: 'Быстрое сканирование',
    full: 'Полное сканирование',
    comprehensive: 'Комплексное сканирование'
};

// Загрузка данных заказа
function loadOrderData() {
    const scanDataStr = localStorage.getItem('pendingScan');
    
    if (!scanDataStr) {
        // Если нет данных, перенаправляем на главную
        window.location.href = 'index.html';
        return null;
    }
    
    try {
        const scanData = JSON.parse(scanDataStr);
        
        // Отображаем данные заказа
        document.getElementById('orderWebsite').textContent = scanData.website;
        document.getElementById('orderEmail').textContent = scanData.email;
        document.getElementById('orderScanType').textContent = SCAN_TYPE_NAMES[scanData.scan_type] || scanData.scan_type;
        document.getElementById('orderPrice').textContent = `${scanData.price} ₽`;
        document.getElementById('btnPrice').textContent = `${scanData.price} ₽`;
        
        return scanData;
    } catch (error) {
        console.error('Ошибка загрузки данных заказа:', error);
        window.location.href = 'index.html';
        return null;
    }
}

// Показ уведомлений
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// Форматирование номера карты
function formatCardNumber(value) {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
        return parts.join(' ');
    } else {
        return value;
    }
}

// Форматирование срока действия
function formatExpiry(value) {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
        return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    
    return v;
}

// Инициализация
const orderData = loadOrderData();

if (orderData) {
    // Форматирование полей карты
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            e.target.value = formatCardNumber(e.target.value);
        });
    }
    
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            e.target.value = formatExpiry(e.target.value);
        });
    }
    
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/gi, '').substring(0, 3);
        });
    }
    
    // Обработка формы оплаты
    document.getElementById('paymentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        // Простая валидация для демо
        if (paymentMethod === 'card') {
            const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
            const expiry = document.getElementById('expiry').value;
            const cvv = document.getElementById('cvv').value;
            
            if (cardNumber.length < 16) {
                showAlert('Введите корректный номер карты', 'error');
                return;
            }
            
            if (!expiry.match(/^\d{2}\/\d{2}$/)) {
                showAlert('Введите корректный срок действия (MM/YY)', 'error');
                return;
            }
            
            if (cvv.length < 3) {
                showAlert('Введите корректный CVV код', 'error');
                return;
            }
        }
        
        // Показываем загрузку
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Здесь должна быть интеграция с платежной системой
            // Для демо просто имитируем успешную оплату
            
            showAlert('Обработка платежа...', 'info');
            
            // Имитация задержки
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Отправляем запрос на создание задачи сканирования
            const response = await fetch(`${API_BASE}/quick-scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    website: orderData.website,
                    email: orderData.email,
                    scan_type: orderData.scan_type,
                    payment_method: paymentMethod,
                    amount: orderData.price
                })
            });
            
            if (response.ok) {
                // Очищаем данные заказа
                localStorage.removeItem('pendingScan');
                
                // Сохраняем данные для страницы успеха
                localStorage.setItem('completedScan', JSON.stringify(orderData));
                
                // Перенаправляем на страницу успеха
                window.location.href = 'success.html';
            } else {
                throw new Error('Ошибка при создании задачи сканирования');
            }
            
        } catch (error) {
            console.error('Ошибка оплаты:', error);
            showAlert('Произошла ошибка при обработке платежа. Попробуйте еще раз.', 'error');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}