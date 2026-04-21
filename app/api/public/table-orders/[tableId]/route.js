import { NextResponse } from 'next/server';
import connectDB, { Order } from '@/lib/mongodb';

function formatOrder(doc) {
  const order = doc.toObject();
  if (order.table_id && order.table_id.table_number) {
    order.table_number = order.table_id.table_number;
    order.table_id = order.table_id._id.toString();
  }
  
  if (order.items) {
    order.items = order.items.map(item => {
      if (item.menu_item_id && item.menu_item_id.name) {
        item.item_name = item.menu_item_id.name;
        item.menu_item_id = item.menu_item_id._id.toString();
      }
      return item;
    });
  }
  
  return order;
}

export async function GET(request, { params }) {
  const { tableId } = await params;
  
  await connectDB();
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const orders = await Order.find({
    table_id: tableId,
    $or: [
      { status: { $nin: ['completed', 'cancelled'] } },
      { status: 'cancelled', updatedAt: { $gte: oneHourAgo } }
    ]
  }).sort({ createdAt: -1 }).populate('table_id').populate('items.menu_item_id');
  
  return NextResponse.json({ orders: orders.map(formatOrder) });
}
