import React from "react";

const BookingManagement = ({ bookings }) => {
  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Service Bookings Ledger</h2>
          <p className="text-xs text-slate-400">Monitor platform service level agreements and booking schedules.</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 text-xs font-semibold tracking-wider transition-all">
          Generate Audit Report
        </button>
      </div>

      <div className="bg-[#0f172a] rounded-lg border border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <th className="p-4">Reference ID</th>
              <th className="p-4">Client / Talent Mapping</th>
              <th className="p-4">Booking Date</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {bookings?.map(b => (
              <tr key={b._id} className="hover:bg-slate-900/30 transition-colors">
                <td className="p-4 font-mono text-[10px] text-slate-500 font-semibold">
                  #{b._id?.slice(-10).toUpperCase()}
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-200">Client: {b.client?.name || "Client"}</span>
                    <span className="text-[10px] text-slate-400">Talent: {b.mc?.name || "Talent"}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span>{new Date(b.eventDate).toLocaleDateString("vi-VN")}</span>
                </td>
                <td className="p-4 font-semibold text-white">
                  {b.price?.toLocaleString("vi-VN")} <span className="text-[10px] text-slate-500 font-normal">VND</span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    b.status?.toLowerCase() === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' : 
                    b.status?.toLowerCase() === 'pending' ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' :
                    b.status?.toLowerCase() === 'accepted' ? 'bg-blue-950/40 text-blue-400 border-blue-900/40' :
                    b.status?.toLowerCase() === 'cancelled' || b.status?.toLowerCase() === 'rejected' ? 'bg-red-950/40 text-red-400 border-red-900/40' :
                    'bg-slate-900 text-slate-500 border-slate-800'
                  }`}>
                    {b.status?.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingManagement;
