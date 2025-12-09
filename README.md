# **MIET Sports Booking System**

A comprehensive and user-friendly web application designed to streamline sports court bookings at **Model Institute of Engineering & Technology (MIET), Jammu**.
Students can easily book time slots, while administrators manage, approve, export, and monitor booking activities through a dedicated dashboard.

---

## 📌 **Table of Contents**

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Installation & Setup](#installation--setup)
* [Configuration](#configuration)
* [API Documentation](#api-documentation)
* [Authentication System](#authentication-system)
* [Usage Guide](#usage-guide)
* [Database Models](#database-models)
* [Troubleshooting](#troubleshooting)
* [Security Considerations](#security-considerations)
* [License](#license)

---

## ✨ **Features**

### **Student Features**

* Book available sports courts
* Select 30-minute time slots (12:30 PM – 4:30 PM)
* Add team members
* View real-time slot availability
* Instant booking feedback
* Track booking status (pending/approved/rejected)

### **Admin Features**

* Full booking dashboard
* Approve or reject booking requests
* Block slots for maintenance/faculty use
* Filter bookings by date or court
* Export approved bookings to Excel
* Automatic email notifications
* Secure login using JWT

---

## 🛠 **Tech Stack**

### **Backend**

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* bcryptjs
* Nodemailer
* CORS

### **Frontend**

* HTML5
* Tailwind CSS
* Vanilla JavaScript
* SheetJS (Excel export)

---

## 📁 **Project Structure**

```
Sports_Booking_MIET/
│
├── sports-booking-backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── sports-frontend/
    ├── admin_dashboard/
    ├── student_dashboard/
    └── assets/
```

---

## 🚀 **Installation & Setup**

### **Prerequisites**

* Node.js
* MongoDB
* npm or yarn

---

### **Step 1 — Clone the Repository**

```bash
git clone <repository-url>
cd Sports_Booking_MIET
```

### **Step 2 — Backend Setup**

```bash
cd sports-booking-backend
npm install
```

---

### **Step 3 — Create `.env` (Do NOT commit to GitHub)**

Create a `.env` file inside `sports-booking-backend/`:

```env
MONGO_URI=<your-mongodb-url>
JWT_SECRET=<your-secret-key>
EMAIL_USER=<your-email-id>
EMAIL_PASS=<your-app-password>
ADMIN_EMAIL=<your-admin-email>
BASE_URL=<your-backend-url>
```

⚠️ **All secrets must remain private. Never commit `.env` to GitHub.**

---

### **Step 4 — Run Backend**

```bash
node server.js
```

Server runs on:
👉 **[http://localhost:5000](http://localhost:5000)**

---

### **Step 5 — Create Admin User**

```bash
node scripts/createAdmin.js <email> <password>
```

---

### **Step 6 — Run Frontend**

Open directly in your browser:

* **Student Dashboard** → `sports-frontend/student_dashboard/index.html`
* **Admin Login** → `sports-frontend/admin_dashboard/admin_login.html`

---

## ⚙️ **Configuration**

| Variable      | Description                          |
| ------------- | ------------------------------------ |
| `MONGO_URI`   | MongoDB database URL                 |
| `JWT_SECRET`  | Secret key for generating JWT tokens |
| `EMAIL_USER`  | Email used for sending notifications |
| `EMAIL_PASS`  | Email app password                   |
| `ADMIN_EMAIL` | Admin notification email             |
| `BASE_URL`    | Backend base URL                     |

---


## 🔐 **Authentication System**

* JWT-based admin login
* Token saved in `localStorage`
* Auto expires in 24 hours
* Redirect to login if no valid token
* Logout clears token

---

## 📖 **Usage Guide**

### **Students**

1. Open booking page
2. Select court, date, and slot
3. Enter details
4. Submit booking
5. Wait for admin approval

### **Admins**

1. Login via admin page
2. View dashboard
3. Approve/Reject/Block slots
4. Export approved bookings
5. Logout

---



## 🕒 **Available Time Slots**

* 12:30 PM
* 1:00 PM
* 1:30 PM
* 2:00 PM
* 2:30 PM
* 3:00 PM
* 3:30 PM
* 4:00 PM
* 4:30 PM

---

## 🔧 **Troubleshooting**

### **Backend Issues**

* Ensure MongoDB is running
* Check `MONGO_URI`
* Restart server after route updates

### **Frontend Issues**

* Check console errors
* Ensure backend is running on port 5000

### **Email Issues**

* Use App Password
* Check SMTP settings

---

## 🔒 **Security Considerations**

* Never commit `.env`
* Use strong JWT secret
* Enable HTTPS in production
* Validate all user inputs
* Ensure admin passwords are hashed

---

## 📄 **License**

Internal project for **MIET Jammu**.
Not for external distribution.

---

