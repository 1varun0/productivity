import { useState, useCallback, useEffect } from 'react';

function getSelectionCoordinates(element: HTMLTextAreaElement, position: number) {
  const div = document.createElement('div');
  const style = div.style;
  const computed = window.getComputedStyle(element);

  style.whiteSpace = 'pre-wrap';
  style.wordWrap = 'break-word';
  style.position = 'absolute';
  style.visibility = 'hidden';
  
  const properties = [
    'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust',
    'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent',
    'textDecoration', 'letterSpacing', 'wordSpacing', 'tabSize', 'MozTabSize'
  ];
  
  properties.forEach(prop => {
    (style as any)[prop] = (computed as any)[prop];
  });
  
  let content = element.value.substring(0, position);
  if (content.endsWith('\n')) {
    content += '\u00a0'; 
  }
  
  div.textContent = content;
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  
  document.body.appendChild(div);
  const coordinates = {
    top: span.offsetTop + parseInt(computed.borderTopWidth || '0') - element.scrollTop,
    left: span.offsetLeft + parseInt(computed.borderLeftWidth || '0') - element.scrollLeft,
    height: parseInt(computed.lineHeight) || parseInt(computed.fontSize) * 1.5
  };
  document.body.removeChild(div);
  return coordinates;
}

export type FormatType = 'bold' | 'italic' | 'code';

export function useMarkdownShortcuts(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  content: string,
  onChange: (val: string) => void
) {
  const [selectionActive, setSelectionActive] = useState(false);
  const [barPosition, setBarPosition] = useState({ top: 0, left: 0 });

  const applyFormat = useCallback((type: FormatType) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const isSelected = start !== end;
    
    let wrapStart = '';
    let wrapEnd = '';
    
    if (type === 'bold') {
      wrapStart = '**'; wrapEnd = '**';
    } else if (type === 'italic') {
      wrapStart = '*'; wrapEnd = '*';
    } else if (type === 'code') {
      wrapStart = '`'; wrapEnd = '`';
    }

    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);

    const newContent = before + wrapStart + selected + wrapEnd + after;
    onChange(newContent);

    // Calculate new cursor position
    setTimeout(() => {
      el.focus();
      if (isSelected) {
        // Keep selection wrapped
        el.setSelectionRange(start, start + wrapStart.length + selected.length + wrapEnd.length);
      } else {
        // Place cursor in the middle
        const pos = start + wrapStart.length;
        el.setSelectionRange(pos, pos);
      }
      updateSelectionState();
    }, 0);
  }, [content, onChange, textareaRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // CMD/CTRL + B
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyFormat('bold');
    }
    // CMD/CTRL + I
    else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      applyFormat('italic');
    }
    // CMD/CTRL + SHIFT + C
    else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      applyFormat('code');
    }
  }, [applyFormat]);

  const updateSelectionState = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    if (el.selectionStart !== el.selectionEnd) {
      // We have a selection
      const coords = getSelectionCoordinates(el, el.selectionEnd);
      // Try to center the bar above the selection by roughly calculating selection center
      // A full bounding box for textarea selection is hard without exact text measurement,
      // so we just place it near the end of the selection, moved up slightly.
      
      setBarPosition({
        top: Math.max(0, coords.top - 40), // Position above the text
        left: coords.left
      });
      setSelectionActive(true);
    } else {
      setSelectionActive(false);
    }
  }, [textareaRef]);

  // Listen to mouse/keyboard selection events
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    const handleSelect = () => {
      // Use setTimeout to ensure we get the latest selection state
      setTimeout(updateSelectionState, 0);
    };

    el.addEventListener('select', handleSelect);
    el.addEventListener('mouseup', handleSelect);
    el.addEventListener('keyup', handleSelect);

    return () => {
      el.removeEventListener('select', handleSelect);
      el.removeEventListener('mouseup', handleSelect);
      el.removeEventListener('keyup', handleSelect);
    };
  }, [textareaRef, updateSelectionState]);

  return {
    selectionActive,
    barPosition,
    applyFormat,
    handleShortcutKeyDown: handleKeyDown
  };
}
