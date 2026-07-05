import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Attachment {
  id: string;
  task_id: string;
  user_id: string;
  type: 'file' | 'image' | 'link';
  name: string;
  url: string | null;
  storage_path: string | null;
  size: number | null;
  created_at: string;
}

export function useAttachments(taskId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: attachments, isLoading, error } = useQuery({
    queryKey: ['attachments', taskId],
    queryFn: async () => {
      if (!user || !taskId) return [];
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Attachment[];
    },
    enabled: !!user && !!taskId,
  });

  const uploadFileMutation = useMutation({
    mutationFn: async ({ file, taskId }: { file: File; taskId: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${taskId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const type = file.type.startsWith('image/') ? 'image' : 'file';

      const { data, error: dbError } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          type,
          name: file.name,
          storage_path: filePath,
          size: file.size
        })
        .select()
        .single();

      if (dbError) {
        // Rollback storage upload
        await supabase.storage.from('task-attachments').remove([filePath]);
        throw dbError;
      }
      return data as Attachment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
    }
  });

  const addLinkMutation = useMutation({
    mutationFn: async ({ url, name, taskId }: { url: string; name: string; taskId: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          user_id: user.id,
          type: 'link',
          name,
          url
        })
        .select()
        .single();

      if (error) throw error;
      return data as Attachment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
    }
  });

  const updateAttachmentTitleMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('task_attachments')
        .update({ name })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Attachment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
    }
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachment: Attachment) => {
      if (attachment.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('task-attachments')
          .remove([attachment.storage_path]);
        if (storageError) console.error("Storage deletion error", storageError);
      }

      const { error: dbError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachment.id);
        
      if (dbError) throw dbError;
    },
    onMutate: async (attachment) => {
      await queryClient.cancelQueries({ queryKey: ['attachments', attachment.task_id] });
      const previous = queryClient.getQueryData<Attachment[]>(['attachments', attachment.task_id]);
      
      queryClient.setQueryData<Attachment[]>(['attachments', attachment.task_id], old => 
        old?.filter(a => a.id !== attachment.id)
      );
      
      return { previous };
    },
    onError: (_err, attachment, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['attachments', attachment.task_id], context.previous);
      }
    },
    onSettled: (_data, _error, attachment) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', attachment.task_id] });
    }
  });

  const getFileUrl = async (path: string) => {
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .createSignedUrl(path, 3600); // 1 hour expiry
    if (error) {
      console.error('Error generating signed URL', error);
      return null;
    }
    return data.signedUrl;
  };

  return {
    attachments,
    isLoading,
    error,
    uploadFile: uploadFileMutation.mutateAsync,
    isUploading: uploadFileMutation.isPending,
    uploadError: uploadFileMutation.error,
    resetUploadError: uploadFileMutation.reset,
    addLink: addLinkMutation.mutateAsync,
    isAddingLink: addLinkMutation.isPending,
    updateAttachmentTitle: updateAttachmentTitleMutation.mutateAsync,
    deleteAttachment: deleteAttachmentMutation.mutate,
    getFileUrl,
  };
}
