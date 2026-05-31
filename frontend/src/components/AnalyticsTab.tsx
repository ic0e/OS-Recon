
interface AnalyticsTabProps {
  scanData: {
    username: string;
  };
}

export function AnalyticsTab({ scanData }: AnalyticsTabProps) {
  return (
    <div style={{ background: '#141414', border: '1px dashed #00ff66', padding: '2rem', textAlign: 'center', margin: '2rem 0' }}>
      <h3 style={{ color: '#00ff66', fontFamily: 'monospace', margin: '0 0 1rem 0' }}>
        // ANALYTICS FOR USER: {scanData.username.toUpperCase()}
      </h3>
      <p style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.6' }}>
        Status: WIP
        <br />
        This module is currently in development. No analytics for user:{' '}
        <span style={{ color: '#00ff66' }}>{scanData.username}</span>.
      </p>
    </div>
  );
}
