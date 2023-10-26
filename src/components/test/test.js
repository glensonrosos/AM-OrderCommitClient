import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import './SampleDataGrid.css'; // Import your custom CSS file

const columns = [
  { field: 'id', headerName: 'ID', width: 70, pinned: 'left' },
  { field: 'firstName', headerName: 'First Name', width: 130, pinned: 'left' },
  { field: 'column3', headerName: 'Column 3', width: 120 },
  { field: 'column4', headerName: 'Column 4', width: 120 },
  // ... (add more columns as needed)
  { field: 'column19', headerName: 'Column 19', width: 120 },
  { field: 'column20', headerName: 'Column 20', width: 120 },
  { field: 'lastName', headerName: 'Last Name', width: 130 },
  { field: 'age', headerName: 'Age', type: 'number', width: 90 },
];

const pinnedRows = [
  { id: 1, firstName: 'John' },
  { id: 2, firstName: 'Jane' },
];

const rows = [
  { id: 3, firstName: 'Bob', lastName: 'Smith', age: 22 },
  { id: 4, firstName: 'Alice', lastName: 'Johnson', age: 28 },
  { id: 5, firstName: 'Charlie', lastName: 'Brown', age: 35 },
];

export default function SampleDataGrid() {
  return (
    <div className="data-grid-container">
      <div className="pinned-columns">
        <div className="pinned-column">ID</div>
        <div className="pinned-column">First Name</div>
      </div>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        autoHeight
        components={{
          header: {
            cell: ({ colDef }) => (
              <div className={`pinned-header ${colDef.pinned || ''}`}>
                {colDef.headerName}
              </div>
            ),
          },
        }}
      />
      <DataGrid
        rows={pinnedRows}
        columns={columns.slice(0, 2)} // Use only the first two columns for pinned rows
        pageSize={5}
        rowsPerPageOptions={[5]}
        autoHeight
        components={{
          header: {
            cell: ({ colDef }) => (
              <div className={`pinned-header ${colDef.pinned || ''}`}>
                {colDef.headerName}
              </div>
            ),
          },
        }}
      />
    </div>
  );
}
