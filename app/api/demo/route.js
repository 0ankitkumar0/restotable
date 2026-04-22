import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, phone, email, note } = await request.json();
    
    if (!name || !phone || !email) {
      return NextResponse.json({ error: 'Name, phone, and email are required' }, { status: 400 });
    }

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Assuming Gmail. You can use any SMTP server.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: `New Demo Request for RestoTable: ${name}`,
      text: `
New Demo Request Details:

Name: ${name}
Phone: ${phone}
Email: ${email}
Note: ${note || 'No additional notes provided.'}
      `,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #c0392b;">New Demo Request for RestoTable</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Note:</strong><br/> ${note || '<i>No additional notes provided.</i>'}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error sending demo email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
