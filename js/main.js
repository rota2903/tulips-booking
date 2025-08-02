// js/main.js - Fixed for guaranteed calendar load

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) {
    console.error("Calendar element not found!");
    return;
  }

  let selectedDates = [];
  let currentUnit = 'unit1';
  const unitSelect = document.getElementById('unitSelect');
  const form = document.getElementById('bookingForm');
  const statusDiv = document.getElementById('status');

  function initCalendar() {
    // Destroy any existing instance
    if (calendarEl._flatpickr) {
      calendarEl._flatpickr.destroy();
    }

    // Get current unit bookings
    const bookings = JSON.parse(localStorage.getItem(currentUnit) || "[]");

    // Create flatpickr instance
    flatpickr(calendarEl, {
      mode: "range",
      inline: true,
      dateFormat: "Y-m-d",
      minDate: "today",
      onChange: function (selectedDatesObj, dateStr) {
        selectedDates = selectedDatesObj.map(d => d.toISOString().split('T')[0]);
        document.getElementById('dates').value = dateStr;
      },
      onDayCreate: function (dObj, dStr, fp, dayElem) {
        const dateStr = dObj.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];

        // Gray out past dates
        if (dateStr < today) {
          dayElem.style.backgroundColor = "#ccc";
          dayElem.style.color = "#777";
          dayElem.style.cursor = "not-allowed";
          return;
        }

        // Check booking status
        const booking = bookings.find(b => b.dates.includes(dateStr));
        if (booking) {
          if (booking.status === 'approved') {
            dayElem.style.backgroundColor = "#3498db"; // blue
            dayElem.style.color = "white";
            dayElem.title = `Booked: ${booking.name}`;
          } else if (booking.status === 'pending') {
            dayElem.style.backgroundColor = "#f39c12"; // orange
            dayElem.style.color = "white";
            dayElem.title = `Pending: ${booking.name}`;
          }
        } else {
          dayElem.style.backgroundColor = "#2ecc71"; // green
          dayElem.style.color = "white";
        }
      }
    });
  }

  function loadCalendar() {
    currentUnit = unitSelect.value;
    initCalendar();
  }

  // Unit change
  unitSelect?.addEventListener('change', loadCalendar);

  // Form submission
  form?.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (selectedDates.length === 0) {
      alert("Please select at least one date on the calendar.");
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
    statusDiv.innerHTML = `✅ Thank you, ${name}! Your booking is pending approval.`;
    setTimeout(() => statusDiv.style.display = "none", 5000);

    loadCalendar(); // Refresh calendar
  });

  // Initialize
  loadCalendar();

  // Register service worker for offline
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW failed', err));
  }
});
