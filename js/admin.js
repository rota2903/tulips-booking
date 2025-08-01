const CORRECT_PASSWORD = "norkass999"; // 🔒 CHANGE THIS!

function checkPassword() {
  const pass = document.getElementById('adminPass').value;
  if (pass === CORRECT_PASSWORD) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadPending();
    document.getElementById('adminUnitSelect').addEventListener('change', loadPending);
  } else {
    alert("❌ Incorrect password!");
  }
}

function loadPending() {
  const unit = document.getElementById('adminUnitSelect').value;
  const bookings = JSON.parse(localStorage.getItem(unit) || "[]");
  const pending = bookings.filter(b => b.status === 'pending');

  const div = document.getElementById('pendingList');
  div.innerHTML = "<h3>🕒 Pending Bookings</h3>";

  if (pending.length === 0) {
    div.innerHTML += "<p>No pending bookings.</p>";
    return;
  }

  pending.forEach(b => {
    const item = document.createElement('div');
    item.innerHTML = `
      <strong>👤 ${b.name}</strong><br>
      📞 ${b.phone}<br>
      📅 ${b.dates.join(', ')}<br>
      <button onclick="approve('${unit}', ${b.id})">✅ Approve</button>
      <button onclick="reject('${unit}', ${b.id})">❌ Reject</button>
      <hr>
    `;
    div.appendChild(item);
  });
}

function approve(unit, id) {
  let bookings = JSON.parse(localStorage.getItem(unit) || "[]");
  const booking = bookings.find(b => b.id == id);
  if (!booking) return;

  const hasConflict = bookings.some(b =>
    b.status === 'approved' &&
    b.dates.some(date => booking.dates.includes(date))
  );

  if (hasConflict) {
    alert("❌ Conflict: These dates are already approved.");
    return;
  }

  booking.status = 'approved';
  localStorage.setItem(unit, JSON.stringify(bookings));
  alert(`✅ Approved: ${booking.name}`);
  loadPending();
}

function reject(unit, id) {
  let bookings = JSON.parse(localStorage.getItem(unit) || "[]");
  bookings = bookings.filter(b => b.id != id);
  localStorage.setItem(unit, JSON.stringify(bookings));
  alert("❌ Rejected");
  loadPending();
}
