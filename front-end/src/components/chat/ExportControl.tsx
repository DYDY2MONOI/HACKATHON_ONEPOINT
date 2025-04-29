import React, { FC } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export const ExportControls: FC = () => {
  const handleExport = async (format: 'json' | 'pdf') => {
    const url = `${API_BASE}/export/${format}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Erreur export :', res.statusText);
      return;
    }
    const blob = format === 'json'
      ? new Blob([JSON.stringify(await res.json(), null, 2)], { type: 'application/json' })
      : await res.blob();

    const filename = `vignettes.${format}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <div className="flex items-center space-x-2 mt-4">
      <button
        onClick={() => handleExport('json')}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Export JSON
      </button>
      <button
        onClick={() => handleExport('pdf')}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Export PDF
      </button>
    </div>
  );
};
