'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NewCampaignPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('campaigns')
      .insert({
        ...formData,
        created_by: user?.id,
      } as any);

    if (error) {
      toast.error('Error: ' + error.message);
      setIsLoading(false);
    } else {
      toast.success('Campaign created successfully');
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="container mx-auto max-w-2xl bg-white rounded-lg border p-6 shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Campaign Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border rounded px-3 py-2 h-32 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Describe the overarching goals of this campaign..."
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
            {isLoading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
