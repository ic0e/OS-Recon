import React, { useState, useMemo } from 'react';

interface TableRepoItem {
  name: string;
  language: string;
  stars: number;
  owner: string;
}

interface RepoTableProps {
  repos?: TableRepoItem[];
}

export function RepoTable({ repos = [] }: RepoTableProps) {
  const groupedByOwner = useMemo(() => {
    const groups: Record<string, TableRepoItem[]> = {};
    
    if (!repos || !Array.isArray(repos)) return groups;

    repos.forEach((repo) => {
      const ownerKey = repo.owner || 'unknown'; 
      if (!groups[ownerKey]) {
        groups[ownerKey] = [];
      }
      groups[ownerKey].push(repo);
    });
    return groups;
  }, [repos]);

  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const [commits, setCommits] = useState<any[] | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const toggleUser = (username: string) => {
    setExpandedUser(expandedUser === username ? null : username);
    setExpandedRepo(null);
    setCommits(null);
  };

  const analyzeCommits = async (repoName: string, repoOwner: string) => {
    const repoKey = `${repoOwner}/${repoName}`;

    if (expandedRepo === repoKey) {
      setExpandedRepo(null);
      setCommits(null);
      return;
    }

    setIsScanning(true);
    setCommits(null);
    setExpandedRepo(repoKey);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/scanCommits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: repoName, username: repoOwner }),
      });
      const res = await response.json();
      if (res.status === "completed") {
        setCommits(res.data);
      }
    } catch (error) {
      console.error("Connection error", error);
    } finally {
      setIsScanning(false);
    }
  };

  if (!repos || !Array.isArray(repos) || repos.length === 0) {
    return (
      <div style={{ border: '1px solid #222', background: '#111', padding: '1rem', fontFamily: 'monospace' }}>
        <p style={{ color: '#666', margin: 0 }}>No target logs found.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'monospace' }}>
      {Object.entries(groupedByOwner).map(([owner, userRepos]) => {
        const isUserOpen = expandedUser === owner;

        return (
          <div key={owner} style={{ border: '1px solid #222', background: '#111' }}>
            <div
              onClick={() => toggleUser(owner)}
              style={{
                background: isUserOpen ? '#161616' : '#111',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: isUserOpen ? '1px solid #222' : 'none',
                userSelect: 'none'
              }}
            >
              <span style={{ color: isUserOpen ? '#00ff66' : '#fff', fontWeight: 'bold' }}>
                {isUserOpen ? '▼' : '▶'} @{owner}
              </span>
              <span style={{ color: '#666', fontSize: '0.85rem' }}>
                {userRepos.length} target {userRepos.length === 1 ? 'repo' : 'repos'} discovered
              </span>
            </div>

            {isUserOpen && (
              <div style={{ padding: '1rem', background: '#0d0d0d' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #333', color: '#888' }}>
                      <th style={{ padding: '0.5rem' }}>Repository</th>
                      <th style={{ padding: '0.5rem' }}>Language</th>
                      <th style={{ padding: '0.5rem' }}>Stars</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRepos.map((repo, idx) => {
                      const currentRepoKey = `${owner}/${repo.name}`;
                      const isCurrentRepoOpen = expandedRepo === currentRepoKey;

                      return (
                        <React.Fragment key={idx}>
                          <tr>
                            <td style={{ padding: '0.75rem 0.5rem', color: '#fff' }}>{repo.name}</td>
                            <td style={{ padding: '0.75rem 0.5rem', color: '#aaa' }}>{repo.language || 'Unknown'}</td>
                            <td style={{ padding: '0.75rem 0.5rem', color: '#888' }}>★ {repo.stars}</td>
                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                              <button
                                onClick={() => analyzeCommits(repo.name, owner)}
                                style={{
                                  background: isCurrentRepoOpen ? '#ff3333' : '#222',
                                  color: '#fff',
                                  border: '1px solid #444',
                                  padding: '0.35rem 0.75rem',
                                  cursor: 'pointer',
                                  fontFamily: 'monospace'
                                }}
                              >
                                {isCurrentRepoOpen ? 'Close' : 'Analyze Commits'}
                              </button>
                            </td>
                          </tr>

                          {isCurrentRepoOpen && (
                            <tr style={{ borderBottom: '1px solid #222', background: '#050505' }}>
                              <td colSpan={4} style={{ padding: '1rem' }}>
                                <div style={{ borderLeft: '2px solid #00ff66', paddingLeft: '1rem' }}>
                                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#00ff66', fontSize: '0.9rem' }}>
                                    Commits parsed for {repo.name}
                                  </h4>

                                  {isScanning && (
                                    <p style={{ color: '#888', margin: 0, fontStyle: 'italic' }}>
                                      Extracting remote commit logs...
                                    </p>
                                  )}

                                  {!isScanning && (!commits || commits.length === 0) && (
                                    <p style={{ color: '#666', margin: 0 }}>No leaked meta or public commits found.</p>
                                  )}

                                  {!isScanning && Array.isArray(commits) && commits.map((commit: any, cIdx: number) => (
                                    <div key={cIdx} style={{
                                      margin: '2px 0',
                                      padding: '10px 14px',
                                      background: 'var(--color-background-primary, #111)',
                                      border: '0.5px solid rgba(255,255,255,0.08)',
                                      borderRadius: '6px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '4px',
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        <span style={{
                                          fontFamily: 'monospace',
                                          fontSize: '12px',
                                          color: '#00cc55',
                                          background: 'rgba(0,204,85,0.08)',
                                          padding: '2px 7px',
                                          borderRadius: '4px',
                                        }}>
                                          {commit?.sha ? commit.sha.substring(0, 7) : 'no-sha'}
                                        </span>
                                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>
                                          {commit?.author || 'Unknown'}
                                        </span>
                                        {commit?.email
                                          ? (
                                            <span style={{
                                              fontSize: '12px',
                                              fontFamily: 'monospace',
                                              color: '#60a5fa',
                                              background: 'rgba(96,165,250,0.1)',
                                              padding: '1px 7px',
                                              borderRadius: '4px',
                                            }}>
                                              {commit.email}
                                            </span>
                                          ) : (
                                            <span style={{ fontSize: '12px', color: '#555', fontStyle: 'italic' }}>
                                              no email exposed
                                            </span>
                                          )
                                        }
                                        <span style={{ fontSize: '12px', color: '#555', marginLeft: 'auto' }}>
                                          {commit?.date ? new Date(commit.date).toLocaleString() : ''}
                                        </span>
                                      </div>
                                      <div style={{
                                        fontSize: '13px',
                                        color: '#999',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}>
                                        {commit?.message || 'No message'}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}