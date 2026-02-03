// VulneraAI Success Page JavaScript

const SCAN_TYPE_NAMES = {
    quick: 'Быстрое сканирование',
    full: 'Полное сканирование',
    comprehensive: 'Комплексное сканирование'
};

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
        document.getElementById('successScanType').textContent = SCAN_TYPE_NAMES[scanData.scan_type] || scanData.scan_type;
        
        // Очищаем данные после отображения
        localStorage.removeItem('completedScan');
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        window.location.href = 'index.html';
    }
}

// Инициализация
loadCompletedScan();