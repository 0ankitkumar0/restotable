import { NextResponse } from 'next/server';
import connectDB, { Inventory } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const inventory = await Inventory.find().sort({ name: 1 });
  return NextResponse.json({ inventory });
}

export async function POST(request) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, quantity, unit, low_stock_threshold, cost_per_unit } = await request.json();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  await connectDB();
  const item = await Inventory.create({
    name, 
    quantity: quantity || 0, 
    unit: unit || 'pcs', 
    low_stock_threshold: low_stock_threshold || 10, 
    cost_per_unit: cost_per_unit || 0
  });

  return NextResponse.json({ item }, { status: 201 });
}
