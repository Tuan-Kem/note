/* Tiện ích dùng chung + trạng thái toàn cục */
const $ = (sel) => document.querySelector(sel);
const p2 = (n) => String(n).padStart(2, '0');
const VN = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

/* Ngày: khóa "2026-10-13" <-> hiển thị "13/10/2026" */
const ymd = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const parseKey = (k) => new Date(k + 'T00:00');
const fmtDate = (k) => k.split('-').reverse().join('/');
const fmtDateLong = (k) => `${VN[parseKey(k).getDay()]}, ${fmtDate(k)}`;
const nowHM = () => {
  const n = new Date();
  return `${p2(n.getHours())}:${p2(n.getMinutes())}`;
};
const firstOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);

/* Tạo phần tử DOM: h('div', {className:'a'}, con1, con2) */
function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  Object.assign(el, props);
  children.flat().forEach((c) => el.append(c));
  return el;
}

/* Trạng thái chung của ứng dụng */
const state = {
  db: { days: {} },              // dữ liệu: { days: { "2026-10-13": { items: [...] } } }
  sel: ymd(new Date()),          // ngày đang chọn
  view: firstOfMonth(new Date()) // tháng đang xem
};
const items = (k) => (state.db.days[k] || {}).items || [];
const byTime = (a, b) => a.time.localeCompare(b.time);

/* Đếm việc trong checklist: { total, done, pct } */
function todoStats(list) {
  const total = list.length;
  const done = list.filter((r) => r.d).length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}
