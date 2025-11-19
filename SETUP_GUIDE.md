# Setup Guide

Step-by-step instructions to set up and run the MIET Sports Booking System.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional) - [Download](https://git-scm.com/)
- A code editor (VS Code, Sublime Text, etc.)

## Step 1: Install MongoDB

### Windows
1. Download MongoDB Community Server from the official website
2. Run the installer and follow the setup wizard
3. MongoDB will be installed as a Windows service
4. Verify installation by opening Command Prompt and running:
   ```bash
   mongod --version
   ```

### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Step 2: Clone or Download Project

If using Git:
```bash
git clone <repository-url>
cd Sports_Booking_MIET
```

Or download and extract the project files.

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory
```bash
cd sports-booking-backend
```

### 3.2 Install Dependencies
```bash
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- nodemailer
- cors
- dotenv

### 3.3 Create Environment File

Create a `.env` file in the `sports-booking-backend` directory:

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**macOS/Linux:**
```bash
touch .env
```

### 3.4 Configure Environment Variables

Open `.env` file and add the following:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/sports-booking

# JWT Secret (use a long random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_12345

# Email Configuration (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Important Notes:**
- Replace `MONGO_URI` if using MongoDB Atlas or remote MongoDB
- `JWT_SECRET` should be a long, random string (at least 32 characters)
- For Gmail, you'll need to generate an App Password (see Email Setup below)

### 3.5 Start MongoDB

Make sure MongoDB is running:

**Windows:**
- MongoDB should start automatically as a service
- Or run: `net start MongoDB`

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongodb
```

### 3.6 Start Backend Server

```bash
node server.js
```

You should see:
```
Server running on port 5000
MongoDB Connected
```

If you see errors, check:
- MongoDB is running
- Port 5000 is not in use
- `.env` file exists and has correct values

## Step 4: Create Admin User

Open a new terminal window and run:

```bash
cd sports-booking-backend
node scripts/createAdmin.js admin@mietjammu.in admin123
```

Replace:
- `admin@mietjammu.in` with your desired admin email
- `admin123` with your desired password

You should see:
```
✅ Admin user created successfully!
Email: admin@mietjammu.in
ID: ...
```

**Security Note:** Change the default password after first login!

## Step 5: Frontend Setup

### 5.1 Navigate to Frontend Directory
```bash
cd ../sports-frontend
```

### 5.2 Open in Browser

**Option 1: Direct File Opening**
- Open `student_dashboard/index.html` in your browser
- Open `admin_dashboard/admin_login.html` in your browser

**Option 2: Using a Local Server (Recommended)**

**Using Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Using Node.js (http-server):**
```bash
npm install -g http-server
http-server -p 8000
```

Then open:
- Student Dashboard: `http://localhost:8000/student_dashboard/index.html`
- Admin Login: `http://localhost:8000/admin_dashboard/admin_login.html`

## Step 6: Email Setup (Optional but Recommended)

### For Gmail:

1. **Enable 2-Step Verification:**
   - Go to Google Account settings
   - Security → 2-Step Verification
   - Enable it

2. **Generate App Password:**
   - Go to Google Account settings
   - Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "MIET Sports Booking"
   - Copy the generated 16-character password

3. **Update .env:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```
   (Remove spaces from the app password)

### For Other Email Providers:

Check your email provider's documentation for SMTP settings and app passwords.

## Step 7: Verify Installation

### Test Backend:
1. Open browser and go to: `http://localhost:5000`
2. You should see: "Sports Booking Backend Running..."

### Test Admin Login:
1. Open `admin_dashboard/admin_login.html`
2. Login with the admin credentials you created
3. You should be redirected to the admin dashboard

### Test Student Booking:
1. Open `student_dashboard/index.html`
2. Fill in the booking form
3. Submit a booking
4. Check admin dashboard to see the booking

## Troubleshooting

### MongoDB Connection Issues

**Problem:** "MongoDB Connection Error"

**Solutions:**
1. Verify MongoDB is running:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongodb
   ```

2. Check connection string in `.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/sports-booking
   ```

3. For MongoDB Atlas, use:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sports-booking
   ```

### Port Already in Use

**Problem:** "Port 5000 is already in use"

**Solutions:**
1. Find and stop the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:5000 | xargs kill
   ```

2. Or change the port in `server.js`:
   ```javascript
   app.listen(3000, () => console.log("Server running on port 3000"));
   ```

### JWT_SECRET Error

**Problem:** "JWT_SECRET is not set"

**Solution:**
1. Ensure `.env` file exists in `sports-booking-backend/`
2. Add `JWT_SECRET=your_long_random_string`
3. Restart the server

### Admin Login Not Working

**Problem:** Cannot login to admin panel

**Solutions:**
1. Verify admin user exists:
   ```bash
   node scripts/createAdmin.js admin@mietjammu.in password
   ```

2. Check browser console for errors
3. Verify server is running on port 5000
4. Clear browser cache and localStorage

### Email Not Sending

**Problem:** Email notifications not working

**Solutions:**
1. Verify email credentials in `.env`
2. For Gmail, use App Password (not regular password)
3. Check email service provider settings
4. Review server logs for email errors

## Development Tips

### Running in Development Mode

For auto-restart on file changes, install `nodemon`:
```bash
npm install -g nodemon
nodemon server.js
```

### Database Management

**View Collections:**
```bash
mongosh
use sports-booking
show collections
```

**View Bookings:**
```javascript
db.bookings.find().pretty()
```

**View Admins:**
```javascript
db.admins.find().pretty()
```

**View Courts:**
```javascript
db.courts.find().pretty()
```

## Production Deployment

### Backend Deployment

1. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 save
   pm2 startup
   ```

2. Set up environment variables on your hosting platform
3. Use a reverse proxy (Nginx) for production

### Frontend Deployment

1. Serve static files using:
   - Nginx
   - Apache
   - Cloud services (Netlify, Vercel, etc.)

2. Update API URLs if backend is on different domain

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set up CORS properly for production
- [ ] Use environment variables (never commit .env)
- [ ] Regular database backups
- [ ] Keep dependencies updated

## Next Steps

After setup:
1. Create additional admin users if needed
2. Add courts to the system
3. Test the complete booking flow
4. Customize email templates
5. Configure production settings

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review server logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

**Setup Complete!** 🎉

You should now have a fully functional Sports Booking System running locally.

