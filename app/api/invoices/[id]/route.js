import { NextResponse } from 'next/server';
import connectDB, { Invoice } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  
  const invoice = await Invoice.findById(id);
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json({ invoice });
}

export async function PUT(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  
  await connectDB();
  const invoice = await Invoice.findByIdAndUpdate(id, body, { new: true });
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  return NextResponse.json({ invoice });
}

export async function DELETE(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  
  await Invoice.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
