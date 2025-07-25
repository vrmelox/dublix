import React from "react";

interface Equipements {
  equipId: string;
  nom: string;
  modèle: string;
  services: string[];
  installationDate: string;
  addedDate: string;
  statut: string;
  lastModifiedDate: string;
}

interface TableProps<T, ColumnType> {
  columns: ColumnType[]; // type ColumnType reçu en paramètre, pas défini ici
  data: T[];
  renderRow: (item: T) => React.ReactNode;
}

// Table générique, avec 2 paramètres génériques :
// T = type des données, ColumnType = type des colonnes
const Table = <T, ColumnType>({ columns, data, renderRow }: TableProps<T, ColumnType>) => {
  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="text-left text-gray-500 text-sm">
          {columns.map((col: any, i) => (
            // ici on ne connaît pas la forme exacte de col, 
            // donc il faut gérer ça dans le code qui appelle Table
            <th key={ i + col.accessor?.toString() || col.header} className={col.className}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{data.map((item) => renderRow(item))}</tbody>
    </table>
  );
}

export default Table;
