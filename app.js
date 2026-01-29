const tg = window.Telegram.WebApp;
tg.expand();

const drinkEl = document.getElementById("drink");
const amountEl = document.getElementById("amount");
const amountLabel = document.getElementById("amountLabel");

let data = JSON.parse(localStorage.getItem("entries")) || [];

/* ===== UNITS ===== */
const drinkUnits = {
  "Jäger-style": { label: "🥃 Стопки", ml: 50 },
  "Вино": { label: "🍷 Бокалы", ml: 150 },
  "Пиво": { label: "🍺 Кружки", ml: 500 }
};

function updateUnit() {
  amountLabel.textContent = drinkUnits[drinkEl.value].label;
  amountEl.value = 1;
}
drinkEl.addEventListener("change", updateUnit);
updateUnit();

/* ===== MOOD ===== */
let selectedMood = 3;
document.querySelectorAll(".mood-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMood = +btn.dataset.value;
  };
});

/* ===== ADD ENTRY ===== */
function addEntry() {
  const unit = drinkUnits[drinkEl.value];

  data.push({
    date: new Date().toISOString().slice(0,10),
    mood: selectedMood,
    units: +amountEl.value,
    drink: drinkEl.value,
    amountMl: +amountEl.value * unit.ml
  });

  localStorage.setItem("entries", JSON.stringify(data));
  drawCalendar();
  drawMoodChart();
  tg.HapticFeedback.impactOccurred("light");
}

/* ===== TABS ===== */
function openTab(id) {
  document.querySelectorAll(".tab-screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
}

/* ===== CALENDAR ===== */
function drawCalendar() {
  const grid = document.getElementById("calendarGrid");
  const title = document.getElementById("monthTitle");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  title.textContent = now.toLocaleString("ru", { month: "long", year: "numeric" });

  grid.innerHTML = "";
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const hasDrink = data.some(e => e.date === dateStr);

    const div = document.createElement("div");
    div.className = `day ${hasDrink ? "drunk" : "sober"}`;

    if (d === now.getDate()) div.classList.add("today");

    div.textContent = d;
    grid.appendChild(div);
  }
}

/* ===== MOOD CHART ===== */
const moodChart = new Chart(
  document.getElementById("moodChart"),
  {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Настроение",
          data: [],
          borderColor: "#6fbf8f",
          tension: 0.4
        },
        {
          label: "Стаканы",
          data: [],
          borderColor: "#c9a44c",
          tension: 0.4
        }
      ]
    }
  }
);

function drawMoodChart() {
  moodChart.data.labels = data.map(e => e.date.slice(5));
  moodChart.data.datasets[0].data = data.map(e => e.mood);
  moodChart.data.datasets[1].data = data.map(e => e.units);
  moodChart.update();
}

/* INIT */
drawCalendar();
drawMoodChart();
