'use client';

interface Props {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: Props) {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff',
      fontFamily: '"Inter", system-ui, sans-serif',
      gap: 40,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 6, opacity: 0.3, textTransform: 'uppercase', marginBottom: 12 }}>
          Vinyl Vault
        </div>
        <div style={{ fontSize: 13, opacity: 0.18, letterSpacing: 2 }}>
          Your personal record collection
        </div>
      </div>

      <button
        onClick={onLogin}
        style={{
          background: 'transparent',
          color: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '14px 36px',
          fontSize: 11,
          letterSpacing: 2,
          textTransform: 'uppercase',
          cursor: 'pointer',
          borderRadius: 2,
          fontFamily: 'inherit',
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseEnter={e => {
          (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.4)';
          (e.target as HTMLButtonElement).style.color = '#fff';
        }}
        onMouseLeave={e => {
          (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)';
          (e.target as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
        }}
      >
        Sign in with Google
      </button>
    </main>
  );
}
