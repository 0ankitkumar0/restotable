import { NextResponse } from 'next/server';
import connectDB, { MenuItem } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

function formatMenuItem(doc) {
  const item = doc.toObject();
  if (item.category_id && typeof item.category_id === 'object') {
    item.category_name = item.category_id.name || 'Uncategorized';
    item.category_id = item.category_id.id ? item.category_id.id.toString() : (item.category_id._id ? item.category_id._id.toString() : null);
  }
  return item;
}

export async function GET(request) {
  const user = await getUserFromToken(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category');
  
  await connectDB();
  let query = {};
  if (categoryId) query.category_id = categoryId;
  
  const items = await MenuItem.find(query).populate('category_id').sort({ name: 1 });
  
  return NextResponse.json({ items: items.map(formatMenuItem) });
}

export async function POST(request) {
  const user = await getUserFromToken(request);
  console.log('User attempting to add menu item:', user?.email, 'Role:', user?.role);
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description, price, category_id, image_url, available } = await request.json();
  if (!name || price === undefined) return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });

  await connectDB();
  try {
    const newItem = await MenuItem.create({
      name, description: description || '', price, category_id: category_id || null, image_url: image_url || '', available: available !== undefined ? available : true
    });
    
    const populated = await MenuItem.findById(newItem._id).populate('category_id');
    return NextResponse.json({ item: formatMenuItem(populated) }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    // Return a more descriptive error if it's a validation error
    const message = error.name === 'ValidationError' 
      ? Object.values(error.errors).map(val => val.message).join(', ')
      : error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
