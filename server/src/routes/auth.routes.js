import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { sendEmail } from '../lib/resend.js';

const router = Router();

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
}
function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalizedEmail, password: hashed },
  });

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  res.json({ token: signToken(user), user: publicUser(user) });
});
router.post('/forgot-password/request', async (req, res) => {
  const { email } = req.body || {};

  if (!email?.trim()) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Don't reveal whether an email has an account.
  if (!user) {
    return res.json({
      message: 'If an account exists with this email, an OTP has been sent.',
    });
  }

  // Generate a 6-digit OTP.
  const otp = crypto.randomInt(100000, 1000000).toString();

  // Hash the OTP before storing it.
  const otpHash = await bcrypt.hash(otp, 10);

  // OTP expires after 10 minutes.
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Remove any previous OTPs for this email.
  await prisma.passwordResetOtp.deleteMany({
    where: { email: normalizedEmail },
  });

  await prisma.passwordResetOtp.create({
    data: {
      email: normalizedEmail,
      otpHash,
      expiresAt,
    },
  });

  try {
    await sendEmail({
      to: normalizedEmail,
      subject: 'Your Otaku Store password reset OTP',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Otaku Store 🔐</h2>
        <p>You requested to reset your password.</p>
        <p>Your OTP is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 20px 0;
        ">
          ${otp}
        </div>

        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
    });
  } catch (error) {
    console.error('Password reset email failed:', error);

    // Remove the OTP because it was not delivered.
    await prisma.passwordResetOtp.deleteMany({
      where: { email: normalizedEmail },
    });

    return res.status(500).json({
      error: 'Unable to send the verification email. Please try again later.',
    });
  }

  res.json({
    message: 'If an account exists with this email, an OTP has been sent.',
  });
});
router.post('/forgot-password/verify', async (req, res) => {
  const { email, otp } = req.body || {};

  if (!email?.trim() || !otp?.trim()) {
    return res.status(400).json({
      error: 'Email and OTP are required.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const resetOtp = await prisma.passwordResetOtp.findFirst({
    where: {
      email: normalizedEmail,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!resetOtp) {
    return res.status(400).json({
      error: 'Invalid or expired OTP.',
    });
  }

  if (resetOtp.expiresAt < new Date()) {
    await prisma.passwordResetOtp.delete({
      where: { id: resetOtp.id },
    });

    return res.status(400).json({
      error: 'OTP has expired. Please request a new one.',
    });
  }

  const validOtp = await bcrypt.compare(otp.trim(), resetOtp.otpHash);

  if (!validOtp) {
    return res.status(400).json({
      error: 'Invalid or expired OTP.',
    });
  }

  // OTP is valid. Remove it so it cannot be used again.
  // OTP is valid. Generate a short-lived reset token.
  const resetToken = crypto.randomBytes(32).toString('hex');

  await prisma.passwordResetOtp.update({
    where: { id: resetOtp.id },
    data: {
      resetToken,
    },
  });

  res.json({
    message: 'OTP verified successfully.',
    resetToken,
  });
});
router.post('/forgot-password/reset', async (req, res) => {
  const { resetToken, newPassword } = req.body || {};

  if (!resetToken?.trim() || !newPassword) {
    return res.status(400).json({
      error: 'Reset token and new password are required.',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: 'Password must be at least 6 characters.',
    });
  }

  const resetOtp = await prisma.passwordResetOtp.findUnique({
    where: {
      resetToken: resetToken.trim(),
    },
  });

  if (!resetOtp) {
    return res.status(400).json({
      error: 'Invalid or expired reset token.',
    });
  }

  if (resetOtp.expiresAt < new Date()) {
    await prisma.passwordResetOtp.delete({
      where: { id: resetOtp.id },
    });

    return res.status(400).json({
      error: 'Reset token has expired. Please request a new OTP.',
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.findUnique({
    where: { email: resetOtp.email },
  });

  if (!user) {
    await prisma.passwordResetOtp.delete({
      where: { id: resetOtp.id },
    });

    return res.status(400).json({
      error: 'Unable to reset password.',
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
    },
  });

  // Make the reset token single-use.
  await prisma.passwordResetOtp.delete({
    where: { id: resetOtp.id },
  });

  res.json({
    message: 'Password reset successfully.',
  });
});
router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: publicUser(user) });
});

export default router;
