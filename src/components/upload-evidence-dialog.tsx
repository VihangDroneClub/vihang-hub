'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function UploadEvidenceDialog({ 
  taskId, 
  onClose 
}: { 
  taskId: string; 
  onClose: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Upload files to Supabase Storage
      const uploadedUrls: string[] = [];
      
      for (const file of files) {
        const fileName = `${taskId}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('evidence')
          .upload(fileName, file);

        if (error) throw error;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('evidence')
          .getPublicUrl(fileName);
        
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // Update task with evidence and mark completed
      const { error: updateError } = await (supabase.from('tasks') as any)
        .update({
          status: 'completed',
          evidence_photos: uploadedUrls,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      toast.success('Task marked as complete!');
      router.refresh();
      onClose();
    } catch (error: any) {
      toast.error('Error uploading: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Upload Evidence</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Photos/Screenshots *
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="w-full border rounded px-3 py-2"
              required
            />
            {files.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {files.length} file(s) selected
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Any additional context..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
            ⚠️ Marking as complete requires proof of work (photos/videos/files)
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Mark Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
