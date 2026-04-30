import { NextResponse } from 'next/server';
import connectDB, { Order, Table, MenuItem } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { table_id, customer_name, customer_phone, items, notes } = await request.json();
    if (!items || items.length === 0) return NextResponse.json({ error: 'Items are required' }, { status: 400 });
    if (!customer_name || !customer_phone) return NextResponse.json({ error: 'Name and phone number are required' }, { status: 400 });

    await connectDB();
    
    const table = await Table.findById(table_id);
    if (!table) return NextResponse.json({ error: 'Table not found' }, { status: 404 });

    let total = 0;
    const processedItems = [];
    
    for (const item of items) {
      const menuItem = await MenuItem.findOne({ _id: item.menu_item_id, available: true });
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

    if (processedItems.length === 0) return NextResponse.json({ error: 'No valid items found' }, { status: 400 });

    const status = customer_phone === '__waiter__' ? 'pending' : 'pending_approval';
    const orderNotes = customer_phone !== '__waiter__' ? `📞 ${customer_phone}${notes ? ' | ' + notes : ''}` : (notes || '');

    const newOrder = await Order.create({
      table_id,
      customer_name,
      total,
      notes: orderNotes,
      order_type: 'dine-in',
      status,
      items: processedItems
    });

    await Table.findByIdAndUpdate(table_id, { status: 'occupied' });

    const populated = await Order.findById(newOrder._id).populate('table_id').populate('items.menu_item_id');
    
    const formattedOrder = populated.toObject();
    if (formattedOrder.table_id && formattedOrder.table_id.table_number) {
      formattedOrder.table_number = formattedOrder.table_id.table_number;
      formattedOrder.table_id = (formattedOrder.table_id._id || formattedOrder.table_id.id).toString();
    }
    
    if (formattedOrder.items) {
      formattedOrder.items = formattedOrder.items.map(item => {
        if (item.menu_item_id && item.menu_item_id.name) {
          item.item_name = item.menu_item_id.name;
          item.menu_item_id = (item.menu_item_id._id || item.menu_item_id.id).toString();
        }
        return item;
      });
    }

    return NextResponse.json({ order: formattedOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
