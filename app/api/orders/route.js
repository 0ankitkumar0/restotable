import { NextResponse } from 'next/server';
import connectDB, { Order, MenuItem, Table } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

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

export async function GET(request) {
  const user = await getUserFromToken(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  
  await connectDB();
  let query = {};
  if (status) query.status = status;
  
  const orders = await Order.find(query)
    .populate('table_id')
    .populate('items.menu_item_id')
    .sort({ createdAt: -1 });
    
  return NextResponse.json({ orders: orders.map(formatOrder) });
}

export async function POST(request) {
  const { table_id, customer_name, items, notes, order_type } = await request.json();
  if (!items || items.length === 0) return NextResponse.json({ error: 'Items are required' }, { status: 400 });

  await connectDB();
  
  let total = 0;
  const processedItems = [];
  
  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menu_item_id);
    if (menuItem) {
      total += menuItem.price * item.quantity;
      processedItems.push({
        menu_item_id: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes || ''
      });
    }
  }

  const orderData = {
    customer_name: customer_name || 'Guest',
    total,
    notes: notes || '',
    order_type: order_type || 'dine-in',
    items: processedItems
  };

  if (table_id) {
    orderData.table_id = table_id;
    await Table.findByIdAndUpdate(table_id, { status: 'occupied' });
  }

  const newOrder = await Order.create(orderData);
  const populated = await Order.findById(newOrder._id).populate('table_id').populate('items.menu_item_id');
  
  return NextResponse.json({ order: formatOrder(populated) }, { status: 201 });
}
