import { NextResponse } from 'next/server';
import connectDB, { Invoice } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const invoices = await Invoice.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ invoices });
}

export async function POST(request) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  await connectDB();
  
  // Generate a unique invoice number
  const count = await Invoice.countDocuments();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  
  const newInvoice = new Invoice({ ...body, invoiceNumber });
  await newInvoice.save();
  
  return NextResponse.json({ invoice: newInvoice }, { status: 201 });
}
