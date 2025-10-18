import fs from 'fs';
import path from 'path';

export function loadTemplate(templateName, data) {
    try {
        const templatePath = path.join(process.cwd(), 'mails', 'templates', `${templateName}.html`);
        let html = fs.readFileSync(templatePath, 'utf8');

        // Replace variables
        Object.keys(data).forEach(key => {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
        });

        return html;
    } catch (error) {
        console.log('Template error:', error);
        return `<p>Email template not found</p>`;
    }
}