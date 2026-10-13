// Trong file js/storage.js
const STORAGE_KEY = 'my_app_history';

// Hàm lấy dữ liệu
function loadHistory() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return { days: {} };
}

// Hàm lưu dữ liệu
function saveHistory(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}