import type { CSSProperties } from 'react';

export const AMBER = '#FF5F00';
export const CYBER_GREEN = '#00ff64';
export const CYBER_RED = '#ff3131';
export const CYBER_BG = '#141315';

export const GRID_BG = `linear-gradient(rgba(0,0,0,0.36), rgba(0,0,0,0.37)), url('data:image/svg+xml;utf8,<svg width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="32" height="32" fill="none"/><rect x="0" y="0" width="32" height="32" stroke="%23433" stroke-width="0.7"/><line x1="16" y1="0" x2="16" y2="32" stroke="%23766efb" stroke-width="0.5" opacity="0.2"/><line x1="0" y1="16" x2="32" y2="16" stroke="%23ff5f00" stroke-width="0.7" opacity="0.19"/></svg>')`;

export const inputStyle: CSSProperties = {
  width: '100%',
  background: '#000',
  color: AMBER,
  border: `1px solid ${AMBER}`,
  padding: 12,
  borderRadius: 5,
  fontFamily: 'monospace',
  outline: 'none',
  fontSize: 14,
};

export const actionBtn = (clr: string): CSSProperties => ({
  background: 'none',
  color: clr,
  border: `1px solid ${clr}`,
  padding: '4px 10px',
  fontSize: 10,
  cursor: 'pointer',
  fontWeight: 'bold',
  textTransform: 'uppercase',
});
