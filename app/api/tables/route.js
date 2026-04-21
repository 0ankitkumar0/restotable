import { NextResponse } from 'next/server';
import connectDB, { Table } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request) {
  const user = await getUserFromToken(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const tables = await Table.find().sort({ table_number: 1 });
  return NextResponse.json({ tables });
}

export async function POST(request) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { table_number, seats } = await request.json();
  if (!table_number) return NextResponse.json({ error: 'Table number is required' }, { status: 400 });

  await connectDB();
  const existing = await Table.findOne({ table_number });
  if (existing) return NextResponse.json({ error: 'Table number already exists' }, { status: 409 });

  const table = await Table.create({ table_number, seats: seats || 4 });
  
  const qrCode = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/menu/${table._id}`;
  table.qr_code = qrCode;
  await table.save();
  
  return NextResponse.json({ table }, { status: 201 });
}
