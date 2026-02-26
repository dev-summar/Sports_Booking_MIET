if (!localStorage.getItem("admintoken")) {
  window.location.href = "./admin_login.html";
}

const API_URL = window._env_.API_URL;   // <-- NOW READS FROM config.js

const filterDate = document.getElementById("filterDate");
const filterCourt = document.getElementById("filterCourt");
const bookingContainer = document.getElementById("bookingContainer");
const refreshBtn = document.getElementById("refreshBtn");

const blockCourt = document.getElementById("blockCourt");
const blockDate = document.getElementById("blockDate");
const blockSlot = document.getElementById("blockSlot");
const blockBtn = document.getElementById("blockBtn");
const blockMessage = document.getElementById("blockMessage");

// Booking enable/disable toggle (admin)
const bookingStatusBadge = document.getElementById("bookingStatusBadge");
const bookingToggleBtn = document.getElementById("bookingToggleBtn");
const bookingStatusBadgeMobile = document.getElementById("bookingStatusBadgeMobile");
const bookingToggleBtnMobile = document.getElementById("bookingToggleBtnMobile");

let allBookings = [];
let courts = [];

function getAdminToken() {
  return localStorage.getItem("admintoken") || "";
}

function setBookingToggleUI(enabled) {
  const badgeText = enabled ? "Bookings ON" : "Bookings OFF";
  const badgeClass = enabled
    ? "px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800"
    : "px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800";
  const btnText = enabled ? "Stop Bookings" : "Resume Bookings";
  const btnTextMobile = enabled ? "Stop" : "Resume";
  const btnClass = enabled
    ? "px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors duration-200"
    : "px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors duration-200";

  if (bookingStatusBadge) {
    bookingStatusBadge.textContent = badgeText;
    bookingStatusBadge.className = badgeClass;
  }
  if (bookingStatusBadgeMobile) {
    bookingStatusBadgeMobile.textContent = badgeText;
    bookingStatusBadgeMobile.className = badgeClass;
  }
  if (bookingToggleBtn) {
    bookingToggleBtn.textContent = btnText;
    bookingToggleBtn.className = btnClass;
  }
  if (bookingToggleBtnMobile) {
    bookingToggleBtnMobile.textContent = btnTextMobile;
    bookingToggleBtnMobile.className = btnClass;
  }
}

async function loadBookingStatus() {
  const token = getAdminToken();
  const res = await fetch(`${API_URL}/admin/booking-status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) {
    localStorage.removeItem("admintoken");
    window.location.href = "./index.html";
    return;
  }
  const data = await res.json();
  setBookingToggleUI(Boolean(data.bookingEnabled));
}

async function toggleBookingStatus() {
  const token = getAdminToken();
  const res = await fetch(`${API_URL}/admin/toggle-booking`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) {
    localStorage.removeItem("admintoken");
    window.location.href = "./index.html";
    return;
  }
  const data = await res.json();
  setBookingToggleUI(Boolean(data.bookingEnabled));
}

/* ------------------------------
   FIX DATE FORMAT ALWAYS → YYYY-MM-DD
---------------------------------- */
function normalizeDate(str) {
  if (!str) return str;

  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    const [d, m, y] = str.split("-");
    return `${y}-${m}-${d}`;
  }

  return str; // already correct
}

/* ------------------------------
   LOAD COURTS
---------------------------------- */
async function loadCourts() {
  const res = await fetch(`${API_URL}/courts`);
  courts = await res.json();

  filterCourt.innerHTML = `<option value="all">All Courts</option>`;
  blockCourt.innerHTML = `<option value="">Select Court</option>`;

  courts.forEach(c => {
    filterCourt.innerHTML += `<option value="${c._id}">${c.name}</option>`;
    blockCourt.innerHTML += `<option value="${c._id}">${c.name}</option>`;
  });
}

/* ------------------------------
   LOAD BOOKINGS
---------------------------------- */
async function loadBookings() {
  const res = await fetch(`${API_URL}/bookings`);
  const raw = await res.json();

  allBookings = raw.map(b => ({
    ...b,
    date: normalizeDate(b.date),
    courtId:
      typeof b.courtId === "string"
        ? { _id: b.courtId, name: "" }
        : b.courtId
  }));

  renderBookings();
  updateBlockSlotOptions();
  updateDashboardSummary();
}

// Init booking toggle
loadBookingStatus();
if (bookingToggleBtn) bookingToggleBtn.addEventListener("click", toggleBookingStatus);
if (bookingToggleBtnMobile) bookingToggleBtnMobile.addEventListener("click", toggleBookingStatus);

/* ------------------------------
   UPDATE BLOCK SLOT DROPDOWN
---------------------------------- */
function updateBlockSlotOptions() {
  if (!blockCourt.value || !blockDate.value) return;

  const courtId = blockCourt.value;
  const dateNormalized = normalizeDate(blockDate.value);

  const taken = allBookings
    .filter(
      b =>
        b.courtId?._id === courtId &&
        normalizeDate(b.date) === dateNormalized &&
        ["approved", "pending", "blocked"].includes(b.status)
    )
    .map(b => b.startTime);

  const allSlots = [
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30"
  ];

  blockSlot.innerHTML = `<option value="">Select Slot</option>`;

  allSlots.forEach(slot => {
    if (!taken.includes(slot)) {
      blockSlot.innerHTML += `<option value="${slot}">${slot}</option>`;
    }
  });
}

/* ------------------------------
   RENDER BOOKINGS
---------------------------------- */
function renderBookings() {
  bookingContainer.innerHTML = "";

  let filtered = allBookings;

  const selectedDate = normalizeDate(filterDate.value);
  const selectedCourt = filterCourt.value;

  if (selectedDate) {
    filtered = filtered.filter(b => normalizeDate(b.date) === selectedDate);
  }

  if (selectedCourt !== "all") {
    filtered = filtered.filter(b => b.courtId?._id === selectedCourt);
  }

  if (!filtered.length) {
    const tmpl = document.getElementById("emptyStateTemplate");
    bookingContainer.appendChild(tmpl.content.cloneNode(true));
    return;
  }

  const byDate = {};
  filtered.forEach(b => {
    const d = normalizeDate(b.date);
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(b);
  });

  Object.keys(byDate)
    .sort()
    .forEach(dateKey => {
      const group = byDate[dateKey];

      const dateCard = document.createElement("div");
      dateCard.className = "dashboard-card mb-6 overflow-hidden";

      dateCard.innerHTML = `
        <div class="date-group-header">
          <span>📅</span>
          <span>${dateKey}</span>
          <span class="text-xs text-gray-500 font-normal">(${group.length} booking${group.length !== 1 ? 's' : ''})</span>
        </div>
      `;

      const body = document.createElement("div");
      body.className = "p-4 space-y-3";

      const byCourt = {};
      group.forEach(b => {
        const name = b.courtId?.name || "Court";
        if (!byCourt[name]) byCourt[name] = [];
        byCourt[name].push(b);
      });

      Object.keys(byCourt).forEach(court => {
        const courtGroup = document.createElement("div");
        courtGroup.className = "court-group";

        courtGroup.innerHTML = `
          <div class="court-group-header">
            <span>🏟️ ${court}</span>
            <span class="text-xs text-gray-500 font-normal">${byCourt[court].length} booking${byCourt[court].length !== 1 ? 's' : ''}</span>
          </div>
        `;

        const bookingsList = document.createElement("div");
        bookingsList.className = "divide-y divide-gray-200";

        byCourt[court].forEach(b => {
          const row = document.createElement("div");
          row.className = "booking-row";

          let teamHTML = "";
          if (b.teamMembers && b.teamMembers.trim() !== "") {
            teamHTML = `
              <div class="mt-1.5 flex items-center gap-1 text-xs text-blue-700 font-medium">
                <span>👥</span>
                <span>${b.teamMembers}</span>
              </div>
            `;
          }

          const nameSection = b.status === "blocked"
            ? `<div class="font-bold text-gray-900">🔒 Blocked by Admin</div>`
            : `
              <div>
                <div class="font-bold text-gray-900">${b.studentName}</div>
                <div class="text-sm text-gray-600 mt-0.5">${b.studentEmail}</div>
                ${teamHTML}
              </div>
            `;

          const statusClass = b.status === "approved" ? "approved"
            : b.status === "rejected" ? "rejected"
            : b.status === "blocked" ? "blocked"
            : "pending";

          row.innerHTML = `
            <div class="flex items-center justify-between gap-4">
              <div class="flex-1">
                ${nameSection}
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <div class="font-bold text-gray-900 text-base">${b.startTime}</div>
                  <div class="text-xs text-gray-500 mt-0.5">Time Slot</div>
                </div>
                <span class="status-badge ${statusClass}">${b.status}</span>
              </div>
            </div>
          `;

          bookingsList.appendChild(row);
        });

        courtGroup.appendChild(bookingsList);
        body.appendChild(courtGroup);
      });

      dateCard.appendChild(body);
      bookingContainer.appendChild(dateCard);
      renderPendingRequests();
    });
}

function renderPendingRequests() {
  const container = document.getElementById("pendingRequestsContainer");
  if (!container) return;

  container.innerHTML = "";

  const pending = allBookings.filter(b => b.status === "pending");

  if (pending.length === 0) {
    container.innerHTML = `
      <p class="text-sm text-gray-500">No pending requests.</p>
    `;
    return;
  }

  pending.forEach(b => {
    const card = document.createElement("div");
    card.className = "pending-card";

    const teamInfo = b.teamMembers && b.teamMembers.trim() !== "" 
      ? `<div class="mt-2 flex items-center gap-1 text-xs text-blue-700 font-medium">
           <span>👥</span>
           <span>${b.teamMembers}</span>
         </div>` 
      : "";

    card.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="font-bold text-base text-gray-900">${b.studentName}</p>
              <p class="text-sm text-gray-600 mt-0.5">${b.studentEmail}</p>
            </div>
            <span class="status-badge pending">Pending</span>
          </div>
          
          ${teamInfo}
          
          <div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <div class="flex items-center gap-1.5 text-gray-700">
              <span class="font-semibold">🏟️</span>
              <span class="font-semibold">${b.courtId?.name || "Court"}</span>
            </div>
            <div class="flex items-center gap-1.5 text-gray-700">
              <span class="font-semibold">📅</span>
              <span>${b.date}</span>
            </div>
            <div class="flex items-center gap-1.5 text-gray-700">
              <span class="font-semibold">🕐</span>
              <span class="font-bold">${b.startTime}</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button class="btn-approve"
                  onclick="updateBookingStatus('${b._id}','approve', this)">
            ✓ Approve
          </button>
          <button class="btn-reject"
                  onclick="updateBookingStatus('${b._id}','reject', this)">
            ✕ Reject
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

/* ------------------------------
   UPDATE DASHBOARD SUMMARY
---------------------------------- */
function updateDashboardSummary() {
  const pending = allBookings.filter(b => b.status === "pending").length;
  const approved = allBookings.filter(b => b.status === "approved").length;
  const rejected = allBookings.filter(b => b.status === "rejected").length;
  const blocked = allBookings.filter(b => b.status === "blocked").length;

  const pendingEl = document.getElementById("summaryPending");
  const approvedEl = document.getElementById("summaryApproved");
  const rejectedEl = document.getElementById("summaryRejected");
  const blockedEl = document.getElementById("summaryBlocked");

  if (pendingEl) pendingEl.textContent = pending;
  if (approvedEl) approvedEl.textContent = approved;
  if (rejectedEl) rejectedEl.textContent = rejected;
  if (blockedEl) blockedEl.textContent = blocked;
}

/* ------------------------------
   UPDATE STATUS
---------------------------------- */
async function updateBookingStatus(id, action, buttonElement) {
  try {
    const button = buttonElement || document.querySelector(`button[onclick*="${id}"][onclick*="${action}"]`);
    const originalText = button ? button.textContent : '';
    
    if (button) {
      button.disabled = true;
      button.textContent = action === 'approve' ? 'Approving...' : 'Rejecting...';
    }
    
    const response = await fetch(`${API_URL}/bookings/${id}/${action}`, {
      method: "PUT"
    });

    if (!response.ok) {
      throw new Error(`Failed to ${action} booking`);
    }

    await loadBookings();
    renderBookings();
    renderPendingRequests();
    updateDashboardSummary();
    
  } catch (error) {
    alert(`Failed to ${action} booking. Please try again.`);
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

/* ------------------------------
   BLOCK SLOT (admin-only API)
---------------------------------- */
blockBtn?.addEventListener("click", async () => {
  const courtId = blockCourt.value;
  const date = normalizeDate(blockDate.value);
  const startTime = blockSlot.value;

  if (!courtId || !date || !startTime) {
    blockMessage.textContent = "⚠ Select court, date & slot.";
    blockMessage.className = "text-red-600 text-xs";
    return;
  }

  const token = getAdminToken();
  if (!token) {
    blockMessage.textContent = "⚠ Session expired. Please log in again.";
    blockMessage.className = "text-red-600 text-xs";
    return;
  }

  const originalText = blockBtn?.textContent;
  if (blockBtn) {
    blockBtn.disabled = true;
    blockBtn.textContent = "Blocking...";
  }
  blockMessage.textContent = "";
  blockMessage.className = "text-xs";

  try {
    const res = await fetch(`${API_URL}/admin/block-slot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ courtId, date, startTime })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("admintoken");
        window.location.href = "./admin_login.html";
        return;
      }
      if (res.status === 403) {
        blockMessage.textContent = "⛔ You do not have permission to block slots.";
        blockMessage.className = "text-red-600 text-xs";
        return;
      }
      if (res.status === 400) {
        blockMessage.textContent = data.error || "Slot already booked or blocked.";
        blockMessage.className = "text-red-600 text-xs";
        return;
      }
      blockMessage.textContent = data.error || "Failed to block slot. Please try again.";
      blockMessage.className = "text-red-600 text-xs";
      return;
    }

    blockMessage.textContent = "⛔ Slot BLOCKED!";
    blockMessage.className = "text-green-600 text-xs";

    await loadBookings();
    updateBlockSlotOptions();
    updateDashboardSummary();
  } catch (err) {
    console.error("Block slot error:", err);
    blockMessage.textContent = "Network error. Please try again.";
    blockMessage.className = "text-red-600 text-xs";
  } finally {
    if (blockBtn) {
      blockBtn.disabled = false;
      blockBtn.textContent = originalText || "⛔ Block This Slot";
    }
  }
});

/* ------------------------------
   EVENT LISTENERS
---------------------------------- */
blockCourt?.addEventListener("change", updateBlockSlotOptions);
blockDate?.addEventListener("change", updateBlockSlotOptions);

filterCourt?.addEventListener("change", () => {
  renderBookings();
  updateDashboardSummary();
});

filterDate?.addEventListener("change", () => {
  renderBookings();
  updateDashboardSummary();
});

refreshBtn?.addEventListener("click", async () => {
  await loadBookings();
  renderBookings();
  renderPendingRequests();
  updateDashboardSummary();
});

document.getElementById("downloadExcelBtn")?.addEventListener("click", downloadApprovedBookings);

/* ------------------------------
   DOWNLOAD APPROVED BOOKINGS (EXCEL)
---------------------------------- */
async function downloadApprovedBookings() {
  const res = await fetch(`${API_URL}/bookings`);
  const data = await res.json();

  const approved = data.filter(b => b.status === "approved");

  if (approved.length === 0) {
    alert("No approved bookings found in database.");
    return;
  }

  const rows = approved.map(b => ({
    "Student Name": b.studentName,
    "Student Email": b.studentEmail,
    "Court": b.courtId?.name || "",
    "Date": b.date,
    "Slot": b.startTime,
    "Team Members": b.teamMembers || "",
    "Status": b.status,
    "Created At": new Date(b.createdAt).toLocaleString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Approved Bookings");

  XLSX.writeFile(workbook, "approved_bookings.xlsx");
}

/* ------------------------------
   LOGOUT FUNCTION
---------------------------------- */
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("admintoken");
    window.location.replace("./index.html");
  }
}

/* ------------------------------
   AUTO-REFRESH BOOKINGS
---------------------------------- */
let refreshInterval = null;
let lastBookingCount = 0;
let isFirstLoad = true;

async function autoRefreshBookings() {
  try {
    const previousPendingCount = allBookings.filter(b => b.status === "pending").length;
    const previousBookingIds = new Set(allBookings.map(b => b._id.toString()));
    
    await loadBookings();
    renderBookings();
    renderPendingRequests();
    
    const currentPending = allBookings.filter(b => b.status === "pending");
    const newPendingCount = currentPending.filter(b => !previousBookingIds.has(b._id.toString())).length;
    
    if (newPendingCount > 0 && !isFirstLoad) {
      showNewBookingNotification(newPendingCount);
    }
    
    isFirstLoad = false;
    lastBookingCount = allBookings.length;
  } catch (error) {
    console.error("Auto-refresh error:", error);
  }
}

function showNewBookingNotification(count) {
  let notification = document.getElementById("newBookingNotification");
  
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "newBookingNotification";
    notification.className = "fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-pulse";
    notification.innerHTML = `
      <span>🔔</span>
      <span class="font-semibold">${count} new booking request${count > 1 ? 's' : ''}!</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification) {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.3s";
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  } else {
    notification.querySelector("span:last-child").textContent = `${count} new booking request${count > 1 ? 's' : ''}!`;
  }
}

function startAutoRefresh() {
  refreshInterval = setInterval(autoRefreshBookings, 30000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

/* ------------------------------
   INIT
---------------------------------- */
(async function init() {
  filterDate.value = new Date().toISOString().slice(0, 10);

  await loadCourts();      
  await loadBookings();    

  renderPendingRequests(); 
  
  lastBookingCount = allBookings.length;
  startAutoRefresh();
  
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoRefresh();
    } else {
      autoRefreshBookings();
      startAutoRefresh();
    }
  });
})();
