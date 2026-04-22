import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import connectDB, { User } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'restotable-secret-key-2024';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function authenticateUser(email, password) {
  await connectDB();
  const user = await User.findOne({ email }).select('+password');
  if (!user) return null;
  
  const valid = bcryptjs.compareSync(password, user.password);
  if (!valid) return null;
  
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
}

export async function getUserFromToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  await connectDB();
  const user = await User.findById(decoded.id).select('-password');
  return user;
}
