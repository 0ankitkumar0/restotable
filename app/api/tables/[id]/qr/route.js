import { NextResponse } from 'next/server';
import connectDB, { Table } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import QRCode from 'qrcode';

export async function GET(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  await connectDB();
  const table = await Table.findById(id);
  if (!table) return NextResponse.json({ error: 'Table not found' }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const menuUrl = `${baseUrl}/menu/${id}`;
  
  const qrDataUrl = await QRCode.toDataURL(menuUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });

  return NextResponse.json({ qr: qrDataUrl, url: menuUrl, table });
}
