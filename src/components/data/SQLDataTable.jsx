// src/pages/EntityDataPage/components/SQLDataTable.jsx
// REMOVED: Edit, Trash2 icons

export const SQLDataTable = ({ records, columns }) => {
  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-hover border-b border-border">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"
                >
                  {column.replace(/_/g, ' ')}
                </th>
              ))}
              {/* REMOVED: Actions header 
              <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record, index) => (
              <tr key={record.id || index} className="hover:bg-surface-hover transition-colors">
                {columns.map((column) => (
                  <td key={column} className="px-6 py-4 text-sm text-text max-w-xs truncate">
                    {record[column] !== null && record[column] !== undefined
                      ? String(record[column])
                      : '-'}
                  </td>
                ))}
                {/* REMOVED: Actions cell 
                <td className="px-6 py-4 text-right text-sm">
                   <div className="flex items-center justify-end gap-2">
                       ... buttons ...
                   </div>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};