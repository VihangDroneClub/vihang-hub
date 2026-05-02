'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { Send, Trash2, Loader2 } from 'lucide-react'
import { useRealtimeComments } from '@/lib/hooks/useRealtimeComments'
import { postComment, deleteComment } from '@/lib/actions/comments'

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

export function CommentThread({ 
  taskId, 
  initialComments, 
  isAdmin 
}: { 
  taskId: string, 
  initialComments: Comment[], 
  isAdmin: boolean 
}) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useRealtimeComments(taskId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await postComment(taskId, newComment)
      setNewComment('')
      toast.success('Comment posted')
    } catch (e) {
      const error = e as Error;
      toast.error(error instanceof Error ? error.message : 'Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    setDeletingId(commentId)
    try {
      await deleteComment(commentId, taskId)
      toast.success('Comment deleted')
    } catch (e) {
      const error = e as Error;
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-1 space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="group flex gap-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.profiles?.avatar_url || ''} />
              <AvatarFallback>{comment.profiles?.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{comment.profiles?.full_name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
                    disabled={deletingId === comment.id}
                  >
                    {deletingId === comment.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
        {initialComments.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-10">
            No comments yet. Start the conversation!
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 pt-6 border-t">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] bg-background text-sm"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Post Comment
          </Button>
        </div>
      </form>
    </div>
  )
}
