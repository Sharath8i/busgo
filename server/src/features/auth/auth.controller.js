import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.model.js';
import {
  signAccessToken,
  signRefreshToken,
  hashRefreshToken,
} from '../../utils/generateToken.js';
import { sendEmail } from '../../utils/sendEmail.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

const SALT = 12;
const OTP_TTL_MS = 10 * 60 * 1000;
const LOCK_MINUTES = 30;
const MAX_ATTEMPTS = 5;

const passwordStrong = (pwd) =>
  typeof pwd === 'string' &&
  pwd.length >= 8 &&
  /[A-Z]/.test(pwd) &&
  /[0-9]/.test(pwd) &&
  /[^A-Za-z0-9]/.test(pwd);

const randomOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const cookieOpts = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});

const publicUser = (u) => ({
  id: u._id,
  fullName: u.fullName,
  email: u.email,
  phone: u.phone,
  role: u.role,
  isVerified: u.isVerified,
  walletBalance: u.walletBalance || 0,
});

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, role } = req.body;
  if (!passwordStrong(password)) {
    return res.status(400).json({
      message:
        'Password must be 8+ chars with uppercase, number, and special character',
    });
  }
  const existing = await User.findOne({ $or: [{ email }, { phone }] });
  if (existing) {
    return res.status(409).json({ message: 'Email or phone already registered' });
  }
  const passwordHash = await bcrypt.hash(password, SALT);
  const otp = randomOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  const user = await User.create({
    fullName,
    email,
    phone,
    passwordHash,
    role: 'passenger',
    status: 'approved',
    isVerified: false,
    otp: { code: otp, expiresAt },
  });
  try {
    await sendEmail({
      to: email,
      subject: 'BusGo — verify your email',
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    });
  } catch (err) {
    console.error('[email] Error sending verification email:', err.message);
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
  }
  res.status(201).json({
    message: 'Registered. Verify OTP sent to your email.',
    email: user.email,
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user || !user.otp?.code) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  if (user.otp.expiresAt < new Date()) {
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (user.otp.code !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
  user.isVerified = true;
  user.otp = undefined;
  await user.save();
  res.json({ message: 'Email verified. You can log in.' });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (user.lockUntil && user.lockUntil > new Date()) {
    return res.status(423).json({ message: 'Account locked. Try again later.' });
  }
  if (!user.isVerified) {
    return res.status(403).json({ message: 'Verify your email before login' });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: 'Account disabled' });
  }

  // Operator Approval Gate
  if (user.role === 'operator' && user.status !== 'approved') {
    return res.status(403).json({ message: 'Operator account pending approval.' });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ userId: user._id.toString() });
  user.refreshTokenHash = hashRefreshToken(refreshToken);
  await user.save();
  res.cookie('refreshToken', refreshToken, cookieOpts());
  res.json({
    user: publicUser(user),
    accessToken,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'No refresh token' });
  }
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  const user = await User.findById(payload.userId);
  if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashRefreshToken(token)) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
  const accessPayload = { userId: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(accessPayload);
  res.json({ user: publicUser(user), accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
  }
  res.clearCookie('refreshToken', { path: '/' });
  res.json({ message: 'Logged out' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) {
    return res.json({ message: 'If the email exists, an OTP was sent.' });
  }
  const otp = randomOtp();
  user.otp = { code: otp, expiresAt: new Date(Date.now() + OTP_TTL_MS) };
  await user.save();
  try {
    await sendEmail({
      to: user.email,
      subject: 'BusGo — password reset OTP',
      html: `<p>Your reset OTP is <strong>${otp}</strong>. Valid 10 minutes.</p>`,
    });
  } catch (err) {
    console.error('[email] Error sending password reset email:', err.message);
    console.log(`[DEV MODE] Reset OTP for ${user.email}: ${otp}`);
  }
  res.json({ message: 'If the email exists, an OTP was sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!passwordStrong(newPassword)) {
    return res.status(400).json({
      message:
        'Password must be 8+ chars with uppercase, number, and special character',
    });
  }
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user?.otp?.code || user.otp.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }
  if (user.otp.code !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
  user.passwordHash = await bcrypt.hash(newPassword, SALT);
  user.otp = undefined;
  user.refreshTokenHash = undefined;
  await user.save();
  res.json({ message: 'Password updated. Log in again.' });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;
  await user.save();
  
  res.json({ message: 'Profile updated', user: publicUser(user) });
});
