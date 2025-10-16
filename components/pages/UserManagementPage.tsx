// components/pages/UserManagementPage.tsx
import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { dataService } from '../../data/mockDataService';
import Button from '../shared/Button';
import { PlusIcon, EditIcon, DeleteIcon } from '../icons/Icon';
import Modal from '../shared/Modal';
import UserForm from '../users/UserForm';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import DataTable, { ColumnDef } from '../shared/DataTable';

const UserStatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    const baseClasses = 'px-2.5 py-0.5 text-xs font-medium rounded-full inline-block';
    const statusClasses = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    return <span className={`${baseClasses} ${statusClasses}`}>{isActive ? 'Actif' : 'Inactif'}</span>;
};

const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>(dataService.getUsers());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const handleOpenModal = (user: User | null = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };

    const handleSaveUser = (userData: Omit<User, 'id'> | User) => {
        if ('id' in userData) {
            dataService.updateUser(userData);
        } else {
            dataService.addUser(userData as Omit<User, 'id'>);
        }
        setUsers([...dataService.getUsers()]);
        handleCloseModal();
    };
    
    const handleDeleteClick = (id: string) => {
        setDeletingUserId(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if(deletingUserId) {
            dataService.deleteUser(deletingUserId);
            setUsers([...dataService.getUsers()]);
        }
        setIsConfirmOpen(false);
        setDeletingUserId(null);
    };

    const columns = useMemo<ColumnDef<User>[]>(() => [
        {
            header: 'Nom',
            cell: (user) => `${user.prenom} ${user.nom}`
        },
        {
            header: 'Email',
            accessorKey: 'email'
        },
        {
            header: 'Rôle',
            accessorKey: 'role'
        },
        {
            header: 'Statut',
            accessorKey: 'actif',
            cell: (user) => <UserStatusBadge isActive={user.actif} />
        },
        {
            header: 'Actions',
            cell: (user) => (
                <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900" onClick={() => handleOpenModal(user)}><EditIcon/></button>
                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteClick(user.id)}><DeleteIcon/></button>
                </div>
            )
        }
    ], []);

    return (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-700">Liste des Utilisateurs</h2>
            <Button variant="primary" leftIcon={<PlusIcon className="w-4 h-4"/>} onClick={() => handleOpenModal()}>
              Créer un utilisateur
            </Button>
          </div>

          <DataTable columns={columns} data={users} exportFilename='utilisateurs' />

           <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? "Modifier l'utilisateur" : "Créer un utilisateur"}>
                <UserForm user={editingUser} onSave={handleSaveUser} onCancel={handleCloseModal} />
           </Modal>

           <ConfirmationDialog 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
            />
        </div>
    );
};

export default UserManagementPage;
