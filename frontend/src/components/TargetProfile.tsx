
interface TargetProfileProps {
  scanData: {
    username: string;
    profile_url: string;
    metrics: {
      total: number;
      interesting_count: number;
    };
  };
}

export function TargetProfile({ scanData }: TargetProfileProps) {
  return (
    <div style={{ background: '#141414', padding: '1rem', borderLeft: '4px solid #00ff66', marginBottom: '2rem' }}>
      <h3 style={{ margin: 0, color: '#fff' }}>Identity: {scanData.username}</h3>
      <p style={{ margin: '0.5rem 0 0 0', color: '#888' }}>
        Target Link:{' '}
        <a href={scanData.profile_url} target="_blank" rel="noreferrer" style={{ color: '#00ff66' }}>
          {scanData.profile_url}
        </a>
      </p>
      <p style={{ margin: '0.25rem 0 0 0', color: '#aaa' }}>
        Assets Discovered: {scanData.metrics.total} total ({scanData.metrics.interesting_count} prioritized)
      </p>
    </div>
  );
}
