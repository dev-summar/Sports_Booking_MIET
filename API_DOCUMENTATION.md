# API Documentation

Complete API reference for the MIET Sports Booking System.

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Admin Login
Authenticate an admin user and receive a JWT token.

**Endpoint:** `POST /api/admin/login`

**Request Body:**
```json
{
  "email": "admin@mietjammu.in",
  "password": "your_password"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (400):**
```json
{
  "error": "Invalid email or password"
}
```

**Error Response (500):**
```json
{
  "error": "Server configuration error. Please contact administrator."
}
```

---

## Courts

### Get All Courts
Retrieve a list of all available courts.

**Endpoint:** `GET /api/courts`

**Response (200):**
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Basketball Court 1",
    "type": "Basketball",
    "active": true
  },
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Tennis Court 1",
    "type": "Tennis",
    "active": true
  }
]
```

### Add Court
Create a new court.

**Endpoint:** `POST /api/courts/add`

**Request Body:**
```json
{
  "name": "Volleyball Court 1",
  "type": "Volleyball",
  "active": true
}
```

**Success Response (200):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "name": "Volleyball Court 1",
  "type": "Volleyball",
  "active": true
}
```

---

## Bookings

### Create Booking
Create a new booking request.

**Endpoint:** `POST /api/bookings/add`

**Request Body:**
```json
{
  "studentName": "John Doe",
  "studentEmail": "john@mietjammu.in",
  "courtId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "date": "2024-01-15",
  "startTime": "14:00",
  "teamMembers": "Jane Smith, Bob Johnson",
  "status": "pending"
}
```

**Success Response (200):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
  "studentName": "John Doe",
  "studentEmail": "john@mietjammu.in",
  "courtId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "date": "2024-01-15",
  "startTime": "14:00",
  "teamMembers": "Jane Smith, Bob Johnson",
  "status": "pending",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-10T10:30:00.000Z"
}
```

**Note:** This endpoint automatically sends an email notification to the admin.

### Get All Bookings
Retrieve all bookings with court details populated.

**Endpoint:** `GET /api/bookings`

**Response (200):**
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
    "studentName": "John Doe",
    "studentEmail": "john@mietjammu.in",
    "courtId": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Basketball Court 1",
      "type": "Basketball",
      "active": true
    },
    "date": "2024-01-15",
    "startTime": "14:00",
    "teamMembers": "Jane Smith, Bob Johnson",
    "status": "pending",
    "createdAt": "2024-01-10T10:30:00.000Z",
    "updatedAt": "2024-01-10T10:30:00.000Z"
  }
]
```

### Check Available Slots
Get list of booked slots for a specific court and date.

**Endpoint:** `GET /api/bookings/check-slots`

**Query Parameters:**
- `court` (required): Court ID
- `date` (required): Date in YYYY-MM-DD format

**Example:**
```
GET /api/bookings/check-slots?court=65a1b2c3d4e5f6g7h8i9j0k1&date=2024-01-15
```

**Response (200):**
```json
["12:30", "13:00", "14:30", "15:00"]
```

**Error Response (400):**
```json
{
  "error": "Court and date required"
}
```

### Approve Booking
Approve a pending booking request.

**Endpoint:** `PUT /api/bookings/:id/approve`

**URL Parameters:**
- `id`: Booking ID

**Example:**
```
PUT /api/bookings/65a1b2c3d4e5f6g7h8i9j0k4/approve
```

**Success Response (200):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
  "studentName": "John Doe",
  "studentEmail": "john@mietjammu.in",
  "courtId": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Basketball Court 1"
  },
  "date": "2024-01-15",
  "startTime": "14:00",
  "status": "approved",
  "updatedAt": "2024-01-10T11:00:00.000Z"
}
```

**Note:** This endpoint automatically sends an approval email to the student.

### Reject Booking
Reject a pending booking request.

**Endpoint:** `PUT /api/bookings/:id/reject`

**URL Parameters:**
- `id`: Booking ID

**Example:**
```
PUT /api/bookings/65a1b2c3d4e5f6g7h8i9j0k4/reject
```

**Success Response (200):**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
  "studentName": "John Doe",
  "studentEmail": "john@mietjammu.in",
  "courtId": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Basketball Court 1"
  },
  "date": "2024-01-15",
  "startTime": "14:00",
  "status": "rejected",
  "updatedAt": "2024-01-10T11:05:00.000Z"
}
```

**Note:** This endpoint automatically sends a rejection email to the student.

### Delete Booking
Delete a booking from the system.

**Endpoint:** `DELETE /api/bookings/:id`

**URL Parameters:**
- `id`: Booking ID

**Example:**
```
DELETE /api/bookings/65a1b2c3d4e5f6g7h8i9j0k4
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Booking deleted"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Error message describing what went wrong"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error message"
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input or missing parameters |
| 500 | Internal Server Error - Server-side error |

---

## Booking Status Values

- `pending`: Booking request submitted, awaiting admin approval
- `approved`: Booking has been approved by admin
- `rejected`: Booking has been rejected by admin
- `blocked`: Slot blocked by admin (not available for booking)

---

## Time Slot Format

All time slots use 24-hour format with 30-minute intervals:
- `12:30`
- `13:00`
- `13:30`
- `14:00`
- `14:30`
- `15:00`
- `15:30`
- `16:00`
- `16:30`

---

## Date Format

All dates use ISO 8601 format: `YYYY-MM-DD`

Example: `2024-01-15`

---

## Email Notifications

The following actions trigger automatic email notifications:

1. **New Booking Created**: Email sent to admin
2. **Booking Approved**: Email sent to student
3. **Booking Rejected**: Email sent to student

Email templates can be customized in `sports-booking-backend/routes/bookings.js`.

