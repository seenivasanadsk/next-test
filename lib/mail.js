// lib/mail.js
import nodemailer from 'nodemailer';

export async function sendEmail(to, subject, html) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: process.env.MAIL_ID,
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.log('Email error:', error);
        return false;
    }
}