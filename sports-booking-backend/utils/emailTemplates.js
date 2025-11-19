// Email Templates for Sports Booking System

/**
 * Get admin notification email template when a new booking is created
 */
function getAdminBookingNotificationTemplate(booking, baseUrl) {
  const BASE_URL = baseUrl || process.env.BASE_URL || 'http://localhost:5000';
  const bookingId = String(booking._id || booking.id || '');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          margin: -30px -30px 20px -30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          margin: 20px 0;
        }
        .info-box {
          background-color: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .info-row {
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #495057;
          display: inline-block;
          width: 140px;
        }
        .value {
          color: #212529;
        }
        .action-buttons {
          margin: 25px 0;
          text-align: center;
        }
        .action-button {
          display: inline-block;
          padding: 14px 35px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          margin: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .btn-approve {
          background-color: #28a745;
          color: white;
        }
        .btn-reject {
          background-color: #dc3545;
          color: white;
        }
        .btn-admin-panel {
          background-color: #667eea;
          color: white;
          padding: 12px 25px;
          font-size: 14px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          text-align: left;
          color: #495057;
          font-size: 13px;
        }
        .footer-signature {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }
        .footer-name {
          font-weight: bold;
          color: #212529;
          margin-bottom: 5px;
        }
        .footer-institution {
          color: #495057;
          margin-bottom: 8px;
        }
        .footer-contact {
          color: #6c757d;
          font-size: 12px;
          line-height: 1.8;
          margin-top: 10px;
        }
        .footer-contact a {
          color: #667eea;
          text-decoration: none;
        }
        .footer-thanks {
          margin-top: 15px;
          color: #495057;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏸 New Booking Request</h1>
        </div>
        
        <div class="content">
          <p>Hello Admin,</p>
          <p>A new booking request has been submitted and requires your review.</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="label">Student Name:</span>
              <span class="value">${booking.studentName}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${booking.studentEmail}</span>
            </div>
            ${booking.teamMembers ? `
            <div class="info-row">
              <span class="label">Team Members:</span>
              <span class="value">${booking.teamMembers}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="label">Court:</span>
              <span class="value">${booking.courtId?.name || booking.courtId || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${booking.date}</span>
            </div>
            <div class="info-row">
              <span class="label">Time Slot:</span>
              <span class="value">${booking.startTime}</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <a href="${BASE_URL}/api/bookings/${bookingId}/approve-email" 
               class="action-button btn-approve"
               style="display: inline-block; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 8px; background-color: #28a745; color: white;">
              ✅ Approve Booking
            </a>
            <a href="${BASE_URL}/api/bookings/${bookingId}/reject-email" 
               class="action-button btn-reject"
               style="display: inline-block; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 8px; background-color: #dc3545; color: white;">
              ❌ Reject Booking
            </a>
          </div>
          
          <p style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 13px;">
            <strong>Or</strong> log in to the admin panel for more options.
          </p>
          
          <p style="margin-top: 15px; text-align: center; color: #6c757d; font-size: 12px;">
            If buttons don't work, use these links:<br>
            <a href="${BASE_URL}/api/bookings/${bookingId}/approve-email" style="color: #28a745; text-decoration: underline;">Approve</a> | 
            <a href="${BASE_URL}/api/bookings/${bookingId}/reject-email" style="color: #dc3545; text-decoration: underline;">Reject</a>
          </p>
        </div>
        
        <div class="footer">
          <p style="text-align: center; color: #6c757d; font-size: 12px; margin-bottom: 20px;">
            This is an automated notification from MIET Sports Booking System.
          </p>
          
          <div class="footer-signature">
            <p class="footer-thanks">Thank you for booking with us! We look forward to seeing you on the field.</p>
            
            <div class="footer-name">Best regards,</div>
            <div class="footer-name">Sukomal Ganguly</div>
            <div class="footer-institution">Model Institute of Engineering & Technology</div>
            <div class="footer-institution">Kot Bhalwal, Jammu</div>
            
            <div class="footer-contact">
              📞 Contact: 8899401903<br>
              ✉ Email: <a href="mailto:sukomal.adm@mietjammu.in">sukomal.adm@mietjammu.in</a><br>
              🌐 Website: <a href="https://mietjmu.in/" target="_blank">https://mietjmu.in/</a>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get student confirmation email template when booking is approved
 */
function getStudentApprovalTemplate(booking) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          margin: -30px -30px 20px -30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .success-icon {
          font-size: 48px;
          margin: 10px 0;
        }
        .content {
          margin: 20px 0;
        }
        .info-box {
          background-color: #f8f9fa;
          border-left: 4px solid #11998e;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .info-row {
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #495057;
          display: inline-block;
          width: 140px;
        }
        .value {
          color: #212529;
        }
        .highlight-box {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          color: #155724;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          text-align: left;
          color: #495057;
          font-size: 13px;
        }
        .footer-signature {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }
        .footer-name {
          font-weight: bold;
          color: #212529;
          margin-bottom: 5px;
        }
        .footer-institution {
          color: #495057;
          margin-bottom: 8px;
        }
        .footer-contact {
          color: #6c757d;
          font-size: 12px;
          line-height: 1.8;
          margin-top: 10px;
        }
        .footer-contact a {
          color: #11998e;
          text-decoration: none;
        }
        .footer-thanks {
          margin-top: 15px;
          color: #495057;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">✅</div>
          <h1>Booking Approved!</h1>
        </div>
        
        <div class="content">
          <p>Dear ${booking.studentName},</p>
          <p>Great news! Your booking request has been <strong>approved</strong> by the admin.</p>
          
          <div class="highlight-box">
            <strong>🎉 Your booking is confirmed!</strong>
          </div>
          
          <div class="info-box">
            <div class="info-row">
              <span class="label">Court:</span>
              <span class="value">${booking.courtId?.name || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${booking.date}</span>
            </div>
            <div class="info-row">
              <span class="label">Time Slot:</span>
              <span class="value">${booking.startTime}</span>
            </div>
            ${booking.teamMembers ? `
            <div class="info-row">
              <span class="label">Team Members:</span>
              <span class="value">${booking.teamMembers}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="highlight-box">
            <strong>⏰ Important:</strong> Please arrive on time for your booking. Late arrivals may result in slot cancellation.
          </div>
          
          <p>We look forward to seeing you at the sports facility!</p>
        </div>
        
        <div class="footer">
          <p style="text-align: center; color: #6c757d; font-size: 12px; margin-bottom: 20px;">
            This is an automated confirmation from MIET Sports Booking System.
          </p>
          
          <div class="footer-signature">
            <p class="footer-thanks">Thank you for booking with us! We look forward to seeing you on the field.</p>
            
            <div class="footer-name">Best regards,</div>
            <div class="footer-name">Sukomal Ganguly</div>
            <div class="footer-institution">Model Institute of Engineering & Technology</div>
            <div class="footer-institution">Kot Bhalwal, Jammu</div>
            
            <div class="footer-contact">
              📞 Contact: 8899401903<br>
              ✉ Email: <a href="mailto:sukomal.adm@mietjammu.in">sukomal.adm@mietjammu.in</a><br>
              🌐 Website: <a href="https://mietjmu.in/" target="_blank">https://mietjmu.in/</a>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get student rejection email template when booking is rejected
 */
function getStudentRejectionTemplate(booking) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: #ffffff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
          color: white;
          padding: 20px;
          border-radius: 10px 10px 0 0;
          margin: -30px -30px 20px -30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          margin: 20px 0;
        }
        .info-box {
          background-color: #f8f9fa;
          border-left: 4px solid #eb3349;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .info-row {
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #495057;
          display: inline-block;
          width: 140px;
        }
        .value {
          color: #212529;
        }
        .message-box {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          text-align: left;
          color: #495057;
          font-size: 13px;
        }
        .footer-signature {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }
        .footer-name {
          font-weight: bold;
          color: #212529;
          margin-bottom: 5px;
        }
        .footer-institution {
          color: #495057;
          margin-bottom: 8px;
        }
        .footer-contact {
          color: #6c757d;
          font-size: 12px;
          line-height: 1.8;
          margin-top: 10px;
        }
        .footer-contact a {
          color: #eb3349;
          text-decoration: none;
        }
        .footer-thanks {
          margin-top: 15px;
          color: #495057;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Booking Request Rejected</h1>
        </div>
        
        <div class="content">
          <p>Dear ${booking.studentName},</p>
          <p>We regret to inform you that your booking request has been <strong>rejected</strong> by the admin.</p>
          
          <div class="info-box">
            <div class="info-row">
              <span class="label">Court:</span>
              <span class="value">${booking.courtId?.name || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${booking.date}</span>
            </div>
            <div class="info-row">
              <span class="label">Time Slot:</span>
              <span class="value">${booking.startTime}</span>
            </div>
          </div>
          
          <div class="message-box">
            <strong>💡 What's Next?</strong><br>
            You can try booking another available slot. We apologize for any inconvenience caused.
          </div>
          
          <p>If you have any questions about this decision, please contact the admin.</p>
        </div>
        
        <div class="footer">
          <p style="text-align: center; color: #6c757d; font-size: 12px; margin-bottom: 20px;">
            This is an automated notification from MIET Sports Booking System.
          </p>
          
          <div class="footer-signature">
            <p class="footer-thanks">Thank you for booking with us! We look forward to seeing you on the field.</p>
            
            <div class="footer-name">Best regards,</div>
            <div class="footer-name">Sukomal Ganguly</div>
            <div class="footer-institution">Model Institute of Engineering & Technology</div>
            <div class="footer-institution">Kot Bhalwal, Jammu</div>
            
            <div class="footer-contact">
              📞 Contact: 8899401903<br>
              ✉ Email: <a href="mailto:sukomal.adm@mietjammu.in">sukomal.adm@mietjammu.in</a><br>
              🌐 Website: <a href="https://mietjmu.in/" target="_blank">https://mietjmu.in/</a>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  getAdminBookingNotificationTemplate,
  getStudentApprovalTemplate,
  getStudentRejectionTemplate
};

