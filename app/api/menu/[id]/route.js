import { NextResponse } from 'next/server';
import connectDB, { MenuItem } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

function formatMenuItem(doc) {
  const item = doc.toObject();
  if (item.category_id && item.category_id.name) {
    item.category_name = item.category_id.name;
    item.category_id = item.category_id._id.toString();
  }
  return item;
}

export async function PUT(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const data = await request.json();
  
  await connectDB();
  const item = await MenuItem.findByIdAndUpdate(id, data, { new: true }).populate('category_id');
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json({ item: formatMenuItem(item) });
}

export async function DELETE(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  await connectDB();
  await MenuItem.findByIdAndDelete(id);
  
  return NextResponse.json({ success: true });
}
