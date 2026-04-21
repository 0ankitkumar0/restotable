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
  const { orderId } = await params;
  
  await connectDB();
  const order = await Order.findById(orderId).populate('table_id').populate('items.menu_item_id');
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  
  return NextResponse.json({ order: formatOrder(order) });
}
