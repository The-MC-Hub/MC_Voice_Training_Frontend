import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/animate-ui/components/buttons/button";

const BookingManagement = ({ bookings }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">{t("admin.booking.title")}</h2>
          <p className="text-xs text-slate-400">{t("admin.booking.subtitle")}</p>
        </div>
        <Button className="h-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 text-xs font-semibold tracking-wider transition-all">
          {t("admin.booking.generateAuditReport")}
        </Button>
      </div>

      <div className="bg-[#0f172a] rounded-lg border border-slate-800 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <th className="p-4">{t("admin.booking.colReferenceId")}</th>
              <th className="p-4">{t("admin.booking.colClientTalentMapping")}</th>
              <th className="p-4">{t("admin.booking.colBookingDate")}</th>
              <th className="p-4">{t("admin.booking.colTotalAmount")}</th>
              <th className="p-4">{t("admin.booking.colStatus")}</th>
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
                    <span className="font-semibold text-slate-200">{t("admin.booking.clientLabel")}{b.client?.name || "Client"}</span>
                    <span className="text-[10px] text-slate-400">{t("admin.booking.talentLabel")}{b.mc?.name || "Talent"}</span>
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
                    b.status?.toLowerCase() === 'accepted' ? 'bg-[--bg-elevated] text-[--text-primary] border-[--border-subtle]' :
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
