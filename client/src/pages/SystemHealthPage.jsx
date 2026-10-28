import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, Database, Server, Clock, HardDrive } from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import { Spinner } from '../components/common/LoadingState.jsx';

export const SystemHealthPage = () => {
  const [loading, setLoading] = useState(true);
  const [serverHealth, setServerHealth] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Check server health
      const serverRes = await fetch('/api/health');
      if (!serverRes.ok) {
        throw new Error(`Server returned HTTP ${serverRes.status}`);
      }
      const serverData = await serverRes.json();
      setServerHealth(serverData);

      // 2. Check DB health
      const dbRes = await fetch('/api/health/db');
      const dbData = await dbRes.json();
      setDbHealth({
        status: dbRes.status,
        ok: dbRes.ok,
        data: dbData
      });

      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Failed to reach API server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <PageContainer
      title="System Health & Connectivity"
      subtitle="Live verification of backend services, MongoDB database readiness, and operational endpoints."
      actions={
        <Button
          variant="primary"
          size="sm"
          icon={RefreshCw}
          isLoading={loading}
          onClick={fetchHealth}
        >
          Refresh Status
        </Button>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 rounded border border-[#9E392F]/30 bg-[#9E392F]/10 text-ink flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#9E392F] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-[#9E392F]">Connectivity Alert</h3>
              <p className="text-xs text-ink mt-0.5">{error}</p>
              <p className="text-xs text-olive mt-2">
                Make sure the Express backend server is running on port 5000 (`npm run server`).
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Server Card */}
          <Card variant="stone">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-forest" />
                  Express API Server
                </CardTitle>
                {serverHealth ? (
                  <Badge variant="forest" size="sm">Operational</Badge>
                ) : (
                  <Badge variant="alert" size="sm">Offline</Badge>
                )}
              </div>
              <CardDescription>HTTP service running on port 5000</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !serverHealth ? (
                <div className="py-6 flex justify-center"><Spinner size="md" /></div>
              ) : serverHealth ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-olive">Service Identifier:</span>
                    <span className="font-mono font-medium text-ink">{serverHealth.service}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-olive">Environment:</span>
                    <span className="font-medium text-ink uppercase">{serverHealth.environment}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-olive">Uptime:</span>
                    <span className="font-medium text-ink">{serverHealth.uptimeSeconds} seconds</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-olive">Server Timestamp:</span>
                    <span className="font-mono text-ink text-[11px]">{serverHealth.timestamp}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-olive py-4">No server metrics available.</p>
              )}
            </CardContent>
            <CardFooter>
              <span className="text-[11px] text-olive">Endpoint: /api/health</span>
              <span className="text-[11px] font-mono text-forest">HTTP 200 OK</span>
            </CardFooter>
          </Card>

          {/* MongoDB Card */}
          <Card variant="stone">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-forest" />
                  MongoDB Connection
                </CardTitle>
                {dbHealth?.ok ? (
                  <Badge variant="forest" size="sm">Connected</Badge>
                ) : (
                  <Badge variant="alert" size="sm">Disconnected</Badge>
                )}
              </div>
              <CardDescription>Mongoose connection pool status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !dbHealth ? (
                <div className="py-6 flex justify-center"><Spinner size="md" /></div>
              ) : dbHealth ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-olive">Connection State:</span>
                    <span className="font-medium capitalize text-ink">
                      {dbHealth.data.database?.state || 'Unknown'} (Code: {dbHealth.data.database?.stateCode})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-olive">Target Database:</span>
                    <span className="font-mono font-medium text-ink">
                      {dbHealth.data.database?.databaseName || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-olive">Database Host:</span>
                    <span className="font-mono text-ink">
                      {dbHealth.data.database?.host || '127.0.0.1'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-olive">Status Message:</span>
                    <span className="text-ink font-medium">
                      {dbHealth.data.message}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-olive py-4">Database check pending.</p>
              )}
            </CardContent>
            <CardFooter>
              <span className="text-[11px] text-olive">Endpoint: /api/health/db</span>
              <span className={`text-[11px] font-mono ${dbHealth?.ok ? 'text-forest' : 'text-[#9E392F]'}`}>
                {dbHealth ? `HTTP ${dbHealth.status}` : 'Pending'}
              </span>
            </CardFooter>
          </Card>
        </div>

        {/* Diagnostic info */}
        <Card variant="paper">
          <CardHeader>
            <CardTitle>Error Handling & Connectivity Rule Validation</CardTitle>
            <CardDescription>How NEXTowner handles and surfaces database issues</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-ink leading-relaxed mb-3">
              When MongoDB connection fails or drops, the backend does not crash silently. The Mongoose driver listener captures the error and returns <code className="bg-stone px-1.5 py-0.5 rounded text-[11px]">HTTP 503 Service Unavailable</code> with detailed diagnostic information:
            </p>
            <pre className="p-3 rounded bg-ink text-paper text-[11px] font-mono overflow-x-auto leading-relaxed">
{`// Example HTTP 503 response when MONGODB_URI is unreachable
{
  "status": "unhealthy",
  "database": {
    "stateCode": 0,
    "state": "disconnected",
    "isConnected": false,
    "host": null,
    "databaseName": null,
    "lastError": "connect ECONNREFUSED 127.0.0.1:27017"
  },
  "message": "connect ECONNREFUSED 127.0.0.1:27017"
}`}
            </pre>
          </CardContent>
          <CardFooter>
            <span className="text-xs text-olive">
              Last checked: {lastChecked || 'Never'}
            </span>
            <Button variant="outline" size="sm" onClick={fetchHealth}>
              Retest Endpoint
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};

export default SystemHealthPage;
