import React from 'react';
// import styles from './table.module.css';

interface TableProps {
  data: { sent: number; uniqueOpens: number; totalClicks: number; uniqueClicks: number; }[];
}

const Table: React.FC<TableProps> = ({ data }) => {
  return (
    <table  >
      <thead>
        <tr>
          <th>Sent</th>
          <th>Unique Opens</th>
          <th>Total Clicks</th>
          <th>Unique Clicks</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.sent}</td>
            <td>{row.uniqueOpens}</td>
            <td>{row.totalClicks}</td>
            <td>{row.uniqueClicks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;