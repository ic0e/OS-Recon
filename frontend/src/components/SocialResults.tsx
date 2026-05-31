
interface SocialResult {
  site: string;
  url: string;
  category: string;
  status: number;
}

interface SocialResultsProps {
  results: SocialResult[];
  categories: Record<string, SocialResult[]>;
  totalFound: number;
  totalChecked: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  development: "Development",
  social: "Social Media",
  gaming: "Gaming",
  media: "Media & Content",
  blogging: "Blogging",
  professional: "Professional",
  design: "Design",
  security: "Security",
};

const CATEGORY_COLORS: Record<string, string> = {
  development: "#00ff66",
  social: "#3b82f6",
  gaming: "#a855f7",
  media: "#f59e0b",
  blogging: "#ec4899",
  professional: "#06b6d4",
  design: "#f43f5e",
  security: "#10b981",
};

export function SocialResults({ results, categories, totalFound, totalChecked }: SocialResultsProps) {
  if (results.length === 0) {
    return (
      <div style={{ 
        background: '#141414', border: '1px dashed #333', padding: '2rem', 
        textAlign: 'center', margin: '1.5rem 0' 
      }}>
        <p style={{ color: '#888', fontFamily: 'monospace', margin: 0 }}>
          No profiles found for this username across {totalChecked} platforms.
        </p>
      </div>
    );
  }

  const sortedCategories = Object.entries(categories).sort((a, b) => b[1].length - a[1].length);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Summary bar */}
      <div style={{
        background: '#141414', padding: '1rem 1.25rem', marginBottom: '1.5rem',
        borderLeft: '4px solid #00ff66', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.95rem' }}>
          Found <strong style={{ color: '#00ff66' }}>{totalFound}</strong> profiles across{' '}
          <strong style={{ color: '#888' }}>{totalChecked}</strong> platforms
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {sortedCategories.map(([cat, items]) => (
            <span
              key={cat}
              style={{
                background: `${CATEGORY_COLORS[cat] || '#888'}18`,
                color: CATEGORY_COLORS[cat] || '#888',
                border: `1px solid ${CATEGORY_COLORS[cat] || '#888'}40`,
                padding: '0.2rem 0.6rem',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                borderRadius: '2px',
              }}
            >
              {CATEGORY_LABELS[cat] || cat}: {items.length}
            </span>
          ))}
        </div>
      </div>

      {/* Category groups */}
      {sortedCategories.map(([category, items]) => {
        const color = CATEGORY_COLORS[category] || '#888';
        const label = CATEGORY_LABELS[category] || category;

        return (
          <div key={category} style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              color: color, fontFamily: 'monospace', fontSize: '0.9rem',
              margin: '0 0 0.75rem 0', paddingBottom: '0.5rem',
              borderBottom: `1px solid ${color}40`,
              textTransform: 'uppercase',
            }}>
              {label} ({items.length})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
              {items.map((result, idx) => (
                <a
                  key={idx}
                  href={result.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#141414',
                    border: `1px solid ${color}30`,
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s, background 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.background = '#1a1a1a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${color}30`;
                    e.currentTarget.style.background = '#141414';
                  }}
                >
                  <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {result.site}
                  </span>
                  <span style={{ color: '#666', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
