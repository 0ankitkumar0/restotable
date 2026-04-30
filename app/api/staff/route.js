import { NextResponse } from 'next/server';
import connectDB, { User } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import bcryptjs from 'bcryptjs';

export async function GET(request) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const staff = await User.find().select('-password').sort({ createdAt: -1 });
  return NextResponse.json({ staff });
}

export async function POST(request) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, email, phone, password, role } = await request.json();
  if (!name || !email || !password) return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });

  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

  const hashedPassword = bcryptjs.hashSync(password, 10);
  const member = await User.create({ name, email, phone, password: hashedPassword, role: role || 'waiter' });
  
  const safeMember = member.toObject();
  delete safeMember.password;
  
  return NextResponse.json({ staff: safeMember }, { status: 201 });
}
