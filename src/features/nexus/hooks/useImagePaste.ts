import { useCallback } from 'react';
import type { NoteAttachmentsRef } from '../components/NoteAttachments';

export function useImagePaste(
  content: string,
  setContent: (val: string | ((prev: string) => string)) => void,
  attachmentsRef: React.RefObject<NoteAttachmentsRef | null>
) {
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const filesToUpload: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1 || items[i].type === 'application/pdf') {
        const file = items[i].getAsFile();
        if (file) filesToUpload.push(file);
      }
    }

    if (filesToUpload.length === 0) return;
    
    // We have files to paste!
    e.preventDefault();

    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    // 1. Generate placeholders and insert them into the content immediately
    let newTextToInsert = '';
    const filePlaceholders = filesToUpload.map((file) => {
      const id = Math.random().toString(36).substring(7);
      const isPdf = file.type === 'application/pdf';
      const placeholder = isPdf ? `[Uploading PDF: ${file.name} - ${id}...]` : `![uploading-image-${id}]()`;
      newTextToInsert += (newTextToInsert ? '\n' : '') + placeholder;
      return { id, placeholder, isPdf, name: file.name };
    });

    const before = content.substring(0, start);
    const after = content.substring(end);
    
    setContent(before + newTextToInsert + after);

    const newCursorPos = start + newTextToInsert.length;
    setTimeout(() => {
      target.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    if (!attachmentsRef.current) return;

    try {
      // 2. Start the upload process
      const results = await attachmentsRef.current.uploadFiles(filesToUpload);
      
      // 3. Replace placeholders with actual attachment syntax or remove if failed
      setContent(prevContent => {
        let updatedContent = prevContent;
        filePlaceholders.forEach((p, idx) => {
          const result = results[idx];
          if (result && result.success && result.attachment) {
            const embedText = p.isPdf 
              ? `!embed[pdf](attachment:${result.attachment.id})`
              : `![image](attachment:${result.attachment.id})`;
            updatedContent = updatedContent.replace(p.placeholder, embedText);
          } else {
            // Failed, replace with error
            updatedContent = updatedContent.replace(p.placeholder, `> ⚠️ Failed to upload: ${p.name}`);
          }
        });
        return updatedContent;
      });

    } catch (error) {
      // Complete failure, clean up all placeholders
      setContent(prevContent => {
        let updatedContent = prevContent;
        filePlaceholders.forEach(p => {
          updatedContent = updatedContent.replace(p.placeholder, `> ⚠️ Failed to upload: ${p.name}`);
        });
        return updatedContent;
      });
    }

  }, [content, setContent, attachmentsRef]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const filesToUpload: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.indexOf('image') !== -1 || files[i].type === 'application/pdf') {
        filesToUpload.push(files[i]);
      }
    }

    if (filesToUpload.length === 0) return;
    
    // We have files to drop!
    e.preventDefault();
    e.stopPropagation(); // Prevent modal-level drop from triggering

    // Use current selection if available, or just append
    const target = e.target as HTMLTextAreaElement;
    const start = target.selectionStart || content.length;
    const end = target.selectionEnd || content.length;

    let newTextToInsert = '';
    const filePlaceholders = filesToUpload.map((file) => {
      const id = Math.random().toString(36).substring(7);
      const isPdf = file.type === 'application/pdf';
      const placeholder = isPdf ? `[Uploading PDF: ${file.name} - ${id}...]` : `![uploading-image-${id}]()`;
      newTextToInsert += (newTextToInsert ? '\n' : '') + placeholder;
      return { id, placeholder, isPdf, name: file.name };
    });

    const before = content.substring(0, start);
    const after = content.substring(end);
    
    setContent(before + newTextToInsert + after);

    const newCursorPos = start + newTextToInsert.length;
    setTimeout(() => {
      target.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    if (!attachmentsRef.current) return;

    try {
      const results = await attachmentsRef.current.uploadFiles(filesToUpload);
      
      setContent(prevContent => {
        let updatedContent = prevContent;
        filePlaceholders.forEach((p, idx) => {
          const result = results[idx];
          if (result && result.success && result.attachment) {
            const embedText = p.isPdf 
              ? `!embed[pdf](attachment:${result.attachment.id})`
              : `![image](attachment:${result.attachment.id})`;
            updatedContent = updatedContent.replace(p.placeholder, embedText);
          } else {
            updatedContent = updatedContent.replace(p.placeholder, `> ⚠️ Failed to upload: ${p.name}`);
          }
        });
        return updatedContent;
      });

    } catch (error) {
      setContent(prevContent => {
        let updatedContent = prevContent;
        filePlaceholders.forEach(p => {
          updatedContent = updatedContent.replace(p.placeholder, `> ⚠️ Failed to upload: ${p.name}`);
        });
        return updatedContent;
      });
    }

  }, [content, setContent, attachmentsRef]);

  return { handlePaste, handleDrop };
}
