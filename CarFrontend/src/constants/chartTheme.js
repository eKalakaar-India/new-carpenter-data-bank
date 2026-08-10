// Shared chart theming so every panel (pie, area, drilldown bar) stays visually
// consistent without repeating the same literals in every component.

export const CHART_COLORS = [
  '#851C2C', // Ekalakaar Deep Cherry Red (Primary)
  '#0284C7', // Sky Blue
  '#0D9488', // Deep Teal
  '#EAB308', // Warm Amber/Gold
  '#8B5CF6', // Purple/Violet
  '#10B981', // Emerald Green
  '#F43F5E', // Premium Rose
];

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE3EA',
    color: '#1E293B',
    borderRadius: '12px',
  },
  itemStyle: { color: 'var(--accent-primary)' },
};
