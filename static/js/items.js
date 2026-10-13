/* Các mục trong ngày: ghi chú, checklist, ảnh, hình vẽ */

/* ---------- Thêm mục ---------- */
function addItem(type, extra = {}) {
  const it = { id: String(Date.now()), type, time: nowHM(), ...extra };
  if (type === 'note') it.text = '';
  if (type === 'todo') { it.title = ''; it.list = []; }
  if (type === 'draw') it.src = '';
  (state.db.days[state.sel] ??= { items: [] }).items.push(it);
  save();
  renderDay();
}

/* Chọn ảnh -> thu nhỏ tối đa 1200px -> lưu dạng JPEG */
function handleImageFile(file) {
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    const c = h('canvas', { width: img.width * scale, height: img.height * scale });
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    addItem('image', { src: c.toDataURL('image/jpeg', 0.85), caption: '' });
  };
  img.src = URL.createObjectURL(file);
}

/* ---------- Hiển thị ngày đang chọn ---------- */
const TYPE_NAMES = { note: '📝 Ghi chú', todo: '☑ Checklist', image: '🖼 Ảnh', draw: '✏ Vẽ' };

function renderDay() {
  $('#dt').textContent = fmtDateLong(state.sel);
  const box = $('#day');
  box.innerHTML = '';
  const list = items(state.sel).slice().sort(byTime);

  if (!list.length) box.append(h('div', { className: 'empty', textContent: 'Chưa có gì. Bấm nút phía trên để thêm.' }));

  list.forEach((it) => {
    const head = h('div', { className: 'ih' },
      h('input', {
        type: 'time', value: it.time,
        onchange: (e) => { it.time = e.target.value || it.time; save(); renderDay(); },
      }),
      h('span', { textContent: TYPE_NAMES[it.type] }),
      h('button', {
        textContent: 'Xóa',
        onclick: () => {
          if (!confirm('Xóa mục này?')) return;
          const arr = state.db.days[state.sel].items;
          arr.splice(arr.indexOf(it), 1);
          save();
          renderDay();
        },
      }));
    const el = h('div', { className: 'item' }, head);

    if (it.type === 'note') el.append(noteView(it));
    if (it.type === 'todo') el.append(todoView(it));
    if (it.type === 'image') el.append(imageView(it));
    if (it.type === 'draw') el.append(drawView(it));
    box.append(el);
  });
}

/* ---------- Ghi chú ---------- */
const noteView = (it) => h('textarea', {
  value: it.text, placeholder: 'Gõ ghi chú…',
  oninput: (e) => { it.text = e.target.value; save(); },
});

/* ---------- Ảnh: ảnh một bên, chú thích một bên ---------- */
const imageView = (it) => h('div', { className: 'img' },
  h('img', { src: it.src }),
  h('textarea', {
    value: it.caption, placeholder: 'Chú thích…',
    oninput: (e) => { it.caption = e.target.value; save(); },
  }));

/* ---------- Checklist ---------- */
function todoView(it) {
  const wrap = h('div');
  const rows = h('div');
  const prog = h('small', { className: 'prog' });

  const title = h('input', {
    type: 'text', value: it.title, placeholder: 'Tiêu đề checklist',
    oninput: (e) => { it.title = e.target.value; save(); },
  });
  const adder = h('input', {
    type: 'text', placeholder: '+ Thêm việc, nhấn Enter',
    onkeydown: (e) => {
      if (e.key !== 'Enter' || !adder.value.trim()) return;
      it.list.push({ t: adder.value.trim(), d: false });
      save();
      paint();
      adder.value = '';
      adder.focus();
    },
  });

  function paint() {
    const s = todoStats(it.list);
    prog.textContent = s.total ? `Hoàn thành ${s.done}/${s.total} (${s.pct}%)` : 'Chưa có việc nào';
    rows.innerHTML = '';
    it.list.forEach((r, i) => rows.append(h('div', { className: 'row' },
      h('input', { type: 'checkbox', checked: r.d, onchange: (e) => { r.d = e.target.checked; save(); paint(); } }),
      h('input', { type: 'text', value: r.t, className: r.d ? 'done' : '', oninput: (e) => { r.t = e.target.value; save(); } }),
      h('button', { className: 'x', textContent: '×', onclick: () => { it.list.splice(i, 1); save(); paint(); } }))));
  }

  paint();
  wrap.append(title, prog, rows, adder);
  return wrap;
}

/* ---------- Vẽ ---------- */
function drawView(it) {
  const W = 800, H = 400;
  const canvas = h('canvas', { width: W, height: H });
  const ctx = canvas.getContext('2d');
  let color = '#c2542d', size = 3, erasing = false, drawing = false;

  const fillWhite = () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); };
  fillWhite();
  if (it.src) { // nạp lại hình đã vẽ để chỉnh sửa tiếp
    const old = new Image();
    old.onload = () => ctx.drawImage(old, 0, 0);
    old.src = it.src;
  }

  const point = (e) => {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
  };

  canvas.onpointerdown = (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    const [x, y] = point(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.lineWidth = size;
    ctx.strokeStyle = erasing ? '#fff' : color;
    ctx.lineTo(x + 0.1, y);
    ctx.stroke();
  };
  canvas.onpointermove = (e) => {
    if (!drawing) return;
    const [x, y] = point(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  canvas.onpointerup = () => {
    if (!drawing) return;
    drawing = false;
    it.src = canvas.toDataURL();
    save();
  };

  const tools = h('div', { className: 'tools' },
    h('input', { type: 'color', value: color, oninput: (e) => { color = e.target.value; erasing = false; } }),
    h('input', { type: 'range', min: 1, max: 30, value: size, oninput: (e) => { size = +e.target.value; } }),
    h('button', { textContent: 'Bút', onclick: () => { erasing = false; } }),
    h('button', { textContent: 'Tẩy', onclick: () => { erasing = true; } }),
    h('button', { textContent: 'Xóa hết', onclick: () => { fillWhite(); it.src = canvas.toDataURL(); save(); } }));

  return h('div', {}, tools, canvas);
}

function initItems() {
  document.querySelectorAll('[data-a]').forEach((btn) => {
    btn.onclick = () => (btn.dataset.a === 'image' ? $('#file').click() : addItem(btn.dataset.a));
  });
  $('#file').onchange = (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (f) handleImageFile(f);
  };
  $('#dd').onclick = () => { if (items(state.sel).length) deleteDay(state.sel); };
}
