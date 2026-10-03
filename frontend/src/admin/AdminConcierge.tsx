import React, { useEffect, useState } from "react";
import { MessageSquare, Phone, Mail, CheckCircle2, Clock, Calendar, ExternalLink, Filter } from "lucide-react";
import adminService from "../services/adminService";

export default function AdminConcierge() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const res: any = await adminService.getConciergeLeads();
      setLeads(res?.leads || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminService.updateConciergeStatus(id, newStatus);
      loadLeads();
      if (selectedLead && selectedLead._id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (err: any) {
      alert("Status update failed: " + err?.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">VIP Concierge & Bespoke Inquiries</h1>
        <p className="text-xs text-slate-500 mt-1">
          Private scent consultations, bespoke wedding flacons, and VIP sampling appointments
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Patron Name</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Consultation Type</th>
                <th className="py-4 px-4">Preferred Time</th>
                <th className="py-4 px-4">Pipeline Status</th>
                <th className="py-4 px-6 text-right">Instant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading VIP inquiries...</td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">No VIP inquiries found.</td>
                </tr>
              ) : (
                leads.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{l.name || l.fullName}</div>
                      <div className="text-[10px] text-slate-400">{l.city || "Dubai / London"}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium">{l.phone}</div>
                      <div className="text-[10px] text-slate-400">{l.email}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800">
                      {l.consultationType || l.topic || "Bespoke Royal Attar"}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {l.preferredDate ? new Date(l.preferredDate).toLocaleDateString() : "Immediate"} ({l.preferredTime || "Evening"})
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={l.status || "new"}
                        onChange={(e) => handleStatusChange(l._id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-800"
                      >
                        <option value="new">New Lead</option>
                        <option value="contacted">Contacted</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        {l.phone && (
                          <a
                            href={`https://wa.me/${l.phone.replace(/[^0-9]/g, "")}?text=Greetings%20from%20Spirit%20of%20Arabian%20Atelier...`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
