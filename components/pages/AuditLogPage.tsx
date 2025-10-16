// components/pages/AuditLogPage.tsx
import React, { useMemo } from 'react';
import { AuditLog } from '../../types';
import { dataService } from '../../data/mockDataService';
import DataTable, { ColumnDef } from '../shared/DataTable';

const AuditLogPage: React.FC = () => {
    const logs: AuditLog[] = dataService.getAuditLogs();

    const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
        {
            header: "Date & Heure",
            accessorKey: 'date',
        },
        {
            header: "Utilisateur",
            cell: (log) => `${log.userName} (${log.user_id})`,
        },
        {
            header: "Action",
            accessorKey: 'action',
        },
        {
            header: "Objet Concerné",
            cell: (log) => `${log.objet} (${log.objet_id})`,
        },
        {
            header: "Adresse IP",
            accessorKey: 'ip',
        },
    ], []);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Journal des Actions Critiques</h2>
      </div>
        <DataTable columns={columns} data={logs} exportFilename='journal_audit' />
    </div>
  );
};

export default AuditLogPage;
