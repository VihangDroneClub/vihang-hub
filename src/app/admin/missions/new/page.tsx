'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function NewMissionPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_id: '',
    owner_id: '',
    deadline: '',
    deliverables: '',
  });
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Fetch campaigns and users for dropdowns
    async function fetchData() {
        const [campaignsRes, usersRes] = await Promise.all([
            supabase.from('campaigns').select('id, name'),
            supabase.from('auth.users').select('id, email'), // 'name' column might not exist, use email
        ]);
        setCampaigns(campaignsRes.data || []);
        setUsers(usersRes.data || []);
    }
    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('missions')
      .insert(formData);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      router.push('/admin/missions');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl bg-white rounded-lg border">
      <h1 className="text-2xl font-bold mb-6">Create New Mission</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Mission Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Campaign *</label>
          <select
            value={formData.campaign_id}
            onChange={(e) => setFormData({...formData, campaign_id: e.target.value})}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select campaign...</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Owner *</label>
          <select
            value={formData.owner_id}
            onChange={(e) => setFormData({...formData, owner_id: e.target.value})}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select owner...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border rounded px-3 py-2 h-24"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Deliverables</label>
          <textarea
            value={formData.deliverables}
            onChange={(e) => setFormData({...formData, deliverables: e.target.value})}
            className="w-full border rounded px-3 py-2 h-24"
            placeholder="What needs to be delivered..."
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Deadline</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Mission
          </button>
        </div>
      </form>
    </div>
  );
}
