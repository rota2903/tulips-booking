// Wait for DOM and flatpickr
document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  let selectedDates = [];
  let currentUnit = 'unit1';
  const unitSelect = document.getElementById('unitSelect');
  const form = document.getElementById('bookingForm');
  const statusDiv = document.getElementById('status');

  function initCalendar() {
    if (calendarEl._flatpickr) calendarEl._flatpickr.destroy();

    const bookings = JSON.parse(localStorage.getItem(currentUnit) || "[]");

    flatpickr(calendarEl, {
      mode: "range",
      inline: true,
      dateFormat: "Y-m-d",
      minDate: "today",
      onChange: (dates, dateStr) => {
        selectedDates = dates.map(d => d.toISOString().split('T')[0]);
        document.getElementById('dates').value = dateStr;
      },
      onDayCreate: (dObj, dStr, fp, dayElem) => {
        const dateStr = dObj.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        if (dateStr < today) {
          dayElem.style.backgroundColor = "#ccc";
          dayElem.style.color = "#777";
        } else {
          const booking = bookings.find(b => b.dates.includes(dateStr));
          if (booking && booking.status === 'approved') {
            dayElem.style.backgroundColor = "#3498db";
            dayElem.style.color = "white";
          } else if (booking && booking.status === 'pending') {
            dayElem.style.backgroundColor = "#f39c12";
            dayElem.style.color = "white";
          } else {
            dayElem.style.backgroundColor = "#2ecc71";
            dayElem.style.color = "white";
          }
        }
      }
    });
  }

  function loadCalendar() {
    currentUnit = unitSelect.value;
    initCalendar();
  }

  unitSelect?.addEventListener('change', loadCalendar);
  form?.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    if (selectedDates.length === 0) {
      alert("Select dates first");
      return;
    }
    const bookings = JSON.parse(localStorage.getItem(currentUnit) || "[]");
    bookings.push({ id: Date.now(), name, phone, dates: selectedDates, status: 'pending' });
    localStorage.setItem(currentUnit, JSON.stringify(bookings));
    document.getElementById('status').innerHTML = `✅ Pending: ${name}`;
    setTimeout(() => document.getElementById('status').style.display = "none", 3000);
    loadCalendar();
  });

  loadCalendar();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
});
