import { NextResponse } from 'next/server';
import connectDB, { Table, MenuItem, Category } from '@/lib/mongodb';

export async function GET(request, { params }) {
  const { tableId } = await params;
  
  await connectDB();
  let table;
  try {
    table = await Table.findById(tableId);
  } catch (err) {
    console.error('Error finding table by ID:', tableId, err.message);
    return NextResponse.json({ error: 'Invalid Table ID format' }, { status: 400 });
  }
  
  if (!table) return NextResponse.json({ error: 'Table not found' }, { status: 404 });
  
  const rawItems = await MenuItem.find({ available: true }).populate('category_id');
  const items = rawItems.map(doc => {
    const item = doc.toObject();
    if (item.category_id && typeof item.category_id === 'object') {
      item.category_name = item.category_id.name || 'Uncategorized';
      item.category_id = item.category_id.id ? item.category_id.id.toString() : (item.category_id._id ? item.category_id._id.toString() : null);
    }
    return item;
  });

  items.sort((a, b) => {
    const aOrder = rawItems.find(i => i._id.toString() === a.id)?.category_id?.sort_order || 0;
    const bOrder = rawItems.find(i => i._id.toString() === b.id)?.category_id?.sort_order || 0;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });
  
  const categories = await Category.find().sort({ sort_order: 1, name: 1 });
  
  return NextResponse.json({ table, items, categories });
}
