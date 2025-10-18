import { loadTemplate } from '@/utils/templateLoader';
import { sendEmail } from '../../lib/mail';

export default async function sendTestMail(to, data) {
    const html = loadTemplate('test', data);
    const subject = `Test Email for ${data.name}`;
    return await sendEmail(to, subject, html);
}