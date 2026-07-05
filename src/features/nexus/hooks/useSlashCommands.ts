import { useState, useCallback, useEffect } from 'react';

export type CommandGroup = 'text' | 'code' | 'media' | 'productivity';

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  iconName: string;
  group: CommandGroup;
  syntax: string;
  offset?: number;
}

export const COMMANDS: SlashCommand[] = [
  { id: 'h1', label: 'Heading 1', description: 'Big section heading', iconName: 'Heading1', group: 'text', syntax: '# ', offset: 0 },
  { id: 'h2', label: 'Heading 2', description: 'Medium section heading', iconName: 'Heading2', group: 'text', syntax: '## ', offset: 0 },
  { id: 'h3', label: 'Heading 3', description: 'Small section heading', iconName: 'Heading3', group: 'text', syntax: '### ', offset: 0 },
  { id: 'bullet', label: 'Bullet List', description: 'Create a simple list', iconName: 'List', group: 'text', syntax: '- ', offset: 0 },
  { id: 'number', label: 'Numbered List', description: 'Create a numbered list', iconName: 'ListOrdered', group: 'text', syntax: '1. ', offset: 0 },
  { id: 'check', label: 'Checklist', description: 'Track tasks with checkboxes', iconName: 'CheckSquare', group: 'text', syntax: '- [ ] ', offset: 0 },
  { id: 'quote', label: 'Quote', description: 'Capture a quote', iconName: 'Quote', group: 'text', syntax: '> ', offset: 0 },
  { id: 'divider', label: 'Divider', description: 'Visually divide content', iconName: 'Minus', group: 'text', syntax: '---\n', offset: 0 },
  { id: 'bold', label: 'Bold', description: 'Bold text', iconName: 'Bold', group: 'text', syntax: '****', offset: -2 },
  { id: 'italic', label: 'Italic', description: 'Italic text', iconName: 'Italic', group: 'text', syntax: '**', offset: -1 },
  
  { id: 'code-block', label: 'Code Block', description: 'Add a code snippet', iconName: 'Code', group: 'code', syntax: '```\n\n```', offset: -4 },
  { id: 'code-inline', label: 'Inline Code', description: 'Add inline code', iconName: 'Terminal', group: 'code', syntax: '``', offset: -1 },
  
  { id: 'callout', label: 'Callout', description: 'Standout block', iconName: 'Info', group: 'media', syntax: '> [!NOTE]\n> ', offset: 0 },
  { id: 'image', label: 'Image', description: 'Insert an image placeholder', iconName: 'Image', group: 'media', syntax: '![alt](url)', offset: -10 },
  { id: 'youtube', label: 'YouTube Embed', description: 'Embed a YouTube video', iconName: 'MonitorPlay', group: 'media', syntax: '!embed[youtube]()', offset: -1 },
  { id: 'video', label: 'Video Embed', description: 'Embed a Loom or video URL', iconName: 'Video', group: 'media', syntax: '!embed[video]()', offset: -1 },
  { id: 'reel', label: 'Reel Embed', description: 'Embed a vertical short video', iconName: 'Smartphone', group: 'media', syntax: '!embed[reel]()', offset: -1 },
  { id: 'short', label: 'Short Embed', description: 'Embed a YouTube short', iconName: 'Smartphone', group: 'media', syntax: '!embed[reel]()', offset: -1 },
  { id: 'pdf', label: 'PDF Embed', description: 'Embed a PDF link or attachment', iconName: 'FileText', group: 'media', syntax: '!embed[pdf]()', offset: -1 },
  { id: 'attachment', label: 'Attachment', description: 'Open attach menu', iconName: 'Paperclip', group: 'media', syntax: '', offset: 0 }, // Special
  
  { id: 'date', label: 'Today\'s Date', description: 'Insert current date', iconName: 'Calendar', group: 'productivity', syntax: '', offset: 0 }, // Special
  { id: 'template', label: 'Use Template', description: 'Open Template Gallery', iconName: 'LayoutTemplate', group: 'productivity', syntax: '', offset: 0 }, // Special
];

function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
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
  
  // Important: replace trailing newline with non-breaking space so it renders height
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

export function useSlashCommands(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  content: string,
  onChange: (val: string) => void,
  onAttachRequest?: () => void,
  onTemplateRequest?: () => void
) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [triggerPosition, setTriggerPosition] = useState(-1);

  // Filter commands
  const filteredCommands = COMMANDS.filter(cmd => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return cmd.label.toLowerCase().includes(query) || cmd.id.includes(query);
  });

  // Ensure index is valid after filtering
  useEffect(() => {
    if (selectedIndex >= filteredCommands.length && filteredCommands.length > 0) {
      setSelectedIndex(0);
    }
  }, [filteredCommands.length, selectedIndex]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setTriggerPosition(-1);
    setSelectedIndex(0);
  }, []);

  const handleCommandInsert = useCallback((command: SlashCommand) => {
    if (!textareaRef.current || triggerPosition === -1) return;
    const el = textareaRef.current;
    
    // Calculate new text
    const beforeSlash = content.substring(0, triggerPosition);
    const afterSlashAndQuery = content.substring(triggerPosition + 1 + searchQuery.length);
    
    let syntax = command.syntax;
    const offset = command.offset || 0;
    
    // Special cases
    if (command.id === 'date') {
      const today = new Date().toISOString().split('T')[0];
      syntax = today;
    }
    
    const newContent = beforeSlash + syntax + afterSlashAndQuery;
    
    if (command.id === 'attachment' && onAttachRequest) {
      onAttachRequest();
      closeMenu();
      return;
    }
    
    if (command.id === 'template' && onTemplateRequest) {
      onTemplateRequest();
      closeMenu();
      return;
    }

    onChange(newContent);
    closeMenu();

    // Adjust cursor
    const newCursorPos = beforeSlash.length + syntax.length + offset;
    
    // Use timeout to let React render the new value, then move cursor
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [content, triggerPosition, searchQuery, onChange, closeMenu, textareaRef, onAttachRequest]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleCommandInsert(filteredCommands[selectedIndex]);
      }
      return;
    }
    
    if (e.key === ' ') {
      // Space immediately cancels the slash command (it's no longer a valid command query)
      closeMenu();
      return;
    }
  }, [isOpen, filteredCommands, selectedIndex, closeMenu, handleCommandInsert]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);

    const el = e.target;
    const pos = el.selectionStart;
    
    // Detect if we just typed a / or if we are typing after a /
    // Check backwards from cursor to find the closest '/'
    let slashIndex = -1;
    for (let i = pos - 1; i >= 0; i--) {
      if (val[i] === '\n') break; // Don't search past newlines
      if (val[i] === ' ') break;  // Don't search past spaces
      if (val[i] === '/') {
        // Only trigger if / is at start of string, start of line, or follows a space
        const charBefore = i > 0 ? val[i - 1] : '\n';
        if (charBefore === '\n' || charBefore === ' ') {
          slashIndex = i;
        }
        break;
      }
    }

    if (slashIndex !== -1) {
      const query = val.substring(slashIndex + 1, pos);
      // Ensure query doesn't have spaces (already guarded by the loop above, but just in case)
      if (!query.includes(' ') && !query.includes('\n')) {
        setIsOpen(true);
        setSearchQuery(query);
        setTriggerPosition(slashIndex);
        
        // Calculate coords
        const coords = getCaretCoordinates(el, slashIndex);
        // We'll add some offset in the component for the actual floating menu
        setMenuPosition({ top: coords.top + coords.height, left: coords.left });
        return;
      }
    }
    
    if (isOpen) {
      closeMenu();
    }
  }, [onChange, isOpen, closeMenu]);

  return {
    isOpen,
    searchQuery,
    selectedIndex,
    menuPosition,
    filteredCommands,
    handleKeyDown,
    handleChange,
    closeMenu,
    handleCommandInsert
  };
}
