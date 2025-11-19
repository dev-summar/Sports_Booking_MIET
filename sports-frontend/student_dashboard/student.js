const API_URL = "http://localhost:5000/api";

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

let selectedSlot = "";

// Load courts
async function loadCourts() {
    const res = await fetch(`${API_URL}/courts`);
    const courts = await res.json();

    courtSelect.innerHTML = '<option value="">Select court</option>';
    courts.forEach(court => {
        courtSelect.innerHTML += `<option value="${court._id}">${court.name}</option>`;
    });
}

// Load booked slots
async function loadBookedSlots() {
    if (!courtSelect.value || !dateInput.value) return;

    const res = await fetch(
        `${API_URL}/bookings/check-slots?court=${courtSelect.value}&date=${dateInput.value}`
    );

    const bookedSlots = await res.json();

    console.log("BOOKED SLOTS FROM API:", bookedSlots);

    renderSlots(bookedSlots);
}

// Render slot buttons
function renderSlots(bookedSlots) {
    slotContainer.innerHTML = "";

    slots.forEach(time => {
        const div = document.createElement("button");
        div.type = "button"; // so it doesn’t submit form
        div.classList.add("slotBtn", "w-full");
        div.innerText = time;

        if (bookedSlots.includes(time)) {
            div.classList.add("booked");
        } else {
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
}

// Submit booking
bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("TRYING TO SUBMIT WITH SLOT:", selectedSlot);

    if (!selectedSlot) {
        alert("Please select a slot!");
        return;
    }

    // Show message IMMEDIATELY when submit is clicked
    responseMsg.innerHTML = "⏳ Processing your booking...";
    responseMsg.className = "text-center text-sm font-semibold mt-4 text-blue-600";
    responseMsg.style.display = "block";

    // Disable submit button immediately
    const submitBtn = bookingForm.querySelector("button[type='submit']");
    if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
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

        // Update message to success
        responseMsg.innerHTML = "🎉 Booking Successful! Wait for admin approval.";
        responseMsg.className = "text-center text-sm font-semibold mt-4 text-green-600";

        loadBookedSlots();
    } catch (error) {
        // Update message to error
        responseMsg.innerHTML = "❌ Booking failed. Please try again.";
        responseMsg.className = "text-center text-sm font-semibold mt-4 text-red-600";
    } finally {
        // Re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText || "Confirm Booking ⚽";
        }
    }
});

// Event listeners
courtSelect.addEventListener("change", loadBookedSlots);
dateInput.addEventListener("change", loadBookedSlots);

// Init
loadCourts();
