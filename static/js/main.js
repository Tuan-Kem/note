/* Khởi động ứng dụng */
function tickClock() {
  const d = new Date();
  $('#clock').textContent =
    `${VN[d.getDay()]}, ${fmtDate(ymd(d))}  ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
}

(async function start() {
  tickClock();
  setInterval(tickClock, 1000);
  initCalendar();
  initItems();
  initHistory();
  await loadHistory();
  renderCal();
  renderDay();
})();
