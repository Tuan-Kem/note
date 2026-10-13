/* Xem lịch sử + xóa dữ liệu */
function dayText(k) {
  return items(k).map((x) => {
    if (x.type === 'note') return x.text;
    if (x.type === 'todo') return `${x.title} ${x.list.map((r) => r.t).join(' ')}`;
    if (x.type === 'image') return x.caption;
    return '';
  }).join(' ');
}

/* Tóm tắt một ngày: "5 mục · ☑ 2/3 · 🖼 1 · ✏ 1" */
function dayStat(k) {
  const list = items(k);
  const todos = list.filter((x) => x.type === 'todo');
  const total = todos.reduce((a, x) => a + x.list.length, 0);
  const done = todos.reduce((a, x) => a + todoStats(x.list).done, 0);
  const imgs = list.filter((x) => x.type === 'image').length;
  const draws = list.filter((x) => x.type === 'draw').length;
  return [`${list.length} mục`, total && `☑ ${done}/${total}`, imgs && `🖼 ${imgs}`, draws && `✏ ${draws}`]
    .filter(Boolean).join(' · ');
}

function renderHistory() {
  const q = $('#hq').value.trim().toLowerCase();
  const box = $('#hl');
  box.innerHTML = '';

  const keys = Object.keys(state.db.days)
    .filter((k) => items(k).length)
    .filter((k) => !q || `${k} ${fmtDate(k)} ${dayText(k)}`.toLowerCase().includes(q))
    .sort().reverse();

  if (!keys.length) box.append(h('div', { className: 'empty', textContent: 'Không có dữ liệu.' }));

  keys.forEach((k) => box.append(h('div', { className: 'hr' },
    h('div', {},
      h('b', { textContent: fmtDateLong(k) }),
      h('small', { textContent: `${dayStat(k)} — ${dayText(k).trim().slice(0, 80)}` })),
    h('button', { textContent: 'Mở', onclick: () => openDay(k) }),
    h('button', { className: 'dg', textContent: 'Xóa', onclick: () => deleteDay(k) }))));
}

function openDay(k) {
  state.sel = k;
  state.view = firstOfMonth(parseKey(k));
  $('#hm').hidden = true;
  renderCal();
  renderDay();
}

function deleteDay(k) {
  if (!confirm(`Xóa toàn bộ dữ liệu ngày ${fmtDate(k)}?`)) return;
  delete state.db.days[k];
  save();
  renderHistory();
  renderDay();
}

function deleteAll() {
  if (!confirm('Xóa TOÀN BỘ dữ liệu? Không thể khôi phục.')) return;
  if (!confirm('Chắc chắn xóa hết?')) return;
  state.db = { days: {} };
  save();
  renderHistory();
  renderDay();
}

function initHistory() {
  $('#hb').onclick = () => { $('#hq').value = ''; $('#hm').hidden = false; renderHistory(); };
  $('#hx').onclick = () => { $('#hm').hidden = true; };
  $('#hq').oninput = renderHistory;
  $('#ha').onclick = deleteAll;
}
