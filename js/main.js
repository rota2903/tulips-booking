// js/main.js - Safe init with retry

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  let selectedDates = [];
  let currentUnit = 'unit1';
  const unitSelect = document.getElementById('unitSelect');
  const form = document.getElementById('bookingForm');
  const statusDiv = document.getElementById('status');

  function initCalendar() {
    if (!window.flatpickr) {
      console.log("⏳ flatpickr not ready yet... retrying in 500ms");
      setTimeout(initCalendar, 500);
      return;
    }

    if (calendarEl._flatpickr) calendarEl._flatpickr.destroy();

    const bookings = JSON.parse(localStorage.getItem(currentUnit) || "[]");

    window.flatpickr(calendarEl, {
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

    console.log("✅ Calendar initialized!");
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
      alert("Please select dates first.");
      return;
    }

    const bookings = JSON.parse(localStorage.getItem(currentUnit) || "[]");
    bookings.push({
      id: Date.now(),
      name,
      phone,
      dates: selectedDates,
      status: 'pending'
    });
    localStorage.setItem(currentUnit, JSON.stringify(bookings));

    statusDiv.style.display = "block";
    statusDiv.innerHTML = `✅ Thank you, ${name}! Pending approval.`;
    setTimeout(() => statusDiv.style.display = "none", 3000);

    loadCalendar();
  });

  // Start initialization
  loadCalendar();

  // Register PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
});
