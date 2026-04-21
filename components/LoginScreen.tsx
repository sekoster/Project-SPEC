'use client';

import { AMBER, CYBER_BG, GRID_BG } from '@/lib/theme';

interface Props {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: Props) {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `${GRID_BG} ${CYBER_BG}`,
      fontFamily: 'monospace',
    }}>
      <button
        onClick={onLogin}
        style={{
          padding: '20px 40px',
          background: AMBER,
          color: '#000',
          border: 'none',
          borderRadius: 8,
          fontSize: 20,
          fontWeight: 900,
          cursor: 'pointer',
          boxShadow: `0 0 30px ${AMBER}66`,
          textTransform: 'uppercase',
        }}
      >
        ACCESS_GRANTED_VIA_GOOGLE
      </button>
    </main>
  );
}
