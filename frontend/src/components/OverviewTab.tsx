import { Repo } from './Repo';
import { RepoTable } from './RepoTable';

interface OverviewTabProps {
  scanData: {
    username: string;
    metrics: {
      interesting_count: number;
      standard_count: number;
    };
    interesting: any[];
    standard: any[];
  };
  showStandardList: boolean;
  setShowStandardList: (show: boolean) => void;
}

export function OverviewTab({ scanData, showStandardList, setShowStandardList }: OverviewTabProps) {
  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ color: '#ff3333', borderBottom: '1px dashed #ff3333', paddingBottom: '0.5rem' }}>
          HIGH INTEREST TARGET ASSETS ({scanData.metrics.interesting_count})
        </h4>
        {scanData.interesting.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>
            No high priority indicators flagged inside asset metadata.
          </p>
        ) : (
          scanData.interesting.map((repo: any, idx: number) => (
            <Repo key={idx} repo={repo} />
          ))
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={() => setShowStandardList(!showStandardList)}
          style={{
            background: '#222',
            color: '#fff',
            border: '1px solid #444',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontFamily: 'monospace',
            width: '100%',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>
            {showStandardList ? '▼ HIDE' : '▶ SHOW'} ALL OTHER RECORDED FOOTPRINTS ({scanData.metrics.standard_count})
          </span>
          <span>{showStandardList ? 'Collapse' : 'Expand'}</span>
        </button>

        {showStandardList && <RepoTable repos={scanData.standard} username={scanData.username} />}
      </div>
    </div>
  );
}
