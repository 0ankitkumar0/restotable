import { NextResponse } from 'next/server';
import connectDB, { Order, Table } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

function formatOrder(doc) {
  const order = doc.toObject();
  if (order.table_id && order.table_id.table_number) {
    order.table_number = order.table_id.table_number;
    order.table_id = (order.table_id._id || order.table_id.id).toString();
  }
  
  if (order.items) {
    order.items = order.items.map(item => {
      if (item.menu_item_id && item.menu_item_id.name) {
        item.item_name = item.menu_item_id.name;
        item.menu_item_id = (item.menu_item_id._id || item.menu_item_id.id).toString();
      }
      return item;
    });
  }
  
  return order;
}

export async function PUT(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { status } = await request.json();
  
  await connectDB();
  
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
    .populate('table_id')
    .populate('items.menu_item_id');
    
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  if (status === 'completed' || status === 'cancelled') {
    if (order.table_id) {
      await Table.findByIdAndUpdate(order.table_id._id || order.table_id, { status: 'available' });
    }
  }

  return NextResponse.json({ order: formatOrder(order) });
}

export async function DELETE(request, { params }) {
  const user = await getUserFromToken(request);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  await connectDB();
  const order = await Order.findById(id);
  
  if (order && order.table_id) {
    await Table.findByIdAndUpdate(order.table_id, { status: 'available' });
  }
  
  await Order.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
