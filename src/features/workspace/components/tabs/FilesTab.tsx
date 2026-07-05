import React, { useState, useRef, useCallback } from 'react';
import { useProjectFiles } from '../../hooks/useProjectFiles';
import { useProjectRole } from '../../hooks/useProjectRole';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Image as ImageIcon, Code, Archive, File as FileIcon, Folder, ChevronRight, ChevronDown, Upload, FolderPlus, Download, Trash2, Edit2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { ProjectFolder, ProjectFile } from '../../types';

interface FilesTabProps {
  projectId: string;
}

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon size={16} />;
  if (mimeType.startsWith('text/') || mimeType.includes('pdf') || mimeType.includes('word')) return <FileText size={16} />;
  if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('typescript') || mimeType.includes('html')) return <Code size={16} />;
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return <Archive size={16} />;
  return <FileIcon size={16} />;
}

export function FilesTab({ projectId }: FilesTabProps) {
  const {
    files, folderTree, currentFiles, currentSubfolders,
    breadcrumb, activeFolderId, setActiveFolderId,
    uploads, createFolder, renameFolder, deleteFolder,
    uploadFile, retryUpload, dismissUpload, downloadFile, viewFile, deleteFile
  } = useProjectFiles(projectId);

  const role = useProjectRole(projectId);
  const isViewer = role === 'viewer';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  
  const [creatingParentId, setCreatingParentId] = useState<string | null | undefined>(undefined);
  const [creatingName, setCreatingName] = useState('');
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const [folderToDelete, setFolderToDelete] = useState<ProjectFolder | null>(null);

  const toggleFolder = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleCreateFolder = async () => {
    if (!creatingName.trim() || creatingParentId === undefined) return;
    const res = await createFolder(creatingName.trim(), creatingParentId);
    if (res.error === 'duplicate_name') {
      setDuplicateError(creatingParentId || 'root');
    } else if (res.data) {
      setCreatingParentId(undefined);
      setCreatingName('');
      setDuplicateError(null);
      if (creatingParentId) {
        setExpandedFolders(prev => new Set(prev).add(creatingParentId));
      }
    }
  };

  const handleRenameFolder = async () => {
    if (!editingFolderId || !editingFolderName.trim()) return;
    const res = await renameFolder(editingFolderId, editingFolderName.trim());
    if (res.error === 'duplicate_name') {
      setDuplicateError(editingFolderId);
    } else {
      setEditingFolderId(null);
      setEditingFolderName('');
      setDuplicateError(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isViewer) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        uploadFile(file, activeFolderId);
      });
    }
  }, [isViewer, activeFolderId, uploadFile]);

  const handleDeleteFolderClick = (folder: ProjectFolder) => {
    setFolderToDelete(folder);
  };

  const renderFileNode = (file: ProjectFile, depth: number) => {
    return (
      <div 
        key={file.id}
        className="group flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded-lg transition-colors text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
        style={{ paddingLeft: `${depth * 16 + 30}px` }}
        onClick={() => viewFile(file)}
      >
        <div className="text-outline-variant group-hover:text-primary transition-colors flex-shrink-0">
          {getFileIcon(file.mime_type)}
        </div>
        <span className="text-xs truncate">{file.name}</span>
      </div>
    );
  };

  const renderFolderNode = (folder: ProjectFolder, depth: number) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isActive = activeFolderId === folder.id;
    const isCreatingHere = creatingParentId === folder.id;
    const isEditingHere = editingFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div 
          className={`group flex items-center justify-between py-1.5 px-2 cursor-pointer rounded-lg transition-colors ${isActive ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => setActiveFolderId(folder.id)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <button 
              onClick={(e) => toggleFolder(e, folder.id)}
              className="p-0.5 rounded hover:bg-white/10 opacity-70 hover:opacity-100"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <Folder size={14} className="flex-shrink-0" fill={isActive ? "currentColor" : "none"} />
            
            {isEditingHere ? (
              <div className="flex flex-col gap-1">
                <input 
                  type="text" 
                  value={editingFolderName}
                  onChange={e => { setEditingFolderName(e.target.value); setDuplicateError(null); }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRenameFolder();
                    if (e.key === 'Escape') setEditingFolderId(null);
                  }}
                  autoFocus
                  className="bg-surface-container border border-primary/50 text-xs px-2 py-0.5 rounded outline-none"
                  onClick={e => e.stopPropagation()}
                  onBlur={() => handleRenameFolder()}
                />
                {duplicateError === folder.id && (
                  <span className="text-[#D85A30] text-[11px] leading-tight">A folder with this name already exists</span>
                )}
              </div>
            ) : (
              <span className="text-xs font-medium truncate">{folder.name}</span>
            )}
          </div>

          {!isViewer && !isEditingHere && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingFolderId(folder.id); setEditingFolderName(folder.name); }}
                className="p-1 text-outline-variant hover:text-on-surface"
              >
                <Edit2 size={12} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteFolderClick(folder); }}
                className="p-1 text-outline-variant hover:text-error"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>

        {isCreatingHere && (
          <div style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }} className="py-1.5 px-2">
             <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <ChevronRight size={14} className="opacity-0" />
                  <Folder size={14} className="text-outline-variant flex-shrink-0" />
                  <input 
                    type="text" 
                    value={creatingName}
                    onChange={e => { setCreatingName(e.target.value); setDuplicateError(null); }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') { setCreatingParentId(undefined); setDuplicateError(null); }
                    }}
                    autoFocus
                    className="bg-surface-container border border-primary/50 text-xs px-2 py-0.5 rounded outline-none text-on-surface"
                    placeholder="Folder name"
                    onBlur={() => { if(creatingName.trim()) handleCreateFolder(); else setCreatingParentId(undefined); }}
                  />
                </div>
                {duplicateError === folder.id && (
                  <span className="text-[#D85A30] text-[11px] leading-tight ml-8">A folder with this name already exists</span>
                )}
             </div>
          </div>
        )}

        {isExpanded && (
          <div className="flex flex-col">
            {folder.children && folder.children.map(child => renderFolderNode(child, depth + 1))}
            {currentFiles && files.filter(f => f.folder_id === folder.id).map(file => renderFileNode(file, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-surface overflow-hidden">
      
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/30 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {breadcrumb.map((crumb, idx) => (
            <React.Fragment key={crumb.id || 'root'}>
              {idx > 0 && <ChevronRight size={14} className="text-outline-variant" />}
              <button 
                onClick={() => setActiveFolderId(crumb.id)}
                className={`text-sm whitespace-nowrap transition-colors ${idx === breadcrumb.length - 1 ? 'font-semibold text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {!isViewer && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setCreatingParentId(activeFolderId); setCreatingName(''); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant text-sm font-medium text-on-surface hover:bg-white/5 transition-colors"
            >
              <FolderPlus size={16} />
              New Folder
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Upload size={16} />
              Upload
            </button>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files) {
                  Array.from(e.target.files).forEach(f => uploadFile(f, activeFolderId));
                }
                e.target.value = '';
              }}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Folder Tree */}
        <div className="w-64 border-r border-outline-variant/30 overflow-y-auto bg-surface-container-lowest flex flex-col pt-4 pb-20">
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-label-caps uppercase tracking-widest text-outline-variant">Directories</span>
          </div>
          
          <div className="flex-1 px-2 flex flex-col gap-0.5">
            <div 
              className={`group flex items-center justify-between py-1.5 px-2 cursor-pointer rounded-lg transition-colors ${activeFolderId === null ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}
              onClick={() => setActiveFolderId(null)}
            >
              <div className="flex items-center gap-2">
                <Folder size={14} fill={activeFolderId === null ? "currentColor" : "none"} />
                <span className="text-xs font-medium">Project Files</span>
              </div>
            </div>

            {creatingParentId === null && (
              <div className="py-1.5 px-2 pl-8">
                 <div className="flex flex-col gap-1">
                    <input 
                      type="text" 
                      value={creatingName}
                      onChange={e => { setCreatingName(e.target.value); setDuplicateError(null); }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleCreateFolder();
                        if (e.key === 'Escape') { setCreatingParentId(undefined); setDuplicateError(null); }
                      }}
                      autoFocus
                      className="bg-surface-container border border-primary/50 text-xs px-2 py-0.5 rounded outline-none text-on-surface"
                      placeholder="Folder name"
                      onBlur={() => { if(creatingName.trim()) handleCreateFolder(); else setCreatingParentId(undefined); }}
                    />
                    {duplicateError === 'root' && (
                      <span className="text-[#D85A30] text-[11px] leading-tight">A folder with this name already exists</span>
                    )}
                 </div>
              </div>
            )}

            {folderTree.map(folder => renderFolderNode(folder, 0))}
            {files.filter(f => f.folder_id === null).map(file => renderFileNode(file, 0))}
          </div>
        </div>

        {/* File List Area */}
        <div 
          className={`flex-1 relative overflow-y-auto bg-surface transition-colors duration-200 ${isDragging ? 'bg-[#1a1730]/10' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-4 rounded-xl border-2 border-dashed border-primary pointer-events-none z-10 flex items-center justify-center bg-surface/50 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4 text-primary">
                <Upload size={48} />
                <h3 className="text-xl font-headline-md font-semibold">Drop files here to upload</h3>
              </div>
            </div>
          )}

          <div className="p-8">
            <div className="grid grid-cols-[minmax(200px,1fr)_150px_100px_120px_50px] gap-4 px-4 py-2 border-b border-outline-variant/30 mb-2">
              <span className="text-[10px] font-label-caps uppercase tracking-widest text-outline-variant">Name</span>
              <span className="text-[10px] font-label-caps uppercase tracking-widest text-outline-variant">Uploaded By</span>
              <span className="text-[10px] font-label-caps uppercase tracking-widest text-outline-variant">Size</span>
              <span className="text-[10px] font-label-caps uppercase tracking-widest text-outline-variant">Date</span>
              <span></span>
            </div>

            {currentSubfolders.length === 0 && currentFiles.length === 0 && !isDragging && (
              <div className="flex flex-col items-center justify-center py-20 text-outline-variant">
                <Archive size={48} strokeWidth={1} className="mb-4 opacity-50" />
                <p className="font-body-main">This folder is empty</p>
                {!isViewer && <p className="text-sm mt-2">Drag and drop files here or click Upload</p>}
              </div>
            )}

            <div className="flex flex-col">
              {/* Render Subfolders */}
              {currentSubfolders.map(folder => (
                <div 
                  key={folder.id} 
                  className="group grid grid-cols-[minmax(200px,1fr)_150px_100px_120px_50px] gap-4 px-4 py-3 items-center rounded-xl hover:bg-surface-container-lowest transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30"
                  onClick={() => setActiveFolderId(folder.id)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Folder size={18} className="text-primary flex-shrink-0" />
                    <span className="font-medium text-on-surface truncate">{folder.name}</span>
                  </div>
                  <span className="text-sm text-outline-variant truncate">--</span>
                  <span className="text-sm text-outline-variant">--</span>
                  <span className="text-sm text-outline-variant truncate">{formatDistanceToNow(new Date(folder.created_at))} ago</span>
                  
                  <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isViewer && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolderClick(folder); }}
                        className="p-1.5 text-outline-variant hover:text-error rounded hover:bg-error/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Render Files */}
              {currentFiles.map(file => (
                <div 
                  key={file.id} 
                  className="group grid grid-cols-[minmax(200px,1fr)_150px_100px_120px_50px] gap-4 px-4 py-3 items-center rounded-xl hover:bg-surface-container-lowest transition-colors border border-transparent hover:border-outline-variant/30 cursor-pointer"
                  onClick={() => viewFile(file)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="text-outline-variant flex-shrink-0">
                      {getFileIcon(file.mime_type)}
                    </div>
                    <span className="font-medium text-on-surface truncate">{file.name}</span>
                  </div>
                  <span className="text-sm text-outline-variant truncate">{file.uploader?.name || 'Unknown'}</span>
                  <span className="text-sm text-outline-variant">{formatSize(file.size)}</span>
                  <span className="text-sm text-outline-variant truncate">{formatDistanceToNow(new Date(file.created_at))} ago</span>
                  
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); downloadFile(file); }}
                      className="p-1.5 text-outline-variant hover:text-primary rounded hover:bg-primary/10"
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                    {!isViewer && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteFile(file.id, file.storage_path); }}
                        className="p-1.5 text-outline-variant hover:text-error rounded hover:bg-error/10"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress Bar (Floating) */}
      {uploads.length > 0 && (
        <div className="absolute bottom-6 right-6 w-[340px] bg-surface-container rounded-xl border border-outline-variant shadow-lg flex flex-col overflow-hidden z-50">
          <div className="bg-surface-container-high px-4 py-2 border-b border-outline-variant flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface">Uploads ({uploads.filter(u => !u.done).length} active)</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-2">
            {uploads.map(upload => (
              <div key={upload.id} className={`flex flex-col gap-1 p-2 rounded-lg border ${upload.error ? 'bg-error/5 border-error/20' : 'bg-surface border-outline-variant/50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface truncate pr-2 flex-1" title={upload.filename}>{upload.filename}</span>
                  {upload.done ? (
                    upload.error ? (
                      <XCircle size={14} className="text-error" />
                    ) : (
                      <CheckCircle size={14} className="text-[#0F6E56]" />
                    )
                  ) : (
                    <span className="text-[10px] text-outline-variant">{upload.progress}%</span>
                  )}
                </div>
                
                {!upload.done && (
                  <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 ease-out" 
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
                
                {upload.error && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-error">{upload.error}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => dismissUpload(upload.id)}
                        className="text-[10px] text-outline-variant hover:text-on-surface"
                      >
                        Dismiss
                      </button>
                      <button 
                        onClick={() => retryUpload(upload.id)}
                        className="flex items-center gap-1 text-[10px] text-error hover:text-error/80 bg-error/10 px-2 py-0.5 rounded"
                      >
                        <RefreshCw size={10} /> Retry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Folder Confirmation Modal */}
      {folderToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container rounded-2xl border border-outline-variant/30 shadow-2xl p-6 w-full max-w-[400px]">
            <h2 className="text-lg font-headline-sm font-semibold text-on-surface mb-2">Delete Folder</h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Delete <span className="font-semibold text-on-surface">"{folderToDelete.name}"</span> and all its contents? This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setFolderToDelete(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-on-surface-variant hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  deleteFolder(folderToDelete.id);
                  setFolderToDelete(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-error text-on-error hover:bg-error/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
