import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { EmailLog } from '../models/EmailLog.js';
import nodemailer from 'nodemailer';

export const sendEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { to, cc, bcc, subject, body, attachments } = req.body;

    if (!to || !Array.isArray(to) || to.length === 0 || !subject || !body) {
      res.status(400).json({ success: false, message: 'Recipient list, subject, and body are required.' });
      return;
    }

    // Check if real SMTP is configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    let isSent = false;
    let providerId = undefined;
    let errorMsg = undefined;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass }
        });

        const info = await transporter.sendMail({
          from: `"UniSync CSE - ${req.user!.fullName}" <${smtpUser}>`,
          to: to.join(', '),
          cc: cc && cc.length ? cc.join(', ') : undefined,
          bcc: bcc && bcc.length ? bcc.join(', ') : undefined,
          subject,
          text: body,
          html: `<div style="font-family:sans-serif;line-height:1.6;color:#24232B;">
            <p>${body.replace(/\n/g, '<br/>')}</p>
            <hr style="border:none;border-top:1px solid #E6E8ED;margin-top:24px;margin-bottom:12px;"/>
            <p style="font-size:12px;color:#737784;">Sent via UniSync CSE Collaboration Platform | Anurag University</p>
          </div>`
        });
        isSent = true;
        providerId = info.messageId;
      } catch (err: any) {
        errorMsg = err.message || 'SMTP delivery failed.';
      }
    } else {
      // In development / demo when SMTP not configured, simulate log recording
      isSent = true;
      providerId = `simulated-${Date.now()}@anurag.edu.in`;
    }

    const emailLog = await EmailLog.create({
      senderId: req.user!._id,
      to,
      cc: cc || [],
      bcc: bcc || [],
      subject,
      body,
      attachments: attachments || [],
      status: isSent ? 'SENT' : 'FAILED',
      providerMessageId: providerId,
      errorMessage: errorMsg
    });

    res.status(isSent ? 200 : 500).json({
      success: isSent,
      message: isSent
        ? 'Email dispatched successfully.'
        : `Email delivery failed: ${errorMsg}`,
      data: emailLog
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSentEmails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await EmailLog.find({ senderId: req.user!._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
