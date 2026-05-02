'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Paperclip, FileText, Download, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Attachment {
  id: string
  file_name: string
  storage_path: string
  created_at: string
}

export function AttachmentList({ taskId, initialAttachments }: { taskId: string, initialAttachments: Attachment[] }) {
  const [attachments, setAttachments] = useState(initialAttachments)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const filePath = `attachments/${taskId}/${file.name}`
    
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file)

    if (uploadError) {
      toast.error('Failed to upload file')
      setIsUploading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single()

    const { data, error: dbError } = await supabase
      .from('attachments')
      .insert({
        task_id: taskId,
        uploaded_by: profile?.id,
        file_name: file.name,
        storage_path: filePath
      })
      .select()
      .single()

    if (dbError) {
      toast.error('Failed to save attachment info')
    } else {
      setAttachments([...attachments, data])
      toast.success('File uploaded')
    }
    setIsUploading(false)
  }

  const handleDownload = async (path: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from('attachments')
      .download(path)

    if (error) {
      toast.error('Failed to download file')
      return
    }

    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Attachments
        </h3>
        <div className="relative">
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <Button variant="outline" size="sm" disabled={isUploading}>
            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Paperclip className="w-4 h-4 mr-2" />}
            Upload
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No attachments.</p>
        ) : (
          attachments.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-2 rounded border bg-background group">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file.file_name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleDownload(file.storage_path, file.file_name)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
