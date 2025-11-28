/* ==============
   script.js (полный файл)
   ============== */

/* Настройки даты */
const eventYear = 2026;
const eventMonth = 0; // январь = 0
const eventDay = 3;
const eventHour = 17;
const eventMinute = 0;
const eventSecond = 0;

/* Календарь */
function buildCalendar(year, month, highlightDay){
  const grid = document.getElementById('calendarGrid');
  if(!grid) return;
  grid.innerHTML = '';
  const dayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  for(let i=0;i<7;i++){
    const dn = document.createElement('div');
    dn.className = 'day-name';
    dn.textContent = dayNames[i];
    grid.appendChild(dn);
  }
  const first = new Date(year, month, 1);
  const shift = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month+1, 0).getDate();
  for(let i=0;i<shift;i++){
    const d = document.createElement('div');
    d.className = 'day out';
    d.textContent = '';
    grid.appendChild(d);
  }
  for(let d=1; d<=daysInMonth; d++){
    const el = document.createElement('div');
    el.className = 'day';
    el.textContent = d;
    if(d === highlightDay && year === eventYear && month === eventMonth){
      el.classList.add('event');
      el.setAttribute('aria-label','Дата празднования выделена: ' + d + ' ' + (month+1) + ' ' + year);
    }
    const now = new Date();
    if(now.getFullYear()===year && now.getMonth()===month && now.getDate()===d){
      el.classList.add('today');
    }
    grid.appendChild(el);
  }
  const totalCells = grid.children.length;
  const remainder = totalCells % 7;
  if(remainder !== 0){
    const toAdd = 7 - remainder;
    for(let i=0;i<toAdd;i++){
      const d = document.createElement('div');
      d.className = 'day out';
      d.textContent = '';
      grid.appendChild(d);
    }
  }
  const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const monthTitle = document.getElementById('monthTitle');
  if(monthTitle) monthTitle.textContent = monthNames[month] + ' ' + year;
  const dv = document.getElementById('dateValue');
  if(dv) dv.textContent = String(highlightDay).padStart(2,'0') + ' ' + monthNames[month] + ' ' + year;
}

/* Обратный отсчёт */
function startCountdown(targetDate){
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');
  function update(){
    const now = new Date();
    let diffMs = targetDate - now;
    if(diffMs < 0) diffMs = 0;
    const totalSec = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSec / (3600*24));
    const hours = Math.floor((totalSec % (3600*24)) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    if(daysEl) daysEl.textContent = String(days).padStart(2,'0');
    if(hoursEl) hoursEl.textContent = String(hours).padStart(2,'0');
    if(minutesEl) minutesEl.textContent = String(minutes).padStart(2,'0');
    if(secondsEl) secondsEl.textContent = String(seconds).padStart(2,'0');
  }
  update();
  setInterval(update, 1000);
}

/* Инициализация */
(function init(){
  buildCalendar(eventYear, eventMonth, eventDay);
  const timeValue = document.getElementById('timeValue');
  if(timeValue) timeValue.textContent = String(eventHour).padStart(2,'0') + ':' + String(eventMinute).padStart(2,'0');
  const targetDate = new Date(eventYear, eventMonth, eventDay, eventHour, eventMinute, eventSecond);
  startCountdown(targetDate);
})();

/* ============ RSVP логика ============ */

const rsvpForm   = document.getElementById("rsvp2Form");
const submitBtn  = document.getElementById("rsvpSubmitBtn");
const peopleBlock= document.getElementById("peopleBlock");
const kidsBlock  = document.getElementById("kidsBlock");
const partnerName= document.getElementById("partnerName");
const kidsList   = document.getElementById("kidsList");
const addKidBtn  = document.getElementById("addKidBtn");

// Проверка видимости
function isVisible(el) { if(!el) return false; return el.offsetParent !== null; }
function radioGroupChecked(formEl, name) {
  const radios = formEl.querySelectorAll(`input[name="${name}"]`);
  if (!radios.length) return true;
  return Array.from(radios).some(r => r.checked);
}

// Синхронизировать required для видимых полей
function syncRequiredAttributes() {
  if (!rsvpForm) return;
  const controls = rsvpForm.querySelectorAll("input[type='text'], input[type='email'], input[type='tel'], input[type='number'], textarea, select");
  controls.forEach(ctrl => {
    const visible = isVisible(ctrl);
    if (visible) ctrl.setAttribute("required", "required");
    else ctrl.removeAttribute("required");
  });
  const radioNames = Array.from(new Set(Array.from(rsvpForm.querySelectorAll("input[type='radio']")).map(r => r.name)));
  radioNames.forEach(name => {
    const radios = rsvpForm.querySelectorAll(`input[name="${name}"]`);
    const groupVisible = Array.from(radios).some(r => isVisible(r));
    if (groupVisible) {
      radios.forEach((r, idx) => {
        if (idx === 0) r.setAttribute("required", "required");
        else r.removeAttribute("required");
      });
    } else {
      radios.forEach(r => r.removeAttribute("required"));
    }
  });
}

// show/hide логика
document.querySelectorAll("input[name='attend']").forEach(el => {
  el.addEventListener("change", () => {
    const value = el.value;
    if (value === "yes") {
      if (peopleBlock) peopleBlock.style.display = "block";
      if (kidsBlock) kidsBlock.style.display = "block";
    } else {
      if (peopleBlock) peopleBlock.style.display = "none";
      if (kidsBlock) kidsBlock.style.display = "none";
      if (partnerName) { partnerName.value = ""; partnerName.style.display = "none"; }
      if (kidsList) { kidsList.innerHTML = ""; kidsList.style.display = "none"; }
      if (addKidBtn) addKidBtn.style.display = "none";
      if (rsvpForm) {
        rsvpForm.querySelectorAll("input[name='peopleCount']").forEach(r => r.checked = false);
        rsvpForm.querySelectorAll("input[name='kids']").forEach(r => r.checked = false);
      }
    }
    syncRequiredAttributes();
  });
});

document.querySelectorAll("input[name='peopleCount']").forEach(el => {
  el.addEventListener("change", () => {
    if (el.value === "2") {
      if (partnerName) partnerName.style.display = "block";
    } else {
      if (partnerName) { partnerName.style.display = "none"; partnerName.value = ""; }
    }
    syncRequiredAttributes();
  });
});

document.querySelectorAll("input[name='kids']").forEach(el => {
  el.addEventListener("change", () => {
    const value = el.value;
    if (value === "yes") {
      if (kidsList) kidsList.style.display = "block";
      if (addKidBtn) addKidBtn.style.display = "inline-block";
      if (kidsList && kidsList.children.length === 0) addKidInput();
    } else {
      if (kidsList) { kidsList.style.display = "none"; kidsList.innerHTML = ""; }
      if (addKidBtn) addKidBtn.style.display = "none";
    }
    syncRequiredAttributes();
  });
});

function addKidInput() {
  if (!kidsList) return;
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Имя и Фамилия ребёнка";
  input.className = "rsvp2-input";
  input.style.marginBottom = "8px";
  input.setAttribute("required", "required");
  kidsList.appendChild(input);
  syncRequiredAttributes();
}
if (addKidBtn) addKidBtn.addEventListener("click", (e) => { e.preventDefault(); addKidInput(); });

// Блокировка формы после отправки
function lockFormAfterSubmit() {
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправлено ✓";
    submitBtn.classList.add("disabled");
  }
  if (rsvpForm) {
    Array.from(rsvpForm.elements).forEach(el => {
      if (el !== submitBtn) el.disabled = true;
    });
  }
}

// начальное состояние required
syncRequiredAttributes();

// submit
if (rsvpForm) {
  rsvpForm.addEventListener("submit", async function(e){
    e.preventDefault();
    syncRequiredAttributes();

    if (!this.checkValidity()) {
      this.reportValidity();
      return;
    }

    if (submitBtn) { submitBtn.textContent = "Отправка…"; submitBtn.classList.add("disabled"); submitBtn.disabled = true; }

    const getVal = id => (document.getElementById(id) || {}).value || "";
    const payload = {
      fullName: getVal("fullName"),
      attend: (document.querySelector("input[name='attend']:checked") || {}).value || "",
      peopleCount: (document.querySelector("input[name='peopleCount']:checked") || {}).value || "",
      partnerName: getVal("partnerName"),
      kids: (document.querySelector("input[name='kids']:checked") || {}).value || "",
      kidsList: JSON.stringify(Array.from(document.querySelectorAll("#kidsList input")).map(i=>i.value).filter(Boolean))
    };

    const params = new URLSearchParams();
    Object.keys(payload).forEach(k => params.append(k, payload[k]));

    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycby2OCw4dJsO-uAqJcG_4WhBjuuWxMgo1KClPHMEJAEhnUp8D6245yrkbxUAm2Pt3LkAkg/exec", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: params.toString(),
      });

      const text = await res.text();
      console.log("status:", res.status, "body:", text);

      if(!res.ok) throw new Error("Server " + res.status + " — " + text);

      alert("Спасибо! Ваш ответ записан.");
      lockFormAfterSubmit();

    } catch(err) {
      console.error("Ошибка отправки:", err);
      alert("Ошибка при отправке: " + err.message + "\nСмотри консоль (F12) → Network → Response.");
      if(submitBtn){
        submitBtn.textContent = "Отправить";
        submitBtn.classList.remove("disabled");
        submitBtn.disabled = false;
      }
    }
  });
}
