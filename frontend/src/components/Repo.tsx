
interface RepoProps {
  repo: {
    name: string;
    stars: number;
    language: string;
    description: string | null;
    reasons: string[];
  };
}

export function Repo({ repo }: RepoProps) {
  return (
    <div style={{ background: '#221111', border: '1px solid #ff3333', padding: '1rem', margin: '1rem 0', borderRadius: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ color: '#ff6666', fontSize: '1.1rem' }}>{repo.name}</strong>
        <span style={{ fontSize: '0.85rem', background: '#331111', padding: '0.2rem 0.5rem', border: '1px solid #ff3333' }}>
          ★ {repo.stars} | {repo.language}
        </span>
      </div>
      <p style={{ color: '#ccc', margin: '0.5rem 0' }}>{repo.description || "No project description provided."}</p>
      <div style={{ marginTop: '0.5rem' }}>
        {repo.reasons.map((reason, rIdx) => (
          <div key={rIdx} style={{ color: '#ff9999', fontSize: '0.85rem' }}>• {reason}</div>
        ))}
      </div>
    </div>
  );
}