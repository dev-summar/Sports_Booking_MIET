# MIET Sports Booking System

A comprehensive web application for managing sports court bookings at Model Institute of Engineering & Technology (MIET), Jammu. The system allows students to book sports courts and enables administrators to manage and approve booking requests.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Authentication System](#authentication-system)
- [Usage Guide](#usage-guide)
- [Database Models](#database-models)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### Student Features
- **Court Booking**: Students can book available sports courts
- **Slot Selection**: Choose from 30-minute time slots (12:30 PM - 4:30 PM)
- **Team Members**: Add team members to bookings
- **Real-time Availability**: See which slots are already booked
- **Instant Feedback**: Immediate confirmation when submitting bookings
- **Booking Status**: Track booking status (pending, approved, rejected)

### Admin Features
- **Dashboard**: Comprehensive admin dashboard with booking overview
- **Booking Management**: Approve or reject booking requests
- **Slot Blocking**: Block specific slots for maintenance or faculty use
- **Filtering**: Filter bookings by date and court
- **Excel Export**: Download approved bookings as Excel file
- **Email Notifications**: Automatic email notifications for new bookings
- **Authentication**: Secure login system with JWT tokens

## 🛠 Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database (via Mongoose)
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Nodemailer**: Email notifications
- **CORS**: Cross-origin resource sharing

### Frontend
- **HTML5**: Structure
- **Tailwind CSS**: Styling (via CDN)
- **Vanilla JavaScript**: Client-side logic
- **SheetJS (XLSX)**: Excel export functionality

## 📁 Project Structure

```
Sports_Booking_MIET/
│
├── sports-booking-backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection configuration
│   ├── models/
│   │   ├── Admin.js              # Admin user model
│   │   ├── Booking.js            # Booking model
│   │   └── Court.js              # Court model
│   ├── routes/
│   │   ├── adminAuth.js          # Admin authentication routes
│   │   ├── bookings.js           # Booking management routes
│   │   └── courts.js              # Court management routes
│   ├── scripts/
│   │   └── createAdmin.js        # Script to create admin users
│   ├── utils/
│   │   └── mail.js               # Email utility functions
│   ├── server.js                 # Main server file
│   └── package.json              # Dependencies
│
└── sports-frontend/
    ├── admin_dashboard/
    │   ├── admin.html            # Admin dashboard page
    │   ├── admin.js              # Admin dashboard logic
    │   └── admin_login.html      # Admin login page
    ├── student_dashboard/
    │   ├── index.html            # Student booking page
    │   └── student.js           # Student booking logic
    └── assets/
        ├── js/
        │   └── booking.js        # Additional booking utilities
        └── miet-logo.png         # MIET logo
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Sports_Booking_MIET
```

### Step 2: Backend Setup

1. Navigate to backend directory:
```bash
cd sports-booking-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `sports-booking-backend/` directory:
```env
MONGO_URI=mongodb://localhost:27017/sports-booking
JWT_SECRET=your_secret_key_here_make_it_long_and_random
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=summar.adm@mietjammu.in
BASE_URL=http://localhost:5000
```

4. Start the server:
```bash
node server.js
```

The server will run on `http://localhost:5000`

### Step 3: Create Admin User

Run the admin creation script:
```bash
node scripts/createAdmin.js admin@mietjammu.in your_password
```

Replace `admin@mietjammu.in` and `your_password` with your desired credentials.

### Step 4: Frontend Setup

1. Navigate to frontend directory (if needed):
```bash
cd ../sports-frontend
```

2. Open the application:
   - **Student Dashboard**: Open `student_dashboard/index.html` in a web browser
   - **Admin Dashboard**: Open `admin_dashboard/admin_login.html` in a web browser

**Note**: For production, serve the frontend files using a web server (Apache, Nginx, or a simple HTTP server).

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in `sports-booking-backend/` with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/sports-booking` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_long_random_secret_key` |
| `EMAIL_USER` | Email address for sending notifications | `your-email@gmail.com` |
| `EMAIL_PASS` | Email app password | `your-app-password` |
| `ADMIN_EMAIL` | Admin email address to receive booking notifications | `summar.adm@mietjammu.in` |
| `BASE_URL` | Base URL for email action links (optional, defaults to localhost:5000) | `http://localhost:5000` or `https://yourdomain.com` |

### Email Configuration

For Gmail:
1. Enable 2-Step Verification
2. Generate an App Password
3. Use the app password in `EMAIL_PASS`

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@mietjammu.in",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "jwt_token_here"
}
```

### Court Endpoints

#### Get All Courts
```http
GET /api/courts
```

**Response:**
```json
[
  {
    "_id": "court_id",
    "name": "Basketball Court 1",
    "type": "Basketball",
    "active": true
  }
]
```

#### Add Court
```http
POST /api/courts/add
Content-Type: application/json

{
  "name": "Tennis Court 1",
  "type": "Tennis",
  "active": true
}
```

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings/add
Content-Type: application/json

{
  "studentName": "John Doe",
  "studentEmail": "john@mietjammu.in",
  "courtId": "court_id",
  "date": "2024-01-15",
  "startTime": "14:00",
  "teamMembers": "Jane, Bob",
  "status": "pending"
}
```

#### Get All Bookings
```http
GET /api/bookings
```

**Response:**
```json
[
  {
    "_id": "booking_id",
    "studentName": "John Doe",
    "studentEmail": "john@mietjammu.in",
    "courtId": {
      "_id": "court_id",
      "name": "Basketball Court 1"
    },
    "date": "2024-01-15",
    "startTime": "14:00",
    "teamMembers": "Jane, Bob",
    "status": "pending",
    "createdAt": "2024-01-10T10:00:00Z"
  }
]
```

#### Check Available Slots
```http
GET /api/bookings/check-slots?court=court_id&date=2024-01-15
```

**Response:**
```json
["12:30", "13:00", "14:30"]
```

#### Approve Booking
```http
PUT /api/bookings/:id/approve
```

#### Reject Booking
```http
PUT /api/bookings/:id/reject
```

#### Delete Booking
```http
DELETE /api/bookings/:id
```

## 🔐 Authentication System

### Admin Authentication

The admin dashboard is protected by JWT-based authentication:

1. **Login Flow**:
   - Admin enters email and password on `admin_login.html`
   - Backend validates credentials and returns JWT token
   - Token is stored in `localStorage` as `admintoken`
   - Token expires after 24 hours

2. **Protection**:
   - `admin.html` checks for token before rendering
   - If no token exists, redirects to login page
   - Token is validated on page load

3. **Logout**:
   - Click "Logout" button in admin dashboard
   - Removes token from `localStorage`
   - Redirects to login page

### Creating Admin Users

Use the provided script:
```bash
cd sports-booking-backend
node scripts/createAdmin.js email@example.com password
```

The script will:
- Hash the password using bcrypt
- Create an admin user in the database
- Display confirmation message

## 📖 Usage Guide

### For Students

1. **Access Booking Page**:
   - Open `sports-frontend/student_dashboard/index.html`

2. **Book a Court**:
   - Select a court from the dropdown
   - Choose a date
   - Select an available time slot (green buttons)
   - Fill in your name and email
   - Optionally add team members
   - Click "Confirm Booking"

3. **View Booking Status**:
   - After submission, you'll see a confirmation message
   - Wait for admin approval
   - You'll receive an email when your booking is approved/rejected

### For Administrators

1. **Login**:
   - Open `sports-frontend/admin_dashboard/admin_login.html`
   - Enter admin email and password
   - Click "Login"

2. **View Bookings**:
   - Dashboard shows all bookings
   - Filter by date or court using the filters
   - View pending requests in the "Pending Requests" section

3. **Manage Bookings**:
   - **Approve**: Click "Approve" button on pending requests
   - **Reject**: Click "Reject" button on pending requests
   - **Block Slot**: Use the "Block a Slot" section to block specific slots

4. **Export Data**:
   - Click "Download Approved (Excel)" button
   - Excel file with all approved bookings will be downloaded

5. **Logout**:
   - Click "Logout" button in the header
   - Confirm logout action

## 🗄️ Database Models

### Admin Model
```javascript
{
  email: String,
  password: String (hashed)
}
```

### Court Model
```javascript
{
  name: String (required),
  type: String (required),
  active: Boolean (default: true)
}
```

### Booking Model
```javascript
{
  studentName: String (required),
  studentEmail: String (required),
  courtId: ObjectId (ref: "Court", required),
  date: String (required),
  startTime: String (required),
  teamMembers: String (default: ""),
  status: String (enum: ["pending", "approved", "rejected", "blocked"], default: "pending"),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🎯 Available Time Slots

The system uses 30-minute time slots:
- 12:30 PM
- 1:00 PM
- 1:30 PM
- 2:00 PM
- 2:30 PM
- 3:00 PM
- 3:30 PM
- 4:00 PM
- 4:30 PM

## 🔧 Troubleshooting

### Server Issues

**Problem**: Server won't start
- **Solution**: Check if MongoDB is running and `MONGO_URI` is correct

**Problem**: "Cannot POST /api/admin/login"
- **Solution**: Restart the server after adding new routes

**Problem**: JWT_SECRET error
- **Solution**: Ensure `.env` file has `JWT_SECRET` set

### Frontend Issues

**Problem**: Login page not redirecting
- **Solution**: Check browser console for errors, verify server is running on port 5000

**Problem**: Bookings not showing
- **Solution**: Check browser console, verify API endpoints are accessible

**Problem**: Admin dashboard redirects to login
- **Solution**: Clear browser cache, check if token exists in localStorage

### Database Issues

**Problem**: Cannot connect to MongoDB
- **Solution**: 
  - Verify MongoDB is running
  - Check `MONGO_URI` in `.env` file
  - Ensure network connectivity

**Problem**: Admin user not found
- **Solution**: Run the admin creation script again

### Email Issues

**Problem**: Emails not sending
- **Solution**:
  - Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
  - For Gmail, use App Password (not regular password)
  - Check email service provider settings

## 📝 Development Notes

### Adding New Courts

Courts can be added via:
1. API endpoint: `POST /api/courts/add`
2. Direct database insertion
3. Admin panel (if implemented)

### Customizing Email Templates

Edit email templates in `sports-booking-backend/routes/bookings.js`:
- New booking notification (line ~16)
- Approval notification (line ~104)
- Rejection notification (line ~144)

### Modifying Time Slots

Edit the `slots` array in:
- `sports-frontend/student_dashboard/student.js` (line 4-7)
- `sports-frontend/admin_dashboard/admin.js` (line 86-96)

## 🔒 Security Considerations

1. **Password Hashing**: All admin passwords are hashed using bcrypt
2. **JWT Tokens**: Tokens expire after 24 hours
3. **CORS**: Configured to allow cross-origin requests
4. **Input Validation**: Implement validation on both frontend and backend
5. **Environment Variables**: Sensitive data stored in `.env` file

## 📄 License

This project is for internal use by Model Institute of Engineering & Technology, Jammu.

## 👥 Support

For issues or questions:
- Check the troubleshooting section
- Review server logs for error messages
- Verify all environment variables are set correctly

## 🎉 Features Summary

✅ Student court booking system  
✅ Admin dashboard with booking management  
✅ JWT-based authentication  
✅ Email notifications  
✅ Excel export functionality  
✅ Slot blocking for maintenance  
✅ Real-time availability checking  
✅ Team member support  
✅ Responsive design  
✅ Professional UI matching MIET branding  

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Maintained by**: MIET Sports Department

