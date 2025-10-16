// components/pages/LogisticsManagementPage.tsx
import React, { useState, useMemo } from 'react';
import { Material, MaterialRequest, MaterialStatus, RequestStatus } from '../../types';
import { dataService } from '../../data/mockDataService';
import Button from '../shared/Button';
import { PlusIcon, EditIcon, DeleteIcon, CheckBadgeIcon, PhotoIcon } from '../icons/Icon';
import Modal from '../shared/Modal';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import MaterialForm from '../logistics/MaterialForm';
import MaterialRequestForm from '../logistics/MaterialRequestForm';
import DataTable, { ColumnDef } from '../shared/DataTable';

const MaterialStatusBadge: React.FC<{ status: MaterialStatus }> = ({ status }) => {
    const colors = {
        [MaterialStatus.Good]: 'bg-green-100 text-green-800',
        [MaterialStatus.Used]: 'bg-blue-100 text-blue-800',
        [MaterialStatus.Broken]: 'bg-red-100 text-red-800',
        [MaterialStatus.InMaintenance]: 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full inline-block ${colors[status]}`}>{status}</span>;
};

const RequestStatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
    const colors = {
        [RequestStatus.Pending]: 'bg-yellow-100 text-yellow-800',
        [RequestStatus.Approved]: 'bg-green-100 text-green-800',
        [RequestStatus.Rejected]: 'bg-red-100 text-red-800',
        [RequestStatus.InProgress]: 'bg-blue-100 text-blue-800',
        [RequestStatus.Returned]: 'bg-gray-100 text-gray-800',
        [RequestStatus.Cancelled]: 'bg-orange-100 text-orange-800',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full inline-block ${colors[status]}`}>{status}</span>;
};

const LogisticsManagementPage: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>(dataService.getMaterials());
    const [requests, setRequests] = useState<MaterialRequest[]>(dataService.getMaterialRequests());
    const [activeTab, setActiveTab] = useState<'inventory' | 'requests'>('inventory');
    
    const [isMaterialModalOpen, setMaterialModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<MaterialRequest | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<{ id: string; type: 'material' | 'request' } | null>(null);

    // Handlers
    const handleOpenMaterialModal = (material: Material | null = null) => { setEditingMaterial(material); setMaterialModalOpen(true); };
    const handleSaveMaterial = (data: Omit<Material, 'id'> | Material) => {
        if ('id' in data) dataService.updateMaterial(data); else dataService.addMaterial(data as Omit<Material, 'id'>);
        setMaterials([...dataService.getMaterials()]); setMaterialModalOpen(false);
    };
    const handleOpenRequestModal = (request: MaterialRequest | null = null) => { setEditingRequest(request); setRequestModalOpen(true); };
    const handleSaveRequest = (data: Omit<MaterialRequest, 'id'> | MaterialRequest) => {
        if ('id' in data) dataService.updateMaterialRequest(data); else dataService.addMaterialRequest(data as Omit<MaterialRequest, 'id'>);
        setRequests([...dataService.getMaterialRequests()]); setRequestModalOpen(false);
    };
    const handleDeleteClick = (id: string, type: 'material' | 'request') => { setDeletingItem({ id, type }); setIsConfirmOpen(true); };
    const handleConfirmDelete = () => {
        if (!deletingItem) return;
        if (deletingItem.type === 'material') { dataService.deleteMaterial(deletingItem.id); setMaterials([...dataService.getMaterials()]); } 
        else { dataService.deleteMaterialRequest(deletingItem.id); setRequests([...dataService.getMaterialRequests()]); }
        setIsConfirmOpen(false); setDeletingItem(null);
    };

    const materialColumns = useMemo<ColumnDef<Material>[]>(() => [
        { header: 'Matériel', cell: m => (
            <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                    {m.photoUrl ? <img src={m.photoUrl} alt={m.name} className="h-10 w-10 rounded-md object-cover"/> : <PhotoIcon className="h-6 w-6 text-gray-400" />}
                </div>
                <div className="ml-4"><div className="text-sm font-medium text-gray-900">{m.name}</div></div>
            </div>
        )},
        { header: 'Type', cell: m => <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">{m.type}</span> },
        { header: 'Quantité', cell: m => `${m.availableQuantity} / ${m.totalQuantity}` },
        { header: 'État', cell: m => <MaterialStatusBadge status={m.status} /> },
        { header: 'Localisation', accessorKey: 'location' },
        { header: 'Actions', cell: m => (
            <div className="flex space-x-2">
                <button onClick={() => handleOpenMaterialModal(m)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                <button onClick={() => handleDeleteClick(m.id, 'material')} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
            </div>
        )}
    ], []);

    const requestColumns = useMemo<ColumnDef<MaterialRequest>[]>(() => [
        { header: 'Demandeur', accessorKey: 'requesterName' },
        { header: 'Événement', accessorKey: 'eventName' },
        { header: 'Période', cell: r => `${r.startDate} au ${r.endDate}` },
        { header: 'Statut', cell: r => <RequestStatusBadge status={r.status} /> },
        { header: 'Actions', cell: r => (
            <div className="flex space-x-2">
                {r.status === RequestStatus.Pending && <button className="text-green-600 hover:text-green-900"><CheckBadgeIcon className="w-5 h-5"/></button>}
                <button onClick={() => handleOpenRequestModal(r)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                <button onClick={() => handleDeleteClick(r.id, 'request')} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
            </div>
        )}
    ], []);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">Gestion du Matériel et de la Logistique</h2>
            <div className="flex justify-between items-center border-b border-gray-200">
                <div className="flex">
                    <button onClick={() => setActiveTab('inventory')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'inventory' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Inventaire</button>
                    <button onClick={() => setActiveTab('requests')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'requests' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Demandes</button>
                </div>
                 <Button variant="primary" leftIcon={<PlusIcon className="w-4 h-4" />} onClick={() => activeTab === 'inventory' ? handleOpenMaterialModal() : handleOpenRequestModal()}>
                    {activeTab === 'inventory' ? 'Ajouter du matériel' : 'Créer une demande'}
                </Button>
            </div>
            {activeTab === 'inventory' && <DataTable columns={materialColumns} data={materials} exportFilename='inventaire' />}
            {activeTab === 'requests' && <DataTable columns={requestColumns} data={requests} exportFilename='demandes_materiel' />}
            <Modal isOpen={isMaterialModalOpen} onClose={() => setMaterialModalOpen(false)} title={editingMaterial ? "Modifier le matériel" : "Ajouter du matériel"}>
                <MaterialForm material={editingMaterial} onSave={handleSaveMaterial} onCancel={() => setMaterialModalOpen(false)} />
            </Modal>
             <Modal isOpen={isRequestModalOpen} onClose={() => setRequestModalOpen(false)} title={editingRequest ? "Modifier la demande" : "Créer une demande"}>
                <MaterialRequestForm request={editingRequest} onSave={handleSaveRequest} onCancel={() => setRequestModalOpen(false)} />
            </Modal>
            <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} title="Confirmer la suppression" message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible." />
        </div>
    );
};

export default LogisticsManagementPage;
