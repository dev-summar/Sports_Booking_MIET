// Use API URL from config.js
const API_URL = window._env_.API_URL;

// All 30-minute slots
const slots = [
    "12:30", "13:00", "13:30", "14:00",
    "14:30", "15:00", "15:30", "16:00", "16:30"
];

const courtSelect = document.getElementById("courtSelect");
const dateInput = document.getElementById("dateInput");
const slotContainer = document.getElementById("slotContainer");
const bookingForm = document.getElementById("bookingForm");
const responseMsg = document.getElementById("responseMsg");
const courtGridView = document.getElementById("courtGridView");
const bookingFormView = document.getElementById("bookingFormView");
const courtGridContainer = document.getElementById("courtGridContainer");
const backToCourtsBtn = document.getElementById("backToCourtsBtn");
const selectedCourtDisplay = document.getElementById("selectedCourtDisplay");
const selectedCourtName = document.getElementById("selectedCourtName");

let selectedSlot = "";
let currentRequestController = null; // For request cancellation
let courtsData = []; // Store courts for grid rendering

// Helper function to check if a slot is at least 6 hours ahead when date is today
function isSlotAtLeast6HoursAhead(slotTime, selectedDate) {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format
    
    // If selected date is not today, allow all slots
    if (selectedDate !== todayStr) {
        return true;
    }
    
    // Parse slot time (format: "HH:MM")
    const [slotHours, slotMinutes] = slotTime.split(":").map(Number);
    
    // Create date object for the slot time today
    const slotDateTime = new Date();
    slotDateTime.setHours(slotHours, slotMinutes, 0, 0);
    
    // Current time
    const currentTime = new Date();
    
    // Calculate difference in milliseconds
    const diffMs = slotDateTime - currentTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    // Slot must be at least 6 hours ahead
    return diffHours >= 6;
}

// Get sport icon emoji
function getSportIcon(sportType) {
    const type = (sportType || "").toLowerCase();
    if (type.includes("futsal")) return "⚽";
    if (type.includes("pickleball")) return "🏓";
    if (type.includes("badminton")) return "🏸";
    if (type.includes("basketball")) return "🏀";
    if (type.includes("tennis")) return "🎾";
    if (type.includes("volleyball")) return "🏐";
    return "🏟️";
}

// Render court grid
function renderCourtGrid(courts) {
    courtGridContainer.innerHTML = "";
    
    courts.forEach(court => {
        const card = document.createElement("div");
        card.classList.add("court-card");
        card.dataset.courtId = court._id;
        card.dataset.courtName = court.name;
        
        const icon = getSportIcon(court.type);
        
        card.innerHTML = `
            <div class="text-center">
                <div class="court-icon">${icon}</div>
                <div class="court-name">${court.name}</div>
                <div class="court-type">${court.type || "Sports Court"}</div>
                <div class="selected-badge">Selected</div>
            </div>
        `;
        
        card.addEventListener("click", () => {
            selectCourt(court._id, court.name);
        });
        
        courtGridContainer.appendChild(card);
    });
}

// Select court and show booking form
function selectCourt(courtId, courtName) {
    // Remove previous selection highlight
    document.querySelectorAll('.court-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Highlight selected court card
    const selectedCard = document.querySelector(`[data-court-id="${courtId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Update court select dropdown
    courtSelect.value = courtId;
    selectedCourtName.textContent = courtName;
    
    // Clear previous slots and reset form state
    slotContainer.innerHTML = "";
    selectedSlot = "";
    const infoMessage6hr = document.getElementById("infoMessage6hr");
    if (infoMessage6hr) infoMessage6hr.style.display = "none";
    
    // Smooth transition: fade out grid, then show form
    courtGridView.style.opacity = "0";
    courtGridView.style.transform = "translateY(-20px)";
    
    setTimeout(() => {
        courtGridView.style.display = "none";
        bookingFormView.style.display = "block";
        bookingFormView.style.opacity = "0";
        bookingFormView.style.transform = "translateY(20px)";
        
        // Smooth fade in for form
        setTimeout(() => {
            bookingFormView.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            bookingFormView.style.opacity = "1";
            bookingFormView.style.transform = "translateY(0)";
            
            // Smooth scroll to top of form
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 50);
    }, 300);
    
    // If date is already selected, load slots
    if (dateInput.value) {
        loadBookedSlots();
    }
}

// Load courts
async function loadCourts() {
    const res = await fetch(`${API_URL}/courts`);
    courtsData = await res.json();

    // Populate dropdown (hidden but needed for form submission)
    courtSelect.innerHTML = '<option value="">Select court</option>';
    courtsData.forEach(court => {
        courtSelect.innerHTML += `<option value="${court._id}">${court.name}</option>`;
    });
    
    // Render court grid
    renderCourtGrid(courtsData);
    
    // Initialize view states for smooth transitions
    courtGridView.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    bookingFormView.style.transition = "opacity 0.5s ease, transform 0.5s ease";
}

// Back to court selection
backToCourtsBtn.addEventListener("click", () => {
    // Smooth transition: fade out form, then show grid
    bookingFormView.style.opacity = "0";
    bookingFormView.style.transform = "translateY(20px)";
    
    setTimeout(() => {
        bookingFormView.style.display = "none";
        courtGridView.style.display = "block";
        courtGridView.style.opacity = "0";
        courtGridView.style.transform = "translateY(-20px)";
        
        // Smooth fade in for grid
        setTimeout(() => {
            courtGridView.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            courtGridView.style.opacity = "1";
            courtGridView.style.transform = "translateY(0)";
            
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 50);
    }, 300);
    
    // Remove selection highlight
    document.querySelectorAll('.court-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Reset form
    courtSelect.value = "";
    dateInput.value = "";
    slotContainer.innerHTML = "";
    selectedSlot = "";
    selectedCourtName.textContent = "-";
    
    // Clear response message
    responseMsg.style.display = "none";
    responseMsg.innerHTML = "";
    
    // Reset form fields
    document.getElementById("nameInput").value = "";
    document.getElementById("emailInput").value = "";
    document.getElementById("teamMembers").value = "";
});

// Show loading skeleton for slots
function showSlotLoading() {
    slotContainer.innerHTML = "";
    selectedSlot = ""; // Reset selected slot
    
    // Create skeleton placeholders
    for (let i = 0; i < slots.length; i++) {
        const skeleton = document.createElement("div");
        skeleton.classList.add("slot-skeleton");
        slotContainer.appendChild(skeleton);
    }
    
    // Hide info message while loading
    const infoMessage6hr = document.getElementById("infoMessage6hr");
    if (infoMessage6hr) {
        infoMessage6hr.style.display = "none";
    }
}

// Load booked slots
async function loadBookedSlots() {
    // Clear slots immediately when date/court changes
    showSlotLoading();
    
    if (!courtSelect.value || !dateInput.value) {
        slotContainer.innerHTML = "";
        return;
    }

    // Cancel any pending request
    if (currentRequestController) {
        currentRequestController.abort();
    }

    // Create new AbortController for this request
    currentRequestController = new AbortController();

    try {
        const res = await fetch(
            `${API_URL}/bookings/check-slots?court=${courtSelect.value}&date=${dateInput.value}`,
            { signal: currentRequestController.signal }
        );

        // Check if request was aborted
        if (currentRequestController.signal.aborted) {
            return;
        }

        const bookedSlots = await res.json();

        console.log("BOOKED SLOTS FROM API:", bookedSlots);

        // Only render if this is still the current request
        renderSlots(bookedSlots);
    } catch (error) {
        // Ignore abort errors
        if (error.name === 'AbortError') {
            console.log("Request aborted");
            return;
        }
        console.error("Error loading slots:", error);
        // Show error state
        slotContainer.innerHTML = '<div class="text-center text-gray-500 py-4">Error loading slots. Please try again.</div>';
    } finally {
        currentRequestController = null;
    }
}

// Render slot buttons
function renderSlots(bookedSlots) {
    slotContainer.innerHTML = "";
    selectedSlot = ""; // Reset selected slot when re-rendering

    const selectedDate = dateInput.value;
    const isToday = selectedDate === new Date().toISOString().split("T")[0];
    let availableSlotsCount = 0;
    let disabled6hrCount = 0;

    slots.forEach(time => {
        const div = document.createElement("button");
        div.type = "button"; // so it doesn't submit form
        div.classList.add("slotBtn", "w-full");
        div.innerText = time;

        const isBooked = bookedSlots.includes(time);
        const isWithin6Hours = !isSlotAtLeast6HoursAhead(time, selectedDate);

        if (isBooked) {
            div.classList.add("booked");
        } else if (isWithin6Hours && isToday) {
            // Slot is too soon (less than 6 hours ahead) for today
            div.classList.add("disabled-6hr");
            div.disabled = true;
            div.title = "This slot must be booked at least 6 hours in advance";
            disabled6hrCount++;
        } else {
            availableSlotsCount++;
            div.addEventListener("click", () => {
                document.querySelectorAll(".slotBtn").forEach(btn =>
                    btn.classList.remove("selected")
                );
                div.classList.add("selected");
                selectedSlot = time;
                console.log("SELECTED SLOT:", selectedSlot);
            });
        }

        slotContainer.appendChild(div);
    });

    // Show info message if all slots are disabled due to 6-hour rule (and it's today)
    const infoMessage6hr = document.getElementById("infoMessage6hr");
    if (infoMessage6hr) {
        if (isToday && availableSlotsCount === 0 && disabled6hrCount > 0) {
            infoMessage6hr.style.display = "flex";
        } else {
            infoMessage6hr.style.display = "none";
        }
    }
}

// Submit booking
bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("TRYING TO SUBMIT WITH SLOT:", selectedSlot);

    if (!selectedSlot) {
        alert("Please select a slot!");
        return;
    }

    // Validate 6-hour restriction for same-day bookings
    const selectedDate = dateInput.value;
    const todayStr = new Date().toISOString().split("T")[0];
    
    if (selectedDate === todayStr && !isSlotAtLeast6HoursAhead(selectedSlot, selectedDate)) {
        alert("This slot must be booked at least 6 hours in advance. Please select a later slot.");
        return;
    }

    // Show message immediately
    responseMsg.innerHTML = "⏳ Processing your booking...";
    responseMsg.className = "bg-blue-50 border-2 border-blue-200 text-blue-700";
    responseMsg.style.display = "block";

    // Disable submit button
    const submitBtn = bookingForm.querySelector("button[type='submit']");
    let originalText = "";
    
    if (submitBtn) {
        submitBtn.disabled = true;
        originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "Booking... ⏳";
    }

    const bookingData = {
        courtId: courtSelect.value,
        date: dateInput.value,
        startTime: selectedSlot,
        endTime: "",
        studentName: document.getElementById("nameInput").value,
        studentEmail: document.getElementById("emailInput").value,
        teamMembers: document.getElementById("teamMembers")?.value || "",
        status: "pending"
    };

    try {
        await fetch(`${API_URL}/bookings/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData)
        });

        // Success message
        responseMsg.innerHTML = "🎉 Booking Successful! Wait for admin approval.";
        responseMsg.className = "bg-green-50 border-2 border-green-200 text-green-700";
        responseMsg.style.display = "block";

        loadBookedSlots();
    } catch (error) {
        // Error message
        responseMsg.innerHTML = "❌ Booking failed. Please try again.";
        responseMsg.className = "bg-red-50 border-2 border-red-200 text-red-700";
        responseMsg.style.display = "block";
    } finally {
        // Restore button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText || "Confirm Booking ⚽";
        }
    }
});

// Event listeners with immediate slot clearing
// Note: Court selection now happens via grid, but keep this for form integrity
courtSelect.addEventListener("change", () => {
    // Update displayed court name if changed via dropdown (shouldn't happen in normal flow)
    const selectedCourt = courtsData.find(c => c._id === courtSelect.value);
    if (selectedCourt) {
        selectedCourtName.textContent = selectedCourt.name;
    }
    
    // Clear slots immediately for instant feedback
    slotContainer.innerHTML = "";
    selectedSlot = "";
    const infoMessage6hr = document.getElementById("infoMessage6hr");
    if (infoMessage6hr) infoMessage6hr.style.display = "none";
    // Then load new slots (which will show loading state)
    loadBookedSlots();
});

dateInput.addEventListener("change", () => {
    // Clear slots immediately for instant feedback
    slotContainer.innerHTML = "";
    selectedSlot = "";
    const infoMessage6hr = document.getElementById("infoMessage6hr");
    if (infoMessage6hr) infoMessage6hr.style.display = "none";
    // Then load new slots (which will show loading state)
    loadBookedSlots();
});

// Init
loadCourts();
