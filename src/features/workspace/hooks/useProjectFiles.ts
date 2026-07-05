import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { ProjectFolder, ProjectFile, UploadProgress } from '../types';

export function useProjectFiles(projectId: string) {
  const [folders, setFolders] = useState<ProjectFolder[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const { user: currentUser } = useAuth();

  // Fetch all folders and files for the project
  useEffect(() => {
    if (!projectId) return;

    const fetchStorage = async () => {
      const [{ data: fData }, { data: fiData }] = await Promise.all([
        supabase.from('project_folders').select('*').eq('project_id', projectId),
        supabase.from('project_files').select('*').eq('project_id', projectId)
      ]);

      if (fData) setFolders(fData);
      
      if (fiData && fiData.length > 0) {
        const uniqueUserIds = Array.from(new Set(fiData.map(f => f.uploaded_by)));
        const { data: profiles } = await supabase.rpc('get_user_profiles', {
          user_ids: uniqueUserIds
        });
        const profileMap = new Map(profiles?.map((p: { id: string; name: string }) => [p.id, p]));
        const enrichedFiles = fiData.map(f => ({
          ...f,
          uploader: profileMap.get(f.uploaded_by) || { name: 'Unknown User' }
        }));
        setFiles(enrichedFiles as ProjectFile[]);
      } else if (fiData) {
        setFiles(fiData as ProjectFile[]);
      }
    };

    fetchStorage();
  }, [projectId]);

  // Build folder tree from flat list
  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);

  // Files in current folder
  const currentFiles = useMemo(() =>
    files.filter(f => f.folder_id === activeFolderId),
    [files, activeFolderId]
  );

  // Subfolders of current folder
  const currentSubfolders = useMemo(() =>
    folders.filter(f => f.parent_id === activeFolderId),
    [folders, activeFolderId]
  );

  // Breadcrumb path
  const breadcrumb = useMemo(() =>
    buildBreadcrumb(folders, activeFolderId),
    [folders, activeFolderId]
  );

  const createFolder = async (name: string, parentId: string | null) => {
    if (!currentUser) return { error: 'unauthorized' };

    const { data, error } = await supabase
      .from('project_folders')
      .insert({ project_id: projectId, parent_id: parentId, name, created_by: currentUser.id })
      .select()
      .single();
      
    if (error) {
      if (error.code === '23505') { // Postgres unique constraint violation
        return { error: 'duplicate_name' };
      }
      return { error: 'unknown_error' };
    }

    if (data) {
      setFolders(prev => [...prev, data]);
      return { data };
    }
    return { error: 'unknown_error' };
  };

  const renameFolder = async (id: string, name: string) => {
    const { error } = await supabase.from('project_folders').update({ name }).eq('id', id);
    if (error) {
      if (error.code === '23505') return { error: 'duplicate_name' };
      return { error: 'unknown_error' };
    }
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
    return { success: true };
  };

  const deleteFolder = async (id: string) => {
    // We assume the UI already confirmed if not empty.
    // Recursive delete handled by ON DELETE CASCADE in DB for subfolders and files.
    setFolders(prev => prev.filter(f => f.id !== id));
    if (activeFolderId === id) setActiveFolderId(null);
    await supabase.from('project_folders').delete().eq('id', id);
    // Refresh files since cascade delete might have removed files
    const { data: fiData } = await supabase.from('project_files').select('*').eq('project_id', projectId);
    if (fiData && fiData.length > 0) {
      const uniqueUserIds = Array.from(new Set(fiData.map(f => f.uploaded_by)));
      const { data: profiles } = await supabase.rpc('get_user_profiles', {
        user_ids: uniqueUserIds
      });
      const profileMap = new Map(profiles?.map((p: { id: string; name: string }) => [p.id, p]));
      const enrichedFiles = fiData.map(f => ({
        ...f,
        uploader: profileMap.get(f.uploaded_by) || { name: 'Unknown User' }
      }));
      setFiles(enrichedFiles as ProjectFile[]);
    } else if (fiData) {
      setFiles(fiData as ProjectFile[]);
    }
  };

  const uploadFile = async (file: File, folderId: string | null, retryId?: string) => {
    if (!currentUser) return;
    
    const uploadId = retryId || crypto.randomUUID();
    const storagePath = `${projectId}/${folderId ?? 'root'}/${Date.now()}-${file.name}`;

    setUploads(prev => {
      const existing = prev.find(u => u.id === uploadId);
      if (existing) {
        return prev.map(u => u.id === uploadId ? { ...u, progress: 0, done: false, error: undefined } : u);
      }
      return [...prev, {
        id: uploadId, filename: file.name, progress: 0, done: false, file, folderId
      }];
    });

    // Simulate progress since Supabase js standard upload doesn't support onUploadProgress natively without TUS
    const progressInterval = setInterval(() => {
      setUploads(prev => prev.map(u => {
        if (u.id === uploadId && !u.done && u.progress < 90) {
          return { ...u, progress: u.progress + 10 };
        }
        return u;
      }));
    }, 300);

    const { error: storageError } = await supabase.storage
      .from('project-files')
      .upload(storagePath, file);

    clearInterval(progressInterval);

    if (storageError) {
      setUploads(prev => prev.map(u =>
        u.id === uploadId ? { ...u, error: 'Upload failed', done: true } : u
      ));
      return;
    }

    const { data: fileRecord } = await supabase
      .from('project_files')
      .insert({
        project_id: projectId,
        folder_id: folderId,
        uploaded_by: currentUser.id,
        name: file.name,
        size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
      })
      .select('*')
      .single();

    if (fileRecord) {
      const uploaderName = currentUser.user_metadata?.username || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User';
      setFiles(prev => [...prev, { ...fileRecord, uploader: { name: uploaderName } }]);
    }

    setUploads(prev => prev.map(u =>
      u.id === uploadId ? { ...u, progress: 100, done: true } : u
    ));

    // Remove successful upload progress after 2s
    setTimeout(() => {
      setUploads(prev => prev.filter(u => u.id !== uploadId || u.error));
    }, 2000);
  };

  const retryUpload = (uploadId: string) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (upload && upload.file) {
      uploadFile(upload.file, upload.folderId, uploadId);
    }
  };

  const dismissUpload = (uploadId: string) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId));
  };

  const downloadFile = async (file: ProjectFile) => {
    const { data } = await supabase.storage
      .from('project-files')
      .download(file.storage_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const viewFile = async (file: ProjectFile) => {
    const { data } = await supabase.storage
      .from('project-files')
      .download(file.storage_path);
    if (data) {
      const url = URL.createObjectURL(data);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
  };

  const deleteFile = async (id: string, storagePath: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    await supabase.storage.from('project-files').remove([storagePath]);
    await supabase.from('project_files').delete().eq('id', id);
  };

  const renameFile = async (id: string, name: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name } : f));
    await supabase.from('project_files').update({ name }).eq('id', id);
  };

  const moveFile = async (fileId: string, targetFolderId: string | null) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, folder_id: targetFolderId } : f
    ));
    await supabase
      .from('project_files')
      .update({ folder_id: targetFolderId })
      .eq('id', fileId);
  };

  return {
    folders, files, folderTree, currentFiles, currentSubfolders,
    breadcrumb, activeFolderId, setActiveFolderId,
    uploads, createFolder, renameFolder, deleteFolder,
    uploadFile, retryUpload, dismissUpload, downloadFile, viewFile, deleteFile, renameFile, moveFile
  };
}

// Helper: build nested tree from flat folder array
function buildFolderTree(folders: ProjectFolder[]): ProjectFolder[] {
  const map: Record<string, ProjectFolder> = {};
  folders.forEach(f => map[f.id] = { ...f, children: [] });
  const roots: ProjectFolder[] = [];
  folders.forEach(f => {
    if (f.parent_id && map[f.parent_id]) {
      map[f.parent_id].children!.push(map[f.id]);
    } else {
      roots.push(map[f.id]);
    }
  });
  return roots;
}

// Helper: build breadcrumb path to a folder
function buildBreadcrumb(
  folders: ProjectFolder[],
  folderId: string | null
): Array<{ id: string | null; name: string }> {
  const crumbs: Array<{ id: string | null; name: string }> = [
    { id: null, name: 'Project Files' }
  ];
  if (!folderId) return crumbs;

  const path: ProjectFolder[] = [];
  let current = folders.find(f => f.id === folderId);
  while (current) {
    path.unshift(current);
    current = current?.parent_id
      ? folders.find(f => f.id === current?.parent_id)
      : undefined;
  }
  path.forEach(f => crumbs.push({ id: f.id, name: f.name }));
  return crumbs;
}
