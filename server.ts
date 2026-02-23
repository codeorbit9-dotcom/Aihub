import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for verification codes
// Key: email, Value: { code, expiresAt }
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'auth.aiguardian@gmail.com',
    pass: 'rlqkpwlsocezfgpe',
  },
});

// API Routes
app.post('/api/send-verification', async (req, res) => {
  const { email, type } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  verificationCodes.set(email, { code, expiresAt });

  const subject = type === 'reset' ? 'Password Reset Code - AIGuardian Hub' : 'Verify your email - AIGuardian Hub';
  const text = `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`;

  try {
    await transporter.sendMail({
      from: '"AIGuardian Hub" <auth.aiguardian@gmail.com>',
      to: email,
      subject,
      text,
    });
    res.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const record = verificationCodes.get(email);
  if (!record) {
    return res.status(400).json({ error: 'No verification code found for this email' });
  }

  if (Date.now() > record.expiresAt) {
    verificationCodes.delete(email);
    return res.status(400).json({ error: 'Verification code has expired' });
  }

  if (record.code !== code) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  // Code is valid, remove it
  verificationCodes.delete(email);
  res.json({ success: true, message: 'Code verified successfully' });
});

// For password reset, we need to update the user's password.
// Since we don't have Firebase Admin configured by default, we'll provide an endpoint
// that would ideally use Firebase Admin to update the password.
// In this preview, we will just return success so the client can show a message.
app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  // In a real app, you would use firebase-admin here:
  // await admin.auth().updateUserByEmail(email, { password: newPassword });
  
  // For now, we just return success
  res.json({ success: true, message: 'Password updated successfully (Mocked without Admin SDK)' });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
