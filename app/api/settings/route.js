import { NextResponse } from 'next/server';
import connectDB, { Settings } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const settings = await Settings.findOne({});
  return NextResponse.json({ settings: settings || {} });
}

export async function PUT(request) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  await connectDB();
  
  const settings = await Settings.findOneAndUpdate({}, body, { new: true, upsert: true });
  return NextResponse.json({ settings });
}
