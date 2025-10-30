import { loadTemplate } from '@/utils/templateLoader';
import { sendEmail } from '../../lib/mail';

export default async function sendOTPMail(to, data) {
    const html = loadTemplate('otp', data);
    const subject = `Password Reset OTP for ${data.username}`;
    return await sendEmail(to, subject, html);
}