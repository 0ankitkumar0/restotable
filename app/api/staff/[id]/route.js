import { NextResponse } from 'next/server';
import connectDB, { User } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

export async function DELETE(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (id === user.id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });

  await connectDB();
  await User.findByIdAndDelete(id);
  
  return NextResponse.json({ success: true });
}
