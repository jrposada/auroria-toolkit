import { FunctionComponent, ReactNode } from 'react';

import styles from './data-table.module.css';
import { formatDelta } from './delta';

export type DataTableColumn = {
  key: string;
  label: string;
  kind?: 'text' | 'number' | 'delta';
};

export type DataTableRow = {
  id: string;
  cells: Record<string, ReactNode>;
};

type DataTableProps = {
  /** Read by screen readers only: tables sit inside titled sections. */
  caption: string;
  columns: DataTableColumn[];
  rows: DataTableRow[];
};

const DataTable: FunctionComponent<DataTableProps> = ({
  caption,
  columns,
  rows,
}) => {
  const cell = (column: DataTableColumn, value: ReactNode) => {
    if (column.kind === 'delta' && typeof value === 'number') {
      const delta = formatDelta(value);

      return (
        <td key={column.key} data-kind="delta" data-sign={delta.sign}>
          {delta.text}
        </td>
      );
    }

    return (
      <td
        key={column.key}
        data-kind={column.kind === 'text' ? undefined : column.kind}
      >
        {value}
      </td>
    );
  };

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" data-kind={column.kind}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column, index) =>
                index === 0 ? (
                  <th key={column.key} scope="row">
                    {row.cells[column.key]}
                  </th>
                ) : (
                  cell(column, row.cells[column.key])
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
