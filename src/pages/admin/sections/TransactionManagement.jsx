import React from "react";
import { Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const TransactionManagement = ({ transactions }) => {
  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-white">System Transactions Ledger</h2>
          <p className="text-[12px] text-zinc-500 mt-0.5">Audit logs of all system-wide revenue segments and commission splits.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-[#111113] border border-white/[0.07] hover:border-white/[0.14] text-white rounded-xl text-[12px] font-medium transition-colors">
          <Download size={13} /> Export CSV
        </button>
      </div>

      <div className="bg-[#111113] border border-white/[0.07] rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse text-[12px]">
          <thead>
            <tr className="bg-[#09090b] border-b border-white/[0.06] text-zinc-500 uppercase text-[10px] font-semibold tracking-wider">
              <th className="px-4 py-3">Flow Type</th>
              <th className="px-4 py-3">Client / Talent</th>
              <th className="px-4 py-3">Gross Value</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Commission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-zinc-300">
            {transactions?.map((t, index) => (
              <tr key={t.id || t._id || index} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                      t.type?.toLowerCase() === 'refund'
                        ? 'bg-red-950/40 text-red-400 border-red-900/40'
                        : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40'
                    }`}>
                      {t.type?.toLowerCase() === 'refund' ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                    </div>
                    <span className="font-medium text-white">{t.type?.toUpperCase()}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-white block">C: {t.client?.name || 'Member'}</span>
                  <span className="text-[10px] text-zinc-500">M: {t.mc?.name || 'Ambassador'}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-white">
                  {t.amount?.toLocaleString("vi-VN")} <span className="text-[10px] text-zinc-500 font-normal">VND</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                    t.status?.toLowerCase() === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40' :
                    t.status?.toLowerCase() === 'pending'   ? 'bg-amber-950/40 text-amber-400 border-amber-900/40' :
                    t.status?.toLowerCase() === 'failed'    ? 'bg-red-950/40 text-red-400 border-red-900/40' :
                    'bg-[#09090b] text-zinc-500 border-white/[0.06]'
                  }`}>
                    {t.status?.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-blue-400">
                  {(t.platformFee || t.amount * 0.2).toLocaleString("vi-VN")} <span className="text-[10px] text-zinc-500 font-normal">VND</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionManagement;
