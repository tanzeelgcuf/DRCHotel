// src/components/ApiConnectionTest.jsx
import { useState, useEffect } from 'react';

export function ApiConnectionTest() {
  const [status, setStatus] = useState('checking');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [testHistory, setTestHistory] = useState([]);
  const [autoTest, setAutoTest] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://34.30.198.6:8081";

  useEffect(() => {
    testApiConnection();
    
    let interval;
    if (autoTest) {
      // Auto-test every 2 minutes
      interval = setInterval(testApiConnection, 120000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoTest]);

  const testApiConnection = async () => {
    const startTime = Date.now();
    
    try {
      setStatus('checking');
      setError(null);

      console.log('🔄 Testing API connection to:', API_BASE_URL);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      setResponse(data);
      setStatus('connected');
      
      // Add to test history
      setTestHistory(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          status: 'success',
          duration: `${duration}ms`,
          response: data
        },
        ...prev.slice(0, 4) // Keep last 5 tests
      ]);
      
      console.log('✅ API connected:', data);
      
    } catch (err) {
      const duration = Date.now() - startTime;
      let errorMessage = err.message;
      
      if (err.name === 'AbortError') {
        errorMessage = 'Timeout: La connexion a pris trop de temps';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Impossible de joindre le serveur';
      }
      
      setError(errorMessage);
      setStatus('error');
      
      // Add to test history
      setTestHistory(prev => [
        {
          timestamp: new Date().toLocaleTimeString(),
          status: 'error',
          duration: `${duration}ms`,
          error: errorMessage
        },
        ...prev.slice(0, 4)
      ]);
      
      console.error('❌ API connection failed:', err);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking': return '#ffa500';
      case 'connected': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking': return '🔄';
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getConnectionStats = () => {
    const successful = testHistory.filter(t => t.status === 'success').length;
    const total = testHistory.length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
    
    const durations = testHistory
      .filter(t => t.status === 'success')
      .map(t => parseInt(t.duration));
    
    const avgDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    return { successRate, avgDuration, total };
  };

  if (isMinimized) {
    const stats = getConnectionStats();
    return (
      <div 
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: getStatusColor(),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontSize: '16px',
          color: 'white'
        }} 
        onClick={() => setIsMinimized(false)}
        title={`API Status: ${status}\nSuccès: ${stats.successRate}%\nLatence moyenne: ${stats.avgDuration}ms`}
      >
        <div>{getStatusIcon()}</div>
        <div style={{ fontSize: '8px' }}>{stats.successRate}%</div>
      </div>
    );
  }

  const stats = getConnectionStats();

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontSize: '13px',
      zIndex: 10000,
      maxWidth: '420px',
      minWidth: '320px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🔗 Moniteur API
          {autoTest && <span style={{ 
            fontSize: '10px', 
            color: '#28a745', 
            background: '#d4edda', 
            padding: '2px 6px', 
            borderRadius: '10px' 
          }}>AUTO</span>}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setAutoTest(!autoTest)}
            style={{
              background: autoTest ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '2px 6px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
            title={autoTest ? 'Désactiver auto-test' : 'Activer auto-test'}
          >
            {autoTest ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#666'
            }}
            title="Réduire"
          >
            ➖
          </button>
        </div>
      </div>
      
      {/* Status Display */}
      <div style={{ 
        color: getStatusColor(),
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px',
        background: '#f8f9fa',
        borderRadius: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{getStatusIcon()}</span>
          <span style={{ fontWeight: 'bold' }}>
            {status === 'checking' && 'Vérification...'}
            {status === 'connected' && 'Connecté'}
            {status === 'error' && 'Connexion échouée'}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Connection Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <div style={{ textAlign: 'center', padding: '6px', background: '#e9ecef', borderRadius: '4px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: stats.successRate >= 80 ? '#28a745' : '#dc3545' }}>
            {stats.successRate}%
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>Succès</div>
        </div>
        <div style={{ textAlign: 'center', padding: '6px', background: '#e9ecef', borderRadius: '4px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>
            {stats.avgDuration}ms
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>Latence</div>
        </div>
        <div style={{ textAlign: 'center', padding: '6px', background: '#e9ecef', borderRadius: '4px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#6c757d' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '10px', color: '#666' }}>Tests</div>
        </div>
      </div>

      {/* Server Info */}
      <div style={{ 
        fontSize: '11px', 
        color: '#666', 
        marginBottom: '12px',
        background: '#f8f9fa',
        padding: '8px',
        borderRadius: '6px'
      }}>
        <div><strong>🌐 URL:</strong> {API_BASE_URL}</div>
        <div><strong>⚙️ Env:</strong> {import.meta.env.VITE_ENV || 'development'}</div>
        <div><strong>🔄 Mode:</strong> {import.meta.env.MODE || 'dev'}</div>
      </div>

      {/* Response Display */}
      {response && (
        <div style={{ 
          background: '#d4edda', 
          border: '1px solid #c3e6cb',
          padding: '8px', 
          borderRadius: '6px', 
          fontSize: '11px',
          marginBottom: '8px'
        }}>
          <strong>✅ Réponse du serveur:</strong><br />
          <details style={{ marginTop: '4px' }}>
            <summary style={{ cursor: 'pointer', color: '#155724' }}>Voir détails</summary>
            <pre style={{ 
              fontSize: '10px', 
              margin: '4px 0 0 0', 
              padding: '4px',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '3px',
              overflow: 'auto',
              maxHeight: '100px'
            }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          border: '1px solid #f5c6cb',
          padding: '8px', 
          borderRadius: '6px', 
          fontSize: '11px',
          marginBottom: '8px',
          color: '#721c24'
        }}>
          <strong>❌ Erreur de connexion:</strong><br />
          <div style={{ marginTop: '4px', fontFamily: 'monospace' }}>
            {error}
          </div>
        </div>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <details>
            <summary style={{ 
              fontSize: '12px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              marginBottom: '6px'
            }}>
              📊 Historique des tests ({testHistory.length})
            </summary>
            <div style={{ 
              maxHeight: '120px', 
              overflowY: 'auto',
              fontSize: '10px',
              border: '1px solid #eee',
              borderRadius: '4px'
            }}>
              {testHistory.map((test, index) => (
                <div key={index} style={{
                  padding: '4px 8px',
                  borderBottom: index < testHistory.length - 1 ? '1px solid #f0f0f0' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: index % 2 === 0 ? '#fafafa' : 'white'
                }}>
                  <span style={{ fontFamily: 'monospace' }}>{test.timestamp}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: test.status === 'success' ? '#28a745' : '#dc3545' }}>
                      {test.status === 'success' ? '✅' : '❌'}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '9px' }}>
                      {test.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={testApiConnection}
          disabled={status === 'checking'}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '12px',
            border: '1px solid #007bff',
            borderRadius: '6px',
            background: status === 'checking' ? '#f8f9fa' : '#007bff',
            color: status === 'checking' ? '#666' : 'white',
            cursor: status === 'checking' ? 'not-allowed' : 'pointer',
            opacity: status === 'checking' ? 0.6 : 1,
            fontWeight: 'bold'
          }}
        >
          {status === 'checking' ? '🔄 Test en cours...' : '🔄 Tester maintenant'}
        </button>
        
        <button 
          onClick={() => setTestHistory([])}
          style={{
            padding: '8px 12px',
            fontSize: '12px',
            border: '1px solid #6c757d',
            borderRadius: '6px',
            background: 'white',
            color: '#6c757d',
            cursor: 'pointer'
          }}
          title="Effacer l'historique"
        >
          🗑️
        </button>
      </div>

      {/* Footer */}
      <div style={{ 
        marginTop: '8px', 
        fontSize: '9px', 
        color: '#999', 
        textAlign: 'center',
        borderTop: '1px solid #eee',
        paddingTop: '6px'
      }}>
        DRC System v1.0 • Mis à jour toutes les 2 minutes
      </div>
    </div>
  );
}

export default ApiConnectionTest;