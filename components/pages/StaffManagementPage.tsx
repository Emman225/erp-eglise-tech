// components/pages/StaffManagementPage.tsx
import React, { useState, useMemo } from 'react';
import { StaffMember } from '../../types';
import { dataService } from '../../data/mockDataService';
import Button from '../shared/Button';
import { PlusIcon, EditIcon, DeleteIcon } from '../icons/Icon';
import Modal from '../shared/Modal';
import StaffForm from '../staff/StaffForm';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import StaffProfile from '../staff/StaffProfile';
import DataTable, { ColumnDef } from '../shared/DataTable';

const StaffManagementPage: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>(dataService.getStaff());
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);

    const handleOpenModal = (staffMember: StaffMember | null = null) => {
        setEditingStaff(staffMember);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingStaff(null);
        setIsModalOpen(false);
    };

    const handleSaveStaff = (staffData: Omit<StaffMember, 'staffId'> | StaffMember) => {
        if ('staffId' in staffData && staffData.staffId) {
            dataService.updateStaff(staffData as StaffMember);
        } else {
            dataService.addStaff(staffData as Omit<StaffMember, 'staffId'>);
        }
        setStaff([...dataService.getStaff()]);
        handleCloseModal();
        if (selectedStaff && 'id' in staffData && selectedStaff.id === staffData.id) {
            setSelectedStaff(dataService.getStaffMember(staffData.id) ?? null);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeletingStaffId(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deletingStaffId) {
            dataService.deleteStaff(deletingStaffId);
            setStaff([...dataService.getStaff()]);
        }
        setIsConfirmOpen(false);
        setDeletingStaffId(null);
        if (selectedStaff && selectedStaff.id === deletingStaffId) {
            setSelectedStaff(null);
        }
    };

    const columns = useMemo<ColumnDef<StaffMember>[]>(() => [
        {
            header: 'Nom',
            cell: (staffMember) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={staffMember.photoUrl} alt="" />
                    </div>
                    <div className="ml-4">
                        <div 
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                            onClick={() => setSelectedStaff(staffMember)}
                        >
                            {staffMember.firstName} {staffMember.lastName}
                        </div>
                        <div className="text-xs text-gray-500">{staffMember.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Poste',
            accessorKey: 'position',
        },
        {
            header: 'Département',
            accessorKey: 'department',
        },
        {
            header: 'Statut',
            accessorKey: 'staffStatus',
            cell: (staffMember) => <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{staffMember.staffStatus}</span>
        },
        {
            header: "Date d'embauche",
            accessorKey: 'hiredAt',
        },
        {
            header: 'Actions',
            cell: (staffMember) => (
                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900" onClick={() => handleOpenModal(staffMember)}><EditIcon /></button>
                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteClick(staffMember.id)}><DeleteIcon /></button>
                </td>
            )
        }
    ], []);

    if (selectedStaff) {
        return <StaffProfile staffMember={selectedStaff} onBack={() => setSelectedStaff(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">Liste du Personnel</h2>
                <Button variant="primary" leftIcon={<PlusIcon className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                    Ajouter un membre du personnel
                </Button>
            </div>

            <DataTable columns={columns} data={staff} exportFilename='personnel' />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingStaff ? "Modifier le membre du personnel" : "Ajouter un membre du personnel"}>
                <StaffForm staffMember={editingStaff} onSave={handleSaveStaff} onCancel={handleCloseModal} />
            </Modal>

            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer ce membre du personnel ? Cette action est irréversible."
            />
        </div>
    );
};

export default StaffManagementPage;
