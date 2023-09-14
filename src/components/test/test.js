import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';

function App() {
  const [selectedCellValue, setSelectedCellValue] = useState('');

  useEffect(() => {
    const handleCopyShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault();
        copyToClipboard(selectedCellValue);
      }
    };

    document.addEventListener('keydown', handleCopyShortcut);

    return () => {
      document.removeEventListener('keydown', handleCopyShortcut);
    };
  }, [selectedCellValue]);

  const copyToClipboard = (value) => {
    if (!value) return; // Ensure there's a value to copy

    if (navigator.clipboard) {
      navigator.clipboard.writeText(value)
        .then(() => {
          console.log('Data copied to clipboard');
        })
        .catch((error) => {
          console.error('Failed to copy data to clipboard:', error);
        });
    } else {
      console.warn('Clipboard API not supported in this browser.');
    }
  };

  const rows = [
    { id: 1, name: 'John', age: 25 },
    { id: 2, name: 'Jane', age: 30 },
    { id: 3, name: 'Bob', age: 28 },
    // ... Add more rows as needed
  ];

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 100 },
    // ... Add more columns as needed
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        onCellClick={(params) => {
          setSelectedCellValue(params.value);
        }}
      />
    </div>
  );
}

export default App;
