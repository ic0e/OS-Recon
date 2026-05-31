import { useState } from 'react';
import { TabNavigation } from './components/TabNavigation';
import { TargetProfile } from './components/TargetProfile';
import { OverviewTab } from './components/OverviewTab';
import { AnalyticsTab } from './components/AnalyticsTab';

function App() {
  const [inputTarget, setInputTarget] = useState('');
  const [scanData, setScanData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showStandardList, setShowStandardList] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const startRecon = async () => {
    if (!inputTarget) return;
    setIsScanning(true);
    setScanData(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: inputTarget }),
      });
      const res = await response.json();
      if (res.status === "completed") {
        setScanData(res.data);
      }
    } catch (error) {
      console.error("Connection error", error);
    } finally {
      setIsScanning(false);
    }
  };
  
  function clearLog() {
    setScanData(null);
    setActiveTab('overview');
  }

  return (
    <div style={{ padding: '2.5rem', fontFamily: 'monospace', background: '#0d0d0d', color: '#00ff66', minHeight: '100vh' }}>
      <h2>// OS-RECON SYSTEM // DASHBOARD ENGINE</h2>
      
      <div style={{ margin: '2rem 0' }}>
        <input 
          type="text" 
          value={inputTarget}
          onChange={(e) => setInputTarget(e.target.value)}
          placeholder="Enter target username or link... (github only atm)"
          style={{ 
            background: '#141414', border: '1px solid #00ff66', padding: '0.75rem', 
            color: '#fff', width: '380px', marginRight: '1rem', fontFamily: 'monospace' 
          }}
        />
        <button 
          onClick={startRecon}
          style={{ 
            background: '#00ff66', color: '#000', border: 'none', padding: '0.75rem 1.75rem', 
            cursor: 'pointer', fontWeight: 'bold', fontFamily: 'monospace' 
          }}
          disabled={isScanning}
        >
          {isScanning ? 'PARSING ENGINE...' : 'ANALYZE'}
        </button>
        <button
          onClick={clearLog}
          disabled={isScanning}
          style={{ 
            background: '#00ff66', color: '#000', border: 'none', padding: '0.75rem 1.75rem', 
            cursor: 'pointer', fontWeight: 'bold', fontFamily: 'monospace', marginLeft: '1rem'
          }}
        >
          Clear Log 
        </button>
      </div>

      {scanData && (
        <div style={{ marginTop: '2rem' }}>
          <TargetProfile scanData={scanData} />
          
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          {activeTab === 'overview' ? (
            <OverviewTab 
              scanData={scanData} 
              showStandardList={showStandardList} 
              setShowStandardList={setShowStandardList} 
            />
          ) : (
            <AnalyticsTab scanData={scanData} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;