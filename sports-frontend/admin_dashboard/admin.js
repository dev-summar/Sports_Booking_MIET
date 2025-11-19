if (!localStorage.getItem("admintoken")) {
  window.location.href = "./admin_login.html";
}

const API_URL = "http://localhost:5000/api";


const filterDate = document.getElementById("filterDate");
const filterCourt = document.getElementById("filterCourt");
const bookingContainer = document.getElementById("bookingContainer");
const refreshBtn = document.getElementById("refreshBtn");

const blockCourt = document.getElementById("blockCourt");
const blockDate = document.getElementById("blockDate");
const blockSlot = document.getElementById("blockSlot");
const blockBtn = document.getElementById("blockBtn");
const blockMessage = document.getElementById("blockMessage");

let allBookings = [];
let courts = [];

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
}

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
      dateCard.className =
        "border border-gray-200 bg-gray-50 rounded-xl mb-5 overflow-hidden";

      dateCard.innerHTML = `
        <div class="px-4 py-2 border-b bg-gray-100 flex items-center gap-2">
          📅 <span class="font-semibold">${dateKey}</span>
          <span class="text-xs text-gray-500">(${group.length} bookings)</span>
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
        const block = document.createElement("div");
        block.className = "border border-gray-200 rounded-lg";

        block.innerHTML = `
          <div class="bg-gray-100 px-3 py-2 text-xs font-semibold flex justify-between">
            ${court}
            <span class="text-gray-500">${byCourt[court].length} item(s)</span>
          </div>
        `;

        const table = document.createElement("div");

        byCourt[court].forEach(b => {
          const row = document.createElement("div");
          row.className =
            "flex items-center justify-between px-3 py-2 border-b last:border-0";

          // 🔥 TEAM MEMBERS LINE (if exists)
          let teamHTML = "";
          if (b.teamMembers && b.teamMembers.trim() !== "") {
            teamHTML = `
              <br>
              <span class='text-[11px] text-blue-700'>👥 ${b.teamMembers}</span>
            `;
          }

          const name =
            b.status === "blocked"
              ? "🔒 Blocked by Admin"
              : `
                ${b.studentName}
                <br>
                <span class='text-xs text-gray-400'>${b.studentEmail}</span>
                ${teamHTML}
              `;

          const color =
            b.status === "approved"
              ? "bg-green-100 text-green-700"
              : b.status === "rejected"
              ? "bg-red-100 text-red-700"
              : b.status === "blocked"
              ? "bg-purple-100 text-purple-700"
              : "bg-yellow-100 text-yellow-700";

          row.innerHTML = `
            <div class="text-sm font-semibold leading-tight">${name}</div>
            <div class="text-sm">${b.startTime}</div>
            <span class="px-2 py-1 text-xs rounded-full ${color}">
              ${b.status}
            </span>
          `;

          table.appendChild(row);
        });

        block.appendChild(table);
        body.appendChild(block);
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

  console.log("PENDING REQUESTS FOUND:", pending); // DEBUG LINE

  if (pending.length === 0) {
    container.innerHTML = `
      <p class="text-sm text-gray-500">No pending requests.</p>
    `;
    return;
  }

  pending.forEach(b => {
    const row = document.createElement("div");
    row.className =
      "border border-gray-200 rounded-lg p-3 flex items-center justify-between bg-gray-50";

    row.innerHTML = `
      <div>
        <p class="font-semibold text-sm">${b.studentName}</p>
        <p class="text-xs text-gray-500">${b.studentEmail}</p>

        ${b.teamMembers && b.teamMembers.trim() !== "" ?
        `<p class="text-xs text-blue-700 mt-1">👥 ${b.teamMembers}</p>` : ""}

        <p class="text-xs mt-1 text-gray-400">
          ${b.courtId?.name || "Court"} • ${b.date} • ${b.startTime}
        </p>
      </div>

      <div class="flex gap-2">
        <button class="px-3 py-1 bg-green-600 text-white text-xs rounded-md"
                onclick="updateBookingStatus('${b._id}','approve', this)">Approve</button>

        <button class="px-3 py-1 bg-red-600 text-white text-xs rounded-md"
                onclick="updateBookingStatus('${b._id}','reject', this)">Reject</button>
      </div>
    `;

    container.appendChild(row);
  });
}


/* ------------------------------
   UPDATE STATUS
---------------------------------- */
async function updateBookingStatus(id, action, buttonElement) {
  try {
    // Show immediate feedback
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

    // Reload bookings immediately
    await loadBookings();
    renderBookings();
    renderPendingRequests();
    
    // Show success message
    const actionText = action === 'approve' ? 'approved' : 'rejected';
    console.log(`✅ Booking ${actionText} successfully`);
    
  } catch (error) {
    console.error(`Error ${action}ing booking:`, error);
    alert(`Failed to ${action} booking. Please try again.`);
    
    // Restore button on error
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

/* ------------------------------
   BLOCK SLOT
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

  await fetch(`${API_URL}/bookings/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentName: "ADMIN BLOCKED",
      studentEmail: "sports@mietjammu.in",
      courtId,
      date,
      startTime,
      status: "blocked"
    })
  });

  blockMessage.textContent = "⛔ Slot BLOCKED!";
  blockMessage.className = "text-green-600 text-xs";

  loadBookings();
  updateBlockSlotOptions();
});

/* ------------------------------
   EVENT LISTENERS
---------------------------------- */
blockCourt?.addEventListener("change", updateBlockSlotOptions);
blockDate?.addEventListener("change", updateBlockSlotOptions);

filterCourt?.addEventListener("change", renderBookings);
filterDate?.addEventListener("change", renderBookings);

refreshBtn?.addEventListener("click", async () => {
  await loadBookings();
  renderBookings();
  renderPendingRequests();
});
document.getElementById("downloadExcelBtn")?.addEventListener("click", downloadApprovedBookings);
/* ------------------------------
   DOWNLOAD APPROVED BOOKINGS (EXCEL)
---------------------------------- */
async function downloadApprovedBookings() {
  // Fetch fresh data directly from backend (IGNORES old allBookings memory)
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
    window.location.replace("./admin_login.html");
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
    
    // Check if new pending requests arrived (compare by ID to avoid false positives)
    const currentPending = allBookings.filter(b => b.status === "pending");
    const newPendingCount = currentPending.filter(b => !previousBookingIds.has(b._id.toString())).length;
    
    // Only show notification if not first load and there are new bookings
    if (newPendingCount > 0 && !isFirstLoad) {
      // New booking arrived - show notification
      showNewBookingNotification(newPendingCount);
    }
    
    isFirstLoad = false;
    lastBookingCount = allBookings.length;
  } catch (error) {
    console.error("Auto-refresh error:", error);
  }
}

function showNewBookingNotification(count) {
  // Create or update notification
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
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (notification) {
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.3s";
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  } else {
    // Update existing notification
    notification.querySelector("span:last-child").textContent = `${count} new booking request${count > 1 ? 's' : ''}!`;
  }
}

function startAutoRefresh() {
  // Refresh every 30 seconds
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

  await loadCourts();      // load courts first
  await loadBookings();    // then load bookings (fills allBookings)

  renderPendingRequests(); // now safe to render pending
  
  // Start auto-refresh
  lastBookingCount = allBookings.length;
  startAutoRefresh();
  
  // Stop auto-refresh when page is hidden (tab switch)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoRefresh();
    } else {
      // Refresh immediately when tab becomes visible
      autoRefreshBookings();
      startAutoRefresh();
    }
  });
})();
