import React from 'react';
import { getAssetsPath } from '../../lib/utils/assetUtils';

interface AssetDebugInfoProps {
  show: boolean;
}

/**
 * AssetDebugInfo - Displays information about asset paths and environment
 * 
 * This component helps diagnose asset loading issues by showing
 * details about the current environment and paths.
 */
export function AssetDebugInfo({ show }: AssetDebugInfoProps) {
  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-sm overflow-auto">
      <h3 className="font-bold mb-2">Asset Debug Info</h3>
      <ul className="space-y-1">
        <li><strong>BASE_URL:</strong> {import.meta.env.BASE_URL || '/'}</li>
        <li><strong>DEV:</strong> {import.meta.env.DEV ? 'true' : 'false'}</li>
        <li><strong>categories.json path:</strong> {getAssetsPath('questions/categories.json')}</li>
        <li><strong>Hostname:</strong> {window.location.hostname}</li>
        <li><strong>Path:</strong> {window.location.pathname}</li>
      </ul>
    </div>
  );
}

export default AssetDebugInfo;
