/* Đọc / ghi dữ liệu trên trình duyệt của từng người dùng */
const STORAGE_KEY = 'app_t_history_v1';
let saveTimer;

const setStatus = (text) => {
  const el = $('#st');
  if (el) el.textContent = text;
};

/* Tự lưu sau 0,5 giây */
function save() {
  renderCal();
  setStatus('Đang lưu…');
  clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.db));
      setStatus('✓ Đã lưu trên thiết bị này');
    } catch (error) {
      console.error('Không thể lưu dữ liệu:', error);
      setStatus('⚠ Không lưu được. Có thể đã vượt dung lượng.');
    }
  }, 500);
}

/* Đọc dữ liệu đã lưu */
async function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      state.db = { days: {} };
      setStatus('✓ Sẵn sàng — dữ liệu sẽ lưu trên thiết bị này');
      return;
    }

    const data = JSON.parse(raw);
    state.db = data && data.days
      ? data
      : { days: {} };

    setStatus('✓ Đã tải dữ liệu trên thiết bị này');
  } catch (error) {
    console.error('Lỗi đọc dữ liệu:', error);
    state.db = { days: {} };
    setStatus('⚠ Không đọc được dữ liệu đã lưu');
  }
}