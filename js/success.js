// VulneraAI Success Page JavaScript

const SCAN_TYPE_NAME = 'Полный пентест веб-сайта';

// Загрузка данных завершенного сканирования
function loadCompletedScan() {
    const scanDataStr = localStorage.getItem('completedScan');
    
    if (!scanDataStr) {
        // Если нет данных, перенаправляем на главную
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const scanData = JSON.parse(scanDataStr);
        
        // Отображаем данные
        document.getElementById('successWebsite').textContent = scanData.website;
        document.getElementById('successEmail').textContent = scanData.email;
        document.getElementById('successScanType').textContent = SCAN_TYPE_NAME;
        
        // Очищаем данные после отображения
        localStorage.removeItem('completedScan');
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        window.location.href = 'index.html';
    }
}

// Инициализация
loadCompletedScan();