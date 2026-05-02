'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewMissionPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    campaign_id: '',
    owner_id: '',
    status: 'active',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
        const [campaignsRes, usersRes] = await Promise.all([
            supabase.from('campaigns').select('id, title'),
            supabase.from('profiles').select('id, full_name, email'),
        ]);
        setCampaigns(campaignsRes.data || []);
        setUsers(usersRes.data || []);
    }
    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Convert empty string to null for owner_id to satisfy foreign key constraint if left unassigned
    const insertData = {
      ...formData,
      owner_id: formData.owner_id === '' ? null : formData.owner_id
    };

    const { error } = await supabase
      .from('missions')
      .insert(insertData as any);

    if (error) {
      toast.error('Error: ' + error.message);
      setIsLoading(false);
    } else {
      toast.success('Mission created successfully');
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl bg-white rounded-lg border shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Create New Mission</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Mission Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Parent Campaign *</label>
          <select
            value={formData.campaign_id}
            onChange={(e) => setFormData({...formData, campaign_id: e.target.value})}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select campaign...</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Mission Owner (Team Lead)</label>
          <select
            value={formData.owner_id}
            onChange={(e) => setFormData({...formData, owner_id: e.target.value})}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Leave Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">The owner will have elevated privileges to manage tasks within this mission.</p>
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border rounded px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Initial Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Mission'}
          </button>
        </div>
      </form>
    </div>
  );
}
