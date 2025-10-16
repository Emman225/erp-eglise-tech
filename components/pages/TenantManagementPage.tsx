// components/pages/TenantManagementPage.tsx
import React, { useState, useMemo } from 'react';
import { ChurchTenant, TenantStatus } from '../../types';
import { dataService } from '../../data/mockDataService';
import Button from '../shared/Button';
import { PlusIcon, ExternalLinkIcon, EditIcon, DeleteIcon } from '../icons/Icon';
import Modal from '../shared/Modal';
import TenantForm from '../tenants/TenantForm';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import DataTable, { ColumnDef } from '../shared/DataTable';

const TenantStatusBadge: React.FC<{ status: TenantStatus }> = ({ status }) => {
  const baseClasses = 'px-2.5 py-0.5 text-xs font-medium rounded-full inline-block';
  const statusClasses = {
    [TenantStatus.Active]: 'bg-green-100 text-green-800',
    [TenantStatus.Suspended]: 'bg-yellow-100 text-yellow-800',
    [TenantStatus.Deleted]: 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const TenantManagementPage: React.FC = () => {
  const [tenants, setTenants] = useState<ChurchTenant[]>(dataService.getTenants());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<ChurchTenant | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingTenantId, setDeletingTenantId] = useState<string | null>(null);

  const handleOpenModal = (tenant: ChurchTenant | null = null) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTenant(null);
    setIsModalOpen(false);
  };

  const handleSaveTenant = (tenantData: Omit<ChurchTenant, 'id'> | ChurchTenant) => {
    if ('id' in tenantData) {
      dataService.updateTenant(tenantData);
    } else {
      dataService.addTenant(tenantData as Omit<ChurchTenant, 'id'>);
    }
    setTenants([...dataService.getTenants()]);
    handleCloseModal();
  };
  
  const handleDeleteClick = (id: string) => {
    setDeletingTenantId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if(deletingTenantId) {
        dataService.deleteTenant(deletingTenantId);
        setTenants([...dataService.getTenants()]);
    }
    setIsConfirmOpen(false);
    setDeletingTenantId(null);
  };

  const columns = useMemo<ColumnDef<ChurchTenant>[]>(() => [
    {
      header: "Nom de l'église",
      cell: (tenant) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
          <a href={`https://${tenant.domain}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center">
            {tenant.domain} <ExternalLinkIcon className="ml-1"/>
          </a>
        </div>
      ),
    },
    {
      header: 'Statut',
      accessorKey: 'status',
      cell: (tenant) => <TenantStatusBadge status={tenant.status} />,
    },
    {
      header: 'Plan',
      accessorKey: 'plan',
    },
    {
      header: 'Admin Principal',
      cell: (tenant) => (
        <div>
          <div className="text-sm text-gray-900">{tenant.admin.prenom} {tenant.admin.nom}</div>
          <div className="text-xs text-gray-500">{tenant.admin.email}</div>
        </div>
      )
    },
    {
      header: 'Date Création',
      accessorKey: 'createdAt'
    },
    {
      header: 'Actions',
      cell: (tenant) => (
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-900" onClick={() => handleOpenModal(tenant)}><EditIcon/></button>
          <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteClick(tenant.id)}><DeleteIcon/></button>
        </div>
      )
    }
  ], []);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Liste des Églises</h2>
        <Button variant="primary" leftIcon={<PlusIcon className="w-4 h-4"/>} onClick={() => handleOpenModal()}>
          Créer une église
        </Button>
      </div>

      <DataTable columns={columns} data={tenants} exportFilename='eglises'/>
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTenant ? "Modifier l'église" : "Créer une église"}>
        <TenantForm tenant={editingTenant} onSave={handleSaveTenant} onCancel={handleCloseModal} />
      </Modal>

      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette église ? Cette action est irréversible."
      />
    </div>
  );
};

export default TenantManagementPage;
