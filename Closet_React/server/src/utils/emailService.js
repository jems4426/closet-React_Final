import nodemailer from 'nodemailer';

// Create transporter with your email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send verification code email
export const sendVerificationCode = async (email, code, userName = 'User') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Verification Code - Closet',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fef7ed 0%, #fdf2f8 50%, #f3e8ff 100%); padding: 30px; border-radius: 15px; text-align: center;">
            <h1 style="color: #e11d48; margin-bottom: 20px;">Closet - Password Reset</h1>
            <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">
              Hi ${userName},<br><br>
              You requested to reset your password. Use the verification code below:
            </p>
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #e11d48;">
              <h2 style="color: #e11d48; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h2>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This code will expire in 10 minutes.<br>
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send contact form notification
export const sendContactNotification = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission - ${contactData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e11d48;">New Contact Form Submission</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Name:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Subject:</strong> ${contactData.subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
              ${contactData.message}
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Contact notification failed:', error);
    return { success: false, error: error.message };
  }
};