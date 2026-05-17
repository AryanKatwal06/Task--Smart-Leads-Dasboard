import nodemailer, { Transporter } from 'nodemailer';
import { logger } from './logger';

let transporter: Transporter | null = null;

function isPlaceholderCredential(value?: string) {
  if (!value) {
    return true;
  }

  return /^your_|placeholder|changeme/i.test(value.trim());
}

export async function initEmailService() {
  try {
    const emailHost = process.env.EMAIL_HOST || 'localhost';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD;

    if (isPlaceholderCredential(emailUser) || isPlaceholderCredential(emailPass)) {
      logger.warn('Email service disabled: SMTP credentials are not configured');
      return;
    }

    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    logger.info('Email service initialized');
  } catch (err) {
    logger.warn('Email service unavailable, continuing without outbound email', err);
    transporter = null;
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    if (!transporter) {
      logger.warn('Email service not available, skipping send');
      return;
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@smartleads.com',
      to,
      subject,
      text: text || 'Email notification',
      html
    });

    logger.info('Email sent', { to, subject, messageId: info.messageId });
    return info;
  } catch (err) {
    logger.error('Failed to send email', err);
    throw err;
  }
}

export default { initEmailService, sendEmail };
