// components/pages/GroupManagementPage.tsx
import React, { useState, useMemo } from 'react';
import { Group } from '../../types';
import { dataService } from '../../data/mockDataService';
import Button from '../shared/Button';
import { PlusIcon, EditIcon, DeleteIcon } from '../icons/Icon';
import Modal from '../shared/Modal';
import GroupForm from '../groups/GroupForm';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import GroupDetails from '../groups/GroupDetails';
import DataTable, { ColumnDef } from '../shared/DataTable';

const GroupManagementPage: React.FC = () => {
    const [groups, setGroups] = useState<Group[]>(dataService.getGroups());
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

    const handleOpenModal = (group: Group | null = null) => {
        setEditingGroup(group);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingGroup(null);
        setIsModalOpen(false);
    };

    const handleSaveGroup = (groupData: Omit<Group, 'id'> | Group) => {
        if ('id' in groupData) {
            dataService.updateGroup(groupData);
        } else {
            dataService.addGroup(groupData as Omit<Group, 'id'>);
        }
        setGroups([...dataService.getGroups()]);
        handleCloseModal();
        if (selectedGroup && 'id' in groupData && selectedGroup.id === groupData.id) {
            setSelectedGroup(dataService.getGroup(groupData.id) ?? null);
        }
    };

    const handleDeleteClick = (id: string) => {
        setDeletingGroupId(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deletingGroupId) {
            dataService.deleteGroup(deletingGroupId);
            setGroups([...dataService.getGroups()]);
            if (selectedGroup && selectedGroup.id === deletingGroupId) {
                setSelectedGroup(null);
            }
        }
        setIsConfirmOpen(false);
        setDeletingGroupId(null);
    };

    const columns = useMemo<ColumnDef<Group>[]>(() => [
        {
            header: "Nom du Groupe",
            cell: (group) => (
                <div>
                    <div 
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                        onClick={() => setSelectedGroup(group)}
                    >
                        {group.name}
                    </div>
                    <div className="text-xs text-gray-500">{group.description}</div>
                </div>
            )
        },
        {
            header: "Type",
            accessorKey: "type",
            cell: (group) => <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{group.type}</span>
        },
        {
            header: "Leader",
            cell: (group) => `${group.leader.firstName} ${group.leader.lastName}`
        },
        {
            header: "Membres",
            cell: (group) => group.members.length
        },
        {
            header: "Créé le",
            accessorKey: "createdAt"
        },
        {
            header: "Actions",
            cell: (group) => (
                <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900" onClick={() => handleOpenModal(group)}><EditIcon /></button>
                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteClick(group.id)}><DeleteIcon /></button>
                </div>
            )
        }
    ], []);
    
    if (selectedGroup) {
        return <GroupDetails group={selectedGroup} onBack={() => setSelectedGroup(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">Liste des Groupes</h2>
                <Button variant="primary" leftIcon={<PlusIcon className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                    Créer un groupe
                </Button>
            </div>

            <DataTable columns={columns} data={groups} exportFilename='groupes' />

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingGroup ? "Modifier le groupe" : "Créer un groupe"}>
                <GroupForm group={editingGroup} onSave={handleSaveGroup} onCancel={handleCloseModal} />
            </Modal>

            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible."
            />
        </div>
    );
};

export default GroupManagementPage;
