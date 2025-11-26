import { useState, useEffect } from 'react';
import { getAssetsPath } from '../../lib/utils/assetUtils';

interface AssetDebugInfoProps {
  show: boolean;
}

interface VersionInfo {
  version: string;
  gitHash: string;
  branch: string;
  buildTime: string;
  buildTimestamp: number;
}

/**
 * AssetDebugInfo - Displays information about asset paths and environment
 * 
 * This component helps diagnose asset loading issues by showing
 * details about the current environment and paths.
 */
export function AssetDebugInfo({ show }: AssetDebugInfoProps) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [versionError, setVersionError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      // Fetch version information
      fetch(getAssetsPath('version.json'))
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.json();
        })
        .then((data: VersionInfo) => {
          setVersionInfo(data);
          setVersionError(null);
        })
        .catch(error => {
          console.warn('Could not fetch version info:', error);
          setVersionError(error.message);
        });
    }
  }, [show]);

  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-sm overflow-auto">
      <h3 className="font-bold mb-2">🔍 Debug Info</h3>
      
      {/* Version Information */}
      <div className="mb-3">
        <h4 className="font-semibold text-yellow-300">Version</h4>
        {versionInfo ? (
          <ul className="space-y-1 ml-2">
            <li><strong>Version:</strong> v{versionInfo.version}</li>
            <li><strong>Git Hash:</strong> {versionInfo.gitHash}</li>
            <li><strong>Branch:</strong> {versionInfo.branch}</li>
            <li><strong>Built:</strong> {new Date(versionInfo.buildTime).toLocaleString()}</li>
          </ul>
        ) : versionError ? (
          <p className="text-red-300 ml-2">❌ Version unavailable: {versionError}</p>
        ) : (
          <p className="text-gray-300 ml-2">Loading version...</p>
        )}
      </div>

      {/* Environment Information */}
      <div className="mb-3">
        <h4 className="font-semibold text-blue-300">Environment</h4>
        <ul className="space-y-1 ml-2">
          <li><strong>BASE_URL:</strong> {import.meta.env.BASE_URL || '/'}</li>
          <li><strong>DEV:</strong> {import.meta.env.DEV ? 'true' : 'false'}</li>
          <li><strong>Hostname:</strong> {window.location.hostname}</li>
          <li><strong>Path:</strong> {window.location.pathname}</li>
        </ul>
      </div>

      {/* Asset Paths */}
      <div>
        <h4 className="font-semibold text-green-300">Asset Paths</h4>
        <ul className="space-y-1 ml-2">
          <li><strong>categories.json:</strong> <br/><span className="text-gray-300">{getAssetsPath('questions/categories.json')}</span></li>
          <li><strong>version.json:</strong> <br/><span className="text-gray-300">{getAssetsPath('version.json')}</span></li>
        </ul>
      </div>
    </div>
  );
}

export default AssetDebugInfo;
