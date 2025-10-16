// components/pages/NewcomerFollowUpPage.tsx
import React, { useState, useMemo } from 'react';
import { Newcomer, FollowUpStatus } from '../../types';
import { dataService } from '../../data/mockDataService';
import Button from '../shared/Button';
import { PlusIcon, EditIcon, DeleteIcon } from '../icons/Icon';
import Modal from '../shared/Modal';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import NewcomerForm from '../crm/NewcomerForm';
import NewcomerDetails from '../crm/NewcomerDetails';
import DataTable, { ColumnDef } from '../shared/DataTable';

const FollowUpStatusBadge: React.FC<{ status: FollowUpStatus }> = ({ status }) => {
    const colors = {
        [FollowUpStatus.New]: 'bg-blue-100 text-blue-800',
        [FollowUpStatus.Contacted]: 'bg-yellow-100 text-yellow-800',
        [FollowUpStatus.VisitPlanned]: 'bg-purple-100 text-purple-800',
        [FollowUpStatus.Integrated]: 'bg-green-100 text-green-800',
        [FollowUpStatus.Archived]: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full inline-block ${colors[status]}`}>{status}</span>;
};

const NewcomerFollowUpPage: React.FC = () => {
    const [newcomers, setNewcomers] = useState<Newcomer[]>(dataService.getNewcomers());
    const [selectedNewcomer, setSelectedNewcomer] = useState<Newcomer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNewcomer, setEditingNewcomer] = useState<Newcomer | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleOpenModal = (newcomer: Newcomer | null = null) => {
        setEditingNewcomer(newcomer);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => { setEditingNewcomer(null); setIsModalOpen(false); };
    const handleSave = (data: Omit<Newcomer, 'id'> | Newcomer) => {
        if ('id' in data) dataService.updateNewcomer(data);
        else dataService.addNewcomer(data as Omit<Newcomer, 'id'>);
        setNewcomers([...dataService.getNewcomers()]);
        handleCloseModal();
    };

    const handleDeleteClick = (id: string) => { setDeletingId(id); setIsConfirmOpen(true); };
    const handleConfirmDelete = () => {
        if (deletingId) {
            dataService.deleteNewcomer(deletingId);
            setNewcomers([...dataService.getNewcomers()]);
            if (selectedNewcomer?.id === deletingId) setSelectedNewcomer(null);
        }
        setIsConfirmOpen(false);
        setDeletingId(null);
    };

    const columns = useMemo<ColumnDef<Newcomer>[]>(() => [
        { header: 'Nom', cell: nc => (
            <div 
                className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer" 
                onClick={() => setSelectedNewcomer(nc)}
            >
                {nc.firstName} {nc.lastName}
            </div>
        )},
        { header: 'Contact', accessorKey: 'phone' },
        { header: 'Première Visite', accessorKey: 'firstVisitDate' },
        { header: 'Responsable', cell: nc => nc.assignedTo ? `${nc.assignedTo.prenom} ${nc.assignedTo.nom}` : 'Non assigné' },
        { header: 'Statut', cell: nc => <FollowUpStatusBadge status={nc.status} /> },
        { header: 'Actions', cell: nc => (
            <div className="flex space-x-2">
                <button onClick={() => handleOpenModal(nc)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                <button onClick={() => handleDeleteClick(nc.id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
            </div>
        )}
    ], []);

    if (selectedNewcomer) {
        return <NewcomerDetails newcomer={selectedNewcomer} onBack={() => setSelectedNewcomer(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">Suivi des Nouveaux Venus</h2>
                <Button variant="primary" leftIcon={<PlusIcon className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                    Ajouter un nouveau
                </Button>
            </div>

            <DataTable columns={columns} data={newcomers} exportFilename='nouveaux_venus' />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingNewcomer ? "Modifier Fiche" : "Ajouter Nouveau Venu"}>
                <NewcomerForm newcomer={editingNewcomer} onSave={handleSave} onCancel={handleCloseModal} />
            </Modal>

            <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} title="Confirmer la suppression" message="Êtes-vous sûr de vouloir supprimer cette fiche ? Cette action est irréversible." />
        </div>
    );
};

export default NewcomerFollowUpPage;
