import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
    const { data, error } = await resend.emails.send({
        from: 'Otaku Store <onboarding@resend.dev>',
        to,
        subject,
        html,
    });

    if (error) {
        console.error('Resend error:', error);
        throw new Error('Failed to send email.');
    }

    console.log('Resend email sent:', data);

    return data;
}