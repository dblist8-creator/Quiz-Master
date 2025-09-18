export interface Theme {
  name: string;
  key: string;
  color: string; // The primary hex code
}

export const themes: Theme[] = [
  { name: 'Default Blue', key: 'blue', color: '#259cfb' },
  { name: 'Emerald Green', key: 'green', color: '#10b981' },
  { name: 'Rose Pink', key: 'pink', color: '#f43f5e' },
  { name: 'Royal Purple', key: 'purple', color: '#8b5cf6' },
  { name: 'Amber Orange', key: 'orange', color: '#f59e0b' },
  { name: 'Teal', key: 'teal', color: '#14b8a6' },
];
