"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { CustomerReminder } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_PASSWORD = "grodan2025";

export default function AdminReminders() {
  const [reminders, setReminders] = useState<CustomerReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newReminder, setNewReminder] = useState({
    customer_name: "",
    email: "",
    phone: "",
    contract_type: "12_months" as "12_months" | "24_months" | "36_months" | "variable",
    contract_start_date: "",
    notes: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("admin_authed") === "true") setAuthed(true);
    }
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_reminders")
      .select("*")
      .order("reminder_date", { ascending: true });
    
    if (!error && data) {
      setReminders(data as CustomerReminder[]);
    } else {
      setError("Kunde inte hämta påminnelser: " + error?.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authed) return;
    fetchReminders();
  }, [authed]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem("admin_authed", "true");
      setError("");
    } else {
      setError("Felaktigt lösenord");
    }
  };

  const deleteReminder = async (id: number) => {
    if (!confirm("Är du säker på att du vill radera denna påminnelse?")) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("customer_reminders")
        .delete()
        .eq("id", id);
      
      if (error) {
        setError("Kunde inte radera påminnelse: " + error.message);
      } else {
        await fetchReminders();
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch {
      setError("Ett fel uppstod vid radering");
    } finally {
      setDeleting(false);
    }
  };

  const deleteSelected = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Är du säker på att du vill radera ${selectedItems.size} påminnelser?`)) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("customer_reminders")
        .delete()
        .in("id", Array.from(selectedItems));
      
      if (error) {
        setError("Kunde inte radera påminnelser: " + error.message);
      } else {
        await fetchReminders();
        setSelectedItems(new Set());
      }
    } catch {
      setError("Ett fel uppstod vid radering");
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedItems.size === reminders.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(reminders.map(r => r.id!)));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case '12_months': return '12 månader';
      case '24_months': return '24 månader';
      case '36_months': return '36 månader';
      case 'variable': return 'Rörligt';
      default: return type;
    }
  };

  const getStatusBadge = (isSent: boolean, reminderDate: string) => {
    const today = new Date();
    const reminderDateObj = new Date(reminderDate);
    
    if (isSent) {
      return <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Skickad</span>;
    } else if (reminderDateObj < today) {
      return <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Försenad</span>;
    } else {
      return <span style={{ color: 'orange', fontWeight: 'bold' }}>⏳ Väntar</span>;
    }
  };

  const calculateReminderDate = (contractStartDate: string, contractType: string): string => {
    const startDate = new Date(contractStartDate);
    const addMonthsKeepingEnd = (date: Date, monthsToAdd: number) => {
      const result = new Date(date);
      const originalDay = result.getDate();
      result.setMonth(result.getMonth() + monthsToAdd);
      if (result.getDate() < originalDay) {
        result.setDate(0);
      }
      return result;
    };
    const formatLocalYYYYMMDD = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    let totalMonths = 12;
    switch (contractType) {
      case '12_months': totalMonths = 12; break;
      case '24_months': totalMonths = 24; break;
      case '36_months': totalMonths = 36; break;
      default: throw new Error('Invalid contract type');
    }
    const reminderDate = addMonthsKeepingEnd(startDate, totalMonths - 11);
    return formatLocalYYYYMMDD(reminderDate);
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReminder.customer_name || !newReminder.email || !newReminder.contract_start_date) {
      setError("Fyll i alla obligatoriska fält");
      return;
    }

    setCreating(true);
    try {
      const reminderDate = calculateReminderDate(newReminder.contract_start_date, newReminder.contract_type);
      
      const reminderData = {
        customer_name: newReminder.customer_name,
        email: newReminder.email,
        phone: newReminder.phone || null,
        contract_type: newReminder.contract_type,
        contract_start_date: newReminder.contract_start_date,
        reminder_date: reminderDate,
        is_sent: false,
        notes: newReminder.notes || null
      };

      const { error } = await supabase
        .from("customer_reminders")
        .insert([reminderData]);

      if (error) {
        setError("Kunde inte skapa påminnelse: " + error.message);
      } else {
        await fetchReminders();
        setNewReminder({
          customer_name: "",
          email: "",
          phone: "",
          contract_type: "12_months",
          contract_start_date: "",
          notes: ""
        });
        setShowCreateForm(false);
        setError("");
      }
    } catch {
      setError("Ett fel uppstod vid skapande av påminnelse");
    } finally {
      setCreating(false);
    }
  };

  if (!authed) {
    return (
      <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
        <h1>Admin Login</h1>
        <form onSubmit={handleAuth}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Lösenord"
            style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
          />
          <button type="submit" style={{ width: '100%', padding: '0.5rem' }}>
            Logga in
          </button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Kundpåminnelser</h1>
        <div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{ 
              marginRight: '1rem', 
              padding: '0.5rem 1rem', 
              background: '#10b981', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showCreateForm ? 'Avbryt' : '➕ Skapa ny påminnelse'}
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_authed");
              setAuthed(false);
            }}
            style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logga ut
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div style={{ 
          padding: '1.5rem', 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Skapa ny påminnelse</h3>
          <form onSubmit={handleCreateReminder}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Kundnamn *
                </label>
                <input
                  type="text"
                  value={newReminder.customer_name}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, customer_name: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  E-post *
                </label>
                <input
                  type="email"
                  value={newReminder.email}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, email: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Telefon
                </label>
                <input
                  type="tel"
                  value={newReminder.phone}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, phone: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Avtalstyp *
                </label>
                <select
                  value={newReminder.contract_type}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, contract_type: e.target.value as "12_months" | "24_months" | "36_months" | "variable" }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  required
                >
                  <option value="12_months">12 månader</option>
                  <option value="24_months">24 månader</option>
                  <option value="36_months">36 månader</option>
                  <option value="variable">Rörligt</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Avtal startar *
                </label>
                <input
                  type="date"
                  value={newReminder.contract_start_date}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, contract_start_date: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}
                  required
                />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Anteckningar
              </label>
              <textarea
                value={newReminder.notes}
                onChange={(e) => setNewReminder(prev => ({ ...prev, notes: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px', minHeight: '80px' }}
                placeholder="Valfria anteckningar..."
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={creating}
                style={{ 
                  padding: '0.5rem 1rem', 
                  background: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  opacity: creating ? 0.6 : 1
                }}
              >
                {creating ? 'Skapar...' : 'Skapa påminnelse'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  background: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={fetchReminders}
          disabled={loading}
          style={{ marginRight: '1rem', padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Laddar...' : 'Uppdatera'}
        </button>
        
        {selectedItems.size > 0 && (
          <button
            onClick={deleteSelected}
            disabled={deleting}
            style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            {deleting ? 'Raderar...' : `Radera ${selectedItems.size} valda`}
          </button>
        )}
      </div>

      {loading ? (
        <p>Laddar påminnelser...</p>
      ) : reminders.length === 0 ? (
        <p>Inga påminnelser hittades.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.size === reminders.length}
                    onChange={toggleAll}
                  />
                </th>
                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Kund</th>
                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>E-post</th>
                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Telefon</th>
                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Avtalstyp</th>
                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Startdatum</th>
                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Påminnelse</th>
                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.75rem', border: '1px solid #e5e7eb', textAlign: 'left' }}>Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder) => (
                <tr key={reminder.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.has(reminder.id!)}
                      onChange={() => toggleSelection(reminder.id!)}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>{reminder.customer_name}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>{reminder.email}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>{reminder.phone || '-'}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>{getContractTypeLabel(reminder.contract_type)}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>{formatDate(reminder.contract_start_date)}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>{formatDate(reminder.reminder_date)}</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                    {getStatusBadge(reminder.is_sent, reminder.reminder_date)}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e5e7eb' }}>
                    <button
                      onClick={() => deleteReminder(reminder.id!)}
                      disabled={deleting}
                      style={{ padding: '0.25rem 0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.875rem' }}
                    >
                      Radera
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '4px' }}>
        <h3>Statistik</h3>
        <p>Totalt: {reminders.length} påminnelser</p>
        <p>Skickade: {reminders.filter(r => r.is_sent).length}</p>
        <p>Väntande: {reminders.filter(r => !r.is_sent && new Date(r.reminder_date) >= new Date()).length}</p>
        <p>Försenade: {reminders.filter(r => !r.is_sent && new Date(r.reminder_date) < new Date()).length}</p>
      </div>
    </div>
  );
}