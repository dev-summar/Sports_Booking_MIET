const API_URL = "http://127.0.0.1:5000/api";

// 30-min slots
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

    const bookedSlots = await res.json(); // array of booked times

    renderSlots(bookedSlots);
}

// Render slot buttons
function renderSlots(bookedSlots) {
    slotContainer.innerHTML = "";
    selectedSlot = "";

    slots.forEach(time => {
        const div = document.createElement("div");
        div.classList.add("slotBtn");
        div.innerText = time;

        if (bookedSlots.includes(time)) {
            div.classList.add("booked"); // orange
        } else {
            div.addEventListener("click", () => {
                document.querySelectorAll(".slotBtn").forEach(btn => 
                    btn.classList.remove("selected")
                );
                div.classList.add("selected");
                selectedSlot = time;
            });
        }

        slotContainer.appendChild(div);
    });
}

// Submit booking
bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
        alert("Please select a slot!");
        return;
    }

    const bookingData = {
        studentName: document.getElementById("nameInput").value,
        studentEmail: document.getElementById("emailInput").value,
        courtId: courtSelect.value,
        date: dateInput.value,
        startTime: selectedSlot, // final slot
        status: "pending"
    };

    const res = await fetch(`${API_URL}/bookings/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
    });

    const result = await res.json();

    if (result._id) {
        responseMsg.textContent = "🎉 Booking Successful! Wait for admin approval.";
        responseMsg.classList = "text-green-600 text-center";
        loadBookedSlots();  // refresh slots
    } else {
        responseMsg.textContent = "❌ Booking failed.";
        responseMsg.classList = "text-red-600 text-center";
    }
});

// Events
courtSelect.addEventListener("change", loadBookedSlots);
dateInput.addEventListener("change", loadBookedSlots);

// Init
loadCourts();
