import { NextResponse } from 'next/server';
import connectDB, { Category } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request) {
  const user = await getUserFromToken(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const categories = await Category.find().sort({ sort_order: 1, name: 1 });
  return NextResponse.json({ categories });
}

export async function POST(request) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description } = await request.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  await connectDB();
  const maxCategory = await Category.findOne().sort({ sort_order: -1 });
  const sortOrder = (maxCategory?.sort_order || 0) + 1;

  const category = await Category.create({ name, description: description || '', sort_order: sortOrder });
  return NextResponse.json({ category }, { status: 201 });
}
