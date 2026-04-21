'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function WaiterTablesPage() {
  const { authFetch } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTables(); }, []);

  async function loadTables() {
    setLoading(true);
    try {
      const res = await authFetch('/api/tables');
      if (res.ok) { const d = await res.json(); setTables(d.tables || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-10 h-10 border-4 border-[#e2e8f0] border-t-[#c0392b] rounded-full animate-spin"></div>
    </div>
  );

  const available = tables.filter(t => t.status === 'available');
  const occupied = tables.filter(t => t.status === 'occupied');

  return (
    <>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1a2e] leading-tight">Select a Table</h1>
          <p className="text-[15px] text-[#64748b] mt-1">Choose a table to take an order from.</p>
        </div>
      </div>

      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center text-[#94a3b8]">
          <div className="text-4xl mb-4">🪑</div>
          <h3 className="text-lg font-bold text-[#1a1a2e] mb-1">No tables configured</h3>
          <p className="text-sm">Ask your admin to add tables first.</p>
        </div>
      ) : (
        <>
          {/* Available Tables */}
          {available.length > 0 && (
            <>
              <h3 className="text-base font-semibold mb-4 text-emerald-600">
                🟢 Available ({available.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
                {available.map(table => (
                  <div 
                    className="bg-white border-2 border-transparent rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-[#c0392b]" 
                    key={table.id || table._id}
                    onClick={() => router.push(`/waiter/order/${table.id || table._id}`)}
                  >
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-2xl mb-3">🪑</div>
                    <h4 className="text-lg font-bold text-[#1a1a2e] mb-1">Table {table.table_number}</h4>
                    <div className="text-[13px] text-[#64748b] mb-3">{table.seats} seats</div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none capitalize bg-emerald-100 text-emerald-700">Available</span>
                    <div className="mt-4 w-full">
                      <button className="w-full px-4 py-2 bg-[#c0392b] text-white rounded-lg text-sm font-semibold hover:bg-[#a93226] transition-colors shadow-sm">Take Order →</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Occupied Tables */}
          {occupied.length > 0 && (
            <>
              <h3 className="text-base font-semibold mb-4 text-amber-600">
                🟡 Occupied ({occupied.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {occupied.map(table => (
                  <div 
                    className="bg-white border-2 border-transparent rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-amber-400" 
                    key={table.id || table._id}
                    onClick={() => router.push(`/waiter/order/${table.id || table._id}`)}
                  >
                    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-2xl mb-3">🪑</div>
                    <h4 className="text-lg font-bold text-[#1a1a2e] mb-1">Table {table.table_number}</h4>
                    <div className="text-[13px] text-[#64748b] mb-3">{table.seats} seats</div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold leading-none capitalize bg-amber-100 text-amber-700">Occupied</span>
                    <div className="mt-4 w-full">
                      <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors shadow-sm">Add Items →</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
