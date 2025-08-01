// main.js - Enhanced calendar view
let selectedDates = [];
let currentUnit = 'unit1';
const unitSelect = document.getElementById('unitSelect');
const form = document.getElementById('bookingForm');
const statusDiv = document.getElementById('status');

// Initialize the calendar
function initCalendar() {
  // Destroy any existing instance
  if (document.getElementById('calendar')._flatpickr) {
    document.getElementById('calendar')._flatpickr.destroy();
  }

  // Get bookings for current unit
  const bookings = JSON.parse(localStorage.getItem(currentUnit) || "[]");

  flatpickr("#calendar", {
    mode: "range",
    inline: true,           // Always show full calendar
    dateFormat: "Y-m-d",
    minDate: "today",
    animate: false,
    onChange: function(dates, dateStr) {
      selectedDates = dates.map(d => d.toISOString().split('T')[0]);
      document.getElementById('dates').value = dateStr;
    },
    onDayCreate: function(dObj, dStr, fp, dayElem) {
      const dateStr = dObj.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      // Style past dates
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

// Load unit and refresh calendar
function loadCalendar() {
  currentUnit = unitSelect.value;
  initCalendar();
}

// Unit change listener
unitSelect.addEventListener('change', loadCalendar);

// Form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();

  if (selectedDates.length === 0) {
    alert("Please select at least one date on the calendar.");
    return;
  }

  const bookings = JSON.parse(localStorage.getItem(currentUnit) || "[]");
  const newBooking = {
    id: Date.now(),
    name,
    phone,
    dates: selectedDates,
    status: 'pending'
  };

  bookings.push(newBooking);
  localStorage.setItem(currentUnit, JSON.stringify(bookings));

  statusDiv.style.display = "block";
  statusDiv.innerHTML = `✅ Thank you, ${name}! Your booking is pending approval.`;
  setTimeout(() => statusDiv.style.display = "none", 5000);

  // Re-render calendar to show pending (will appear orange after refresh)
  loadCalendar();
});

// On load
document.addEventListener("DOMContentLoaded", () => {
  loadCalendar();

  // Enable PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
});
