export interface Profile {
  id: string;
  display_name: string | null;
  username: string | null;
  accent_color: string;
  compact_mode: boolean;
  theme: 'dark' | 'light' | 'system';
  created_at: string;
  updated_at: string;
}

export const ACCENT_COLORS = [
  { value: '#FFFFFF', label: 'White' },
  { value: '#534AB7', label: 'Purple' },
  { value: '#185FA5', label: 'Blue' },
  { value: '#0F6E56', label: 'Green' },
  { value: '#BA7517', label: 'Amber' },
  { value: '#993556', label: 'Pink' },
  { value: '#D85A30', label: 'Red' },
] as const;
