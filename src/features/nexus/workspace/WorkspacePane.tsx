import { memo } from 'react';
import type { WorkspacePane } from './useWorkspaceStore';
import { useWorkspaceStore } from './useWorkspaceStore';
import { NoteEditorPane } from '../components/NoteEditorPane';
import { PDFEmbed } from '../components/embeds/PDFEmbed';
import { VideoEmbed } from '../components/embeds/VideoEmbed';
import { ReelEmbed } from '../components/embeds/ReelEmbed';
import { YouTubeEmbed } from '../components/embeds/YouTubeEmbed';

interface WorkspacePaneProps {
  pane: WorkspacePane;
}

export const WorkspacePaneComponent = memo(function WorkspacePaneComponent({ pane }: WorkspacePaneProps) {
  const activePaneId = useWorkspaceStore(state => state.activePaneId);
  const setFocus = useWorkspaceStore(state => state.setFocus);
  const isActive = activePaneId === pane.id;

  const renderContent = () => {
    switch (pane.type) {
      case 'note':
        return <NoteEditorPane key={pane.entityId || 'new'} paneId={pane.id} noteId={pane.entityId} initialDraft={pane.content} isReadOnly={pane.isReadOnly} />;
      case 'pdf':
        return <PDFEmbed url={pane.entityId!} />;
      case 'video':
        return <VideoEmbed url={pane.entityId!} type="video" />;
      case 'youtube':
        return <YouTubeEmbed url={pane.entityId!} videoId={pane.content} />;
      case 'reel':
        return <ReelEmbed url={pane.entityId!} provider={pane.content} />;
      default:
        return <div className="p-4 text-white">Unknown pane type: {pane.type}</div>;
    }
  };

  return (
    <div 
      onClick={() => setFocus(pane.id)}
      className="relative w-full h-full flex flex-col transition-all duration-300 overflow-hidden group/pane"
    >
      <div className={`flex-1 overflow-hidden relative min-h-0 flex flex-col transition-opacity duration-300 ${isActive ? 'opacity-100 z-10' : 'opacity-80 z-0'}`}>
        {renderContent()}
      </div>
    </div>
  );
});
