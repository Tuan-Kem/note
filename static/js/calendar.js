/* Lịch tháng: hiển thị ô ngày + xem trước nội dung */
function previewText(it) {
  if (it.type === 'note') return (it.text || '').split('\n')[0] || '(trống)';
  if (it.type === 'todo') {
    const s = todoStats(it.list);
    return `☑ ${s.done}/${s.total} ${it.title || ''}`;
  }
  if (it.type === 'image') return `🖼 ${it.caption || ''}`;
  return '✏ Hình vẽ';
}

function renderCal() {
  const { view, sel } = state;
  const month = view.getMonth();
  const todayKey = ymd(new Date());
  $('#mt').textContent = `Tháng ${p2(month + 1)}, ${view.getFullYear()}`;

  const grid = $('#cal');
  grid.innerHTML = '';
  ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].forEach((w) => grid.append(h('div', { className: 'wd', textContent: w })));

  const start = new Date(view.getFullYear(), month, 1);
  start.setDate(1 - ((start.getDay() + 6) % 7)); // lùi về thứ Hai đầu tuần

  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = ymd(d);
    const list = items(key).slice().sort(byTime);

    const cls = ['cell', d.getMonth() !== month && 'out', key === sel && 'sel', key === todayKey && 'today'];
    const cell = h('div', {
      className: cls.filter(Boolean).join(' '),
      onclick: () => { state.sel = key; renderCal(); renderDay(); },
    }, h('span', { className: 'n', textContent: p2(d.getDate()) }));

    list.slice(0, 3).forEach((it) => cell.append(h('div', { className: 'p', textContent: `${it.time} ${previewText(it)}` })));
    if (list.length > 3) cell.append(h('div', { className: 'p', textContent: `+${list.length - 3} nữa` }));
    grid.append(cell);
  }
}

function initCalendar() {
  const shift = (n) => { state.view.setMonth(state.view.getMonth() + n); renderCal(); };
  $('#pv').onclick = () => shift(-1);
  $('#nx').onclick = () => shift(1);
  $('#td').onclick = () => {
    state.sel = ymd(new Date());
    state.view = firstOfMonth(new Date());
    renderCal();
    renderDay();
  };
}
