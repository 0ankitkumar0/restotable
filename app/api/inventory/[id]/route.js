import { NextResponse } from 'next/server';
import connectDB, { Inventory } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const data = await request.json();
  
  await connectDB();
  const item = await Inventory.findByIdAndUpdate(id, data, { new: true });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json({ item });
}

export async function DELETE(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  await connectDB();
  await Inventory.findByIdAndDelete(id);
  
  return NextResponse.json({ success: true });
}
