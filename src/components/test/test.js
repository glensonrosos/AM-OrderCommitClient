import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const columns = [
  { id: 'name', label: 'Name', group: 'General', minWidth: 100 },
  { id: 'age', label: 'Age', group: 'General', minWidth: 50 },
  { id: 'gender', label: 'Gender', group: 'General', minWidth: 50 },
  { id: 'salary', label: 'Salary', group: 'Financial', minWidth: 100 },
  { id: 'position', label: 'Position', group: 'Financial', minWidth: 100 },
];

const data = [
  { name: 'John', age: 25, gender: 'Male', salary: 50000, position: 'Developer' },
  { name: 'Jane', age: 30, gender: 'Female', salary: 60000, position: 'Manager' },
  // Add more data as needed
];

const HideShowColumnsTable = () => {
  const [visibleColumns, setVisibleColumns] = useState(columns.map((column) => column.id));

  const handleCheckboxChange = (columnId) => {
    setVisibleColumns((prevVisibleColumns) => {
      if (prevVisibleColumns.includes(columnId)) {
        return prevVisibleColumns.filter((col) => col !== columnId);
      } else {
        return [...prevVisibleColumns, columnId];
      }
    });
  };

  const isGroupVisible = (group) => {
    const groupColumns = columns.filter((column) => column.group === group);
    const visibleGroupColumns = groupColumns.filter((column) => visibleColumns.includes(column.id));

    return visibleGroupColumns.length > 0;
  };

  return (
    <div>
      {Array.from(new Set(columns.map((column) => column.group))).map((group) => (
        isGroupVisible(group) && (
          <FormControlLabel
            key={group}
            control={
              <Checkbox
                checked={isGroupVisible(group)}
                onChange={() => handleCheckboxChange(group)}
              />
            }
            label={`Toggle ${group} Group`}
          />
        )
      ))}
      {columns.map((column) => (
        <FormControlLabel
          key={column.id}
          control={
            <Checkbox
              checked={visibleColumns.includes(column.id)}
              onChange={() => handleCheckboxChange(column.id)}
            />
          }
          label={column.label}
        />
      ))}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns
                .filter((column) => visibleColumns.includes(column.id))
                .map((column) => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {columns
                  .filter((column) => visibleColumns.includes(column.id))
                  .map((column) => (
                    <TableCell key={column.id}>{row[column.id]}</TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default HideShowColumnsTable;
