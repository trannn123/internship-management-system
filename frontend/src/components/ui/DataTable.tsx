import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => React.Key;
  loading?: boolean;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  tableClassName?: string;
}

function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  loadingMessage,
  emptyTitle = "Không có dữ liệu",
  emptyDescription,
  tableClassName = "table align-middle mb-0",
}: DataTableProps<T>) {
  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="table-responsive">
        <table className={tableClassName}>
          <thead className="table-light">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={column.className}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={rowKey(row, index)}>
                {columns.map((column) => {
                  const value = row[column.key as keyof T];

                  return (
                    <td
                      key={String(column.key)}
                      className={column.className}
                    >
                      {column.render
                        ? column.render(row, index)
                        : String(value ?? "—")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
