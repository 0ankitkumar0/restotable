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

export async function PUT(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  try {
    const data = await request.json();
    await connectDB();
    
    const updateData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role
    };

    if (data.password) {
      const bcryptjs = require('bcryptjs');
      updateData.password = await bcryptjs.hash(data.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update staff error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
