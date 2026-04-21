import { NextResponse } from 'next/server';
import connectDB, { Category, MenuItem } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const data = await request.json();
  
  await connectDB();
  const category = await Category.findByIdAndUpdate(id, data, { new: true });
  if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json({ category });
}

export async function DELETE(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  await connectDB();
  await MenuItem.updateMany({ category_id: id }, { category_id: null });
  await Category.findByIdAndDelete(id);
  
  return NextResponse.json({ success: true });
}
