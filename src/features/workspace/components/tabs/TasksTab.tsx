import { useState, useRef, useMemo } from 'react';
import { Plus, Check, Calendar, UserX, Paperclip, Eye, Download, Trash2, Upload, FileText, Image as ImageIcon, Archive, File as FileIcon, X, Loader2 } from 'lucide-react';
import { useProjectTasks } from '../../hooks/useProjectTasks';
import { useProjectRole } from '../../hooks/useProjectRole';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { useProjectFiles } from '../../hooks/useProjectFiles';
import { useAuth } from '@/hooks/useAuth';
import type { Task } from '@/features/tasks/hooks/useTasks';

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon size={14} />;
  if (mimeType.startsWith('text/') || mimeType.includes('pdf') || mimeType.includes('word')) return <FileText size={14} />;
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return <Archive size={14} />;
  return <FileIcon size={14} />;
}

interface TasksTabProps {
  projectId: string;
}

export function TasksTab({ projectId }: TasksTabProps) {
  const { tasks, isLoading, addTask, toggleTask, updateTask } =
    useProjectTasks(projectId);
  const projectFiles = useProjectFiles(projectId);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const role = useProjectRole(projectId);
  const canEdit = role === 'owner' || role === 'member';

  const { inProgress, completed } = useMemo(() => {
    const inProgress = tasks.filter(t => !t.completed);
    const completed = tasks.filter(t => t.completed);
    return { inProgress, completed };
  }, [tasks]);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  const handleAddTask = () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed || !canEdit) return;
    addTask(trimmed);
    setNewTaskTitle('');
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Panel: Task List */}
      <section
        className="w-[240px] md:w-[320px] shrink-0 flex flex-col h-full"
        style={{
          borderRight: '1px solid #474553',
          backgroundColor: '#131313',
        }}
      >
        {/* Add task input */}
        {canEdit && (
          <div
            className="p-4"
            style={{
              borderBottom: '1px solid #474553',
              backgroundColor: '#0e0e0e',
            }}
          >
            <div
              className="flex items-center gap-2 px-2 py-1 rounded-sm transition-colors"
              style={{
                backgroundColor: '#0e0e0e',
                border: '1px solid #474553',
              }}
            >
              <Plus size={16} style={{ color: '#928f9e' }} />
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddTask();
                }}
                placeholder="Add a task..."
                className="bg-transparent border-none outline-none w-full"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  lineHeight: '20px',
                  color: '#e5e2e1',
                }}
              />
            </div>
          </div>
        )}

        {/* Task list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <TaskSkeleton />
          ) : (
            <>
              {/* IN PROGRESS section */}
              <div
                className="px-4 py-2 sticky top-0"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  lineHeight: '12px',
                  letterSpacing: '0.08em',
                  fontWeight: 700,
                  color: '#928f9e',
                  borderBottom: '1px solid #474553',
                  backgroundColor: '#131313',
                  zIndex: 1,
                }}
              >
                IN PROGRESS
              </div>

              {inProgress.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isSelected={task.id === selectedTaskId}
                  onSelect={() => setSelectedTaskId(task.id)}
                  onToggle={() => toggleTask(task.id, true)}
                  canEdit={canEdit}
                />
              ))}

              {inProgress.length === 0 && (
                <div
                  className="px-4 py-6 text-center"
                  style={{
                    color: '#555',
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  No tasks in progress
                </div>
              )}

              {/* COMPLETED section */}
              {completed.length > 0 && (
                <>
                  <div
                    className="px-4 py-2 sticky top-0 mt-6"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '10px',
                      lineHeight: '12px',
                      letterSpacing: '0.08em',
                      fontWeight: 700,
                      color: '#928f9e',
                      borderBottom: '1px solid #474553',
                      backgroundColor: '#131313',
                      zIndex: 1,
                    }}
                  >
                    COMPLETED
                  </div>

                  {completed.map(task => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      isSelected={task.id === selectedTaskId}
                      onSelect={() => setSelectedTaskId(task.id)}
                      onToggle={() => toggleTask(task.id, false)}
                      canEdit={canEdit}
                      isCompleted
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Right Panel: Detail View */}
      <section
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: '#0e0e0e' }}
      >
        {selectedTask ? (
          <TaskDetail
            task={selectedTask}
            canEdit={canEdit}
            projectId={projectId}
            onUpdate={updateTask}
            projectFiles={projectFiles}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p
              style={{
                color: '#555',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Select a task to view details
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Task Row ─────────────────────────────────────────────── */

interface TaskRowProps {
  task: Task;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  canEdit: boolean;
  isCompleted?: boolean;
}

function TaskRow({
  task,
  isSelected,
  onSelect,
  onToggle,
  canEdit,
  isCompleted,
}: TaskRowProps) {
  const dueDateLabel = task.due_date ? getRelativeDate(task.due_date) : null;

  return (
    <div
      onClick={onSelect}
      className="cursor-pointer transition-colors duration-150"
      style={{
        borderBottom: '1px solid #474553',
        backgroundColor: isSelected ? '#1c1b1b' : 'transparent',
        borderLeft: isSelected ? '2px solid #c5c0ff' : '2px solid transparent',
        opacity: isCompleted ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.backgroundColor = '#201f1f';
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
        }
      }}
    >
      <div className="px-4 py-2 flex flex-col gap-1">
        <div className="flex items-start gap-2">
          {/* Checkbox */}
          <button
            onClick={e => {
              e.stopPropagation();
              if (canEdit) onToggle();
            }}
            className="mt-[2px] w-3 h-3 rounded-sm shrink-0 flex items-center justify-center transition-colors"
            style={
              isCompleted
                ? { backgroundColor: '#534ab7' }
                : { border: '1px solid #928f9e' }
            }
          >
            {isCompleted && (
              <Check size={10} style={{ color: '#d1ccff' }} />
            )}
          </button>

          {/* Title */}
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              lineHeight: '20px',
              color: isCompleted ? '#928f9e' : '#e5e2e1',
              textDecoration: isCompleted ? 'line-through' : 'none',
              fontWeight: isCompleted ? 400 : 500,
            }}
          >
            {task.title}
          </span>
        </div>

        {/* Meta row — only for in-progress tasks */}
        {!isCompleted && (
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: '20px' }}
          >
            {/* Assignee avatar placeholder */}
            {task.assigned_to ? (
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: '#2a2a2a',
                  fontSize: '8px',
                  color: '#e5e2e1',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                A
              </div>
            ) : (
              <UserX
                size={12}
                style={{ color: '#928f9e' }}
              />
            )}

            {/* Due date */}
            <span
              style={{
                fontSize: '10px',
                color: '#928f9e',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {dueDateLabel || 'No date'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Task Detail Panel ────────────────────────────────────── */

interface TaskDetailProps {
  task: Task;
  canEdit: boolean;
  projectId: string;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  projectFiles: ReturnType<typeof useProjectFiles>;
}

function TaskDetail({ task, canEdit, projectId, onUpdate, projectFiles }: TaskDetailProps) {
  const [description, setDescription] = useState(task.description || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const members = useWorkspaceStore(s => s.members[projectId] ?? []);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const { user } = useAuth();
  
  const { folders, files, createFolder, uploadFile, viewFile, downloadFile, deleteFile, uploads, dismissUpload, retryUpload } = projectFiles;

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    let targetFolderId = task.folder_id;

    if (!targetFolderId) {
      let parentFolderId = folders.find(f => f.name === 'Task Attachments' && !f.parent_id)?.id;
      if (!parentFolderId) {
        const res = await createFolder('Task Attachments', null);
        if (res.data) parentFolderId = res.data.id;
      }

      if (parentFolderId) {
        const res = await createFolder(`Task: ${task.title}`, parentFolderId);
        if (res.data) {
          targetFolderId = res.data.id;
          await onUpdate(task.id, { folder_id: targetFolderId });
        }
      }
    }

    if (targetFolderId) {
      for (const file of selectedFiles) {
        await uploadFile(file, targetFolderId);
      }
    }
    
    e.target.value = '';
  };

  const taskFiles = files.filter(f => f.folder_id === task.folder_id);
  const taskUploads = uploads.filter(u => u.folderId === task.folder_id);

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (canEdit) onUpdate(task.id, { description: value });
    }, 500);
  };

  const statusLabel = task.completed ? 'COMPLETED' : 'IN PROGRESS';
  const priorityLabel = task.is_priority ? 'HIGH' : null;

  return (
    <div
      className="max-w-3xl mx-auto p-12 flex flex-col gap-6"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Status / Priority badges */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2 py-1 rounded-sm"
            style={{
              backgroundColor: 'rgba(83, 74, 183, 0.2)',
              color: '#c5c0ff',
              border: '1px solid #534ab7',
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              lineHeight: '12px',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}
          >
            {statusLabel}
          </span>
          {priorityLabel && (
            <span
              className="px-2 py-1 rounded-sm"
              style={{
                backgroundColor: 'rgba(147, 0, 10, 0.2)',
                color: '#ffb4ab',
                border: '1px solid #93000a',
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                lineHeight: '12px',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              {priorityLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '24px',
            lineHeight: '32px',
            letterSpacing: '-0.02em',
            fontWeight: 600,
            color: '#e5e2e1',
          }}
        >
          {task.title}
        </h2>
      </div>

      {/* Metadata grid */}
      <div
        className="grid grid-cols-2 gap-y-4 gap-x-12 py-6"
        style={{ borderTop: '1px solid #474553', borderBottom: '1px solid #474553' }}
      >
        {/* Assigned to */}
        <div className="flex flex-col gap-1 relative">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              lineHeight: '12px',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: '#928f9e',
            }}
          >
            ASSIGNED TO
          </span>
          <button
            onClick={() => canEdit && setShowAssigneePicker(!showAssigneePicker)}
            className="flex items-center gap-2"
            disabled={!canEdit}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: '#2a2a2a',
                fontSize: '10px',
                color: '#e5e2e1',
              }}
            >
              {task.assigned_to
                ? (
                    members.find(m => m.user_id === task.assigned_to)
                      ?.profile?.username || 'U'
                  )
                    .charAt(0)
                    .toUpperCase()
                : '?'}
            </div>
            <span
              style={{
                fontSize: '13px',
                lineHeight: '20px',
                color: '#e5e2e1',
              }}
            >
              {task.assigned_to
                ? members.find(m => m.user_id === task.assigned_to)
                    ?.profile?.username ||
                  (task.assigned_to === user?.id ? 'You' : 'Member')
                : 'Unassigned'}
            </span>
          </button>

          {/* Assignee picker dropdown */}
          {showAssigneePicker && canEdit && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAssigneePicker(false)}
              />
              <div
                className="absolute top-full left-0 mt-1 w-48 py-1 rounded-sm z-50"
                style={{
                  backgroundColor: '#201f1f',
                  border: '1px solid #474553',
                }}
              >
                <button
                  onClick={() => {
                    onUpdate(task.id, { assigned_to: undefined });
                    setShowAssigneePicker(false);
                  }}
                  className="w-full text-left px-3 py-2 transition-colors"
                  style={{
                    fontSize: '12px',
                    color: '#928f9e',
                  }}
                  onMouseEnter={e =>
                    ((e.target as HTMLElement).style.backgroundColor = '#2a2a2a')
                  }
                  onMouseLeave={e =>
                    ((e.target as HTMLElement).style.backgroundColor =
                      'transparent')
                  }
                >
                  Unassigned
                </button>
                {members.map(m => (
                  <button
                    key={m.user_id}
                    onClick={() => {
                      onUpdate(task.id, { assigned_to: m.user_id });
                      setShowAssigneePicker(false);
                    }}
                    className="w-full text-left px-3 py-2 transition-colors"
                    style={{
                      fontSize: '12px',
                      color: '#e5e2e1',
                    }}
                    onMouseEnter={e =>
                      ((e.target as HTMLElement).style.backgroundColor =
                        '#2a2a2a')
                    }
                    onMouseLeave={e =>
                      ((e.target as HTMLElement).style.backgroundColor =
                        'transparent')
                    }
                  >
                    {m.profile?.username || m.user_id.slice(0, 8)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Due date */}
        <div className="flex flex-col gap-1">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              lineHeight: '12px',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: '#928f9e',
            }}
          >
            DUE DATE
          </span>
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: '#928f9e' }} />
            {canEdit ? (
              <input
                type="date"
                value={task.due_date ? task.due_date.split('T')[0] : ''}
                onChange={e =>
                  onUpdate(task.id, {
                    due_date: e.target.value || undefined,
                  })
                }
                className="bg-transparent border-none outline-none cursor-pointer"
                style={{
                  fontSize: '13px',
                  lineHeight: '20px',
                  color: '#e5e2e1',
                  fontFamily: 'Inter, sans-serif',
                  colorScheme: 'dark',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: '13px',
                  lineHeight: '20px',
                  color: '#e5e2e1',
                }}
              >
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'No date'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            lineHeight: '12px',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: '#928f9e',
          }}
        >
          DESCRIPTION
        </span>
        <textarea
          value={description}
          onChange={e => handleDescriptionChange(e.target.value)}
          disabled={!canEdit}
          placeholder="Add a description..."
          className="min-h-[100px] p-4 rounded-sm outline-none resize-none transition-colors"
          style={{
            backgroundColor: '#131313',
            border: '1px solid #474553',
            color: description ? '#e5e2e1' : '#928f9e',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            lineHeight: '20px',
          }}
        />
      </div>

      {/* Attachments */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px',
              lineHeight: '12px',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: '#928f9e',
            }}
          >
            ATTACHMENTS
          </span>
          {canEdit && (
            <div>
              <input type="file" id={`task-upload-${task.id}`} className="hidden" multiple onChange={handleAttachFile} />
              <button 
                onClick={() => document.getElementById(`task-upload-${task.id}`)?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#534ab7]/10 border border-[#534ab7]/50 hover:bg-[#534ab7]/30 hover:border-[#534ab7] transition-all text-[10px] font-bold tracking-widest uppercase text-[#c5c0ff]"
              >
                <Upload size={12} strokeWidth={2.5} /> Add File
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {taskFiles.map(file => (
            <div key={file.id} className="flex items-center gap-3 p-3 rounded-md bg-[#131313] border border-[#474553] group transition-colors hover:border-[#534ab7]/50">
              <div className="w-8 h-8 rounded bg-[#201f1f] flex items-center justify-center text-[#928f9e]">
                {getFileIcon(file.mime_type)}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[12px] font-medium text-[#e5e2e1] truncate">{file.name}</span>
                <span className="text-[10px] text-[#928f9e]">{(file.size / 1024).toFixed(1)} KB • {file.uploader?.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => viewFile(file)} className="p-1.5 text-[#928f9e] hover:text-[#e5e2e1] rounded hover:bg-[#2a2a2a]"><Eye size={14} /></button>
                <button onClick={() => downloadFile(file)} className="p-1.5 text-[#928f9e] hover:text-[#e5e2e1] rounded hover:bg-[#2a2a2a]"><Download size={14} /></button>
                {canEdit && (
                  <button onClick={() => deleteFile(file.id, file.storage_path)} className="p-1.5 text-[#928f9e] hover:text-[#ffb4ab] rounded hover:bg-[#93000a]/20"><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          ))}

          {taskUploads.map(upload => (
            <div key={upload.id} className="flex items-center gap-3 p-3 rounded-md bg-[#131313] border border-[#474553]">
              <div className="w-8 h-8 rounded bg-[#201f1f] flex items-center justify-center text-[#928f9e]">
                {upload.error ? <X size={14} className="text-[#ffb4ab]" /> : <Loader2 size={14} className="animate-spin" />}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[12px] font-medium text-[#e5e2e1] truncate">{upload.filename}</span>
                <div className="w-full h-1 bg-[#201f1f] rounded overflow-hidden mt-1">
                  <div className="h-full bg-[#534ab7] transition-all" style={{ width: `${upload.progress}%` }} />
                </div>
              </div>
              {upload.error && (
                <div className="flex items-center gap-2">
                  <button onClick={() => retryUpload(upload.id)} className="text-[10px] text-[#c5c0ff] hover:underline">Retry</button>
                  <button onClick={() => dismissUpload(upload.id)} className="text-[10px] text-[#ffb4ab] hover:underline">Dismiss</button>
                </div>
              )}
            </div>
          ))}
          
          {taskFiles.length === 0 && taskUploads.length === 0 && (
            <div className="p-6 rounded-md border border-dashed border-[#474553] flex flex-col items-center justify-center gap-2 text-center">
              <Paperclip size={20} className="text-[#928f9e]/50" />
              <span className="text-[11px] text-[#928f9e]">No attachments yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity */}
      <div className="flex flex-col gap-2 mt-6">
        <span
          className="pb-1"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            lineHeight: '12px',
            letterSpacing: '0.08em',
            fontWeight: 700,
            color: '#928f9e',
            borderBottom: '1px solid #474553',
          }}
        >
          ACTIVITY
        </span>

        <div className="flex items-start gap-4 py-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1"
            style={{
              backgroundColor: '#2a2a2a',
              fontSize: '10px',
              color: '#e5e2e1',
            }}
          >
            {(user?.user_metadata?.username || user?.email || 'U')
              .charAt(0)
              .toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span style={{ fontSize: '13px', color: '#e5e2e1' }}>
              {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}{' '}
              <span style={{ color: '#928f9e' }}>added this task</span>
            </span>
            <span style={{ fontSize: '11px', color: '#928f9e' }}>
              {getTimeAgo(task.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────── */

function TaskSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-sm animate-pulse"
            style={{ backgroundColor: '#1e1e1e' }}
          />
          <div
            className="h-3 rounded-sm animate-pulse"
            style={{
              backgroundColor: '#1e1e1e',
              width: `${160 - i * 20}px`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */

function getRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diff = Math.floor(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff === 0) return 'Today';
  if (diff === -1) return 'Tomorrow';
  if (diff === 1) return 'Yesterday';
  if (diff > 1) return `${diff} days overdue`;
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
