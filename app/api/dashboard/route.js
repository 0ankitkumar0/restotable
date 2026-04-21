import { NextResponse } from 'next/server';
import connectDB, { Order, MenuItem, Table, Inventory } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request) {
  const user = await getUserFromToken(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    completedOrders,
    totalMenuItems,
    totalTables,
    activeOrders,
    occupiedTables,
    todayOrders,
    todayCompletedOrders,
    recentOrders,
    ordersByStatus,
    lowStock,
    revenueByDay
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
    MenuItem.countDocuments(),
    Table.countDocuments(),
    Order.countDocuments({ status: { $in: ['pending', 'preparing', 'ready'] } }),
    Table.countDocuments({ status: 'occupied' }),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: today } } },
      { $group: { _id: null, sum: { $sum: '$total' } } }
    ]),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('table_id'),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Inventory.find({ $expr: { $lte: ['$quantity', '$low_stock_threshold'] } }),
    Order.aggregate([
      { 
        $match: { 
          status: 'completed', 
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1 } }
    ])
  ]);

  return NextResponse.json({
    stats: {
      totalOrders,
      totalRevenue: completedOrders[0]?.sum || 0,
      totalMenuItems,
      totalTables,
      activeOrders,
      occupiedTables,
      todayOrders,
      todayRevenue: todayCompletedOrders[0]?.sum || 0,
    },
    recentOrders: recentOrders.map(doc => {
      const order = doc.toObject();
      if (order.table_id && order.table_id.table_number) {
        order.table_number = order.table_id.table_number;
        order.table_id = order.table_id._id.toString();
      }
      return order;
    }),
    ordersByStatus: ordersByStatus.map(s => ({ status: s._id, count: s.count })),
    lowStock,
    revenueByDay
  });
}
