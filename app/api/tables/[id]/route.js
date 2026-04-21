import { NextResponse } from 'next/server';
import connectDB, { Table } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const data = await request.json();
  
  await connectDB();
  const table = await Table.findByIdAndUpdate(id, data, { new: true });
  if (!table) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json({ table });
}

export async function DELETE(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  await connectDB();
  await Table.findByIdAndDelete(id);
  
  return NextResponse.json({ success: true });
}
