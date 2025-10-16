// components/pages/MemberManagementPage.tsx
import React, { useState, useMemo } from 'react';
import { Member, MemberStatus, SpiritualStatus } from '../../types';
import { dataService } from '../../data/mockDataService';
import Button from '../shared/Button';
import { PlusIcon, EditIcon, DeleteIcon } from '../icons/Icon';
import MemberProfile from '../members/MemberProfile';
import Modal from '../shared/Modal';
import MemberForm from '../members/MemberForm';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import DataTable, { ColumnDef } from '../shared/DataTable';

export const MemberStatusBadge: React.FC<{ status: MemberStatus }> = ({ status }) => {
  const baseClasses = 'px-2.5 py-0.5 text-xs font-medium rounded-full inline-block capitalize';
  const statusClasses = {
    [MemberStatus.Active]: 'bg-green-100 text-green-800',
    [MemberStatus.Inactive]: 'bg-gray-100 text-gray-800',
    [MemberStatus.Archived]: 'bg-yellow-100 text-yellow-800',
    [MemberStatus.Deceased]: 'bg-red-100 text-red-800',
    [MemberStatus.Transferred]: 'bg-blue-100 text-blue-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

export const SpiritualStatusBadge: React.FC<{ status: SpiritualStatus }> = ({ status }) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded-full inline-block capitalize';
    const statusClasses = {
      [SpiritualStatus.New]: 'bg-purple-100 text-purple-800',
      [SpiritualStatus.Baptized]: 'bg-sky-100 text-sky-800',
      [SpiritualStatus.ActiveMember]: 'bg-indigo-100 text-indigo-800',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
  };

const MemberManagementPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(dataService.getMembers());
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const handleUpdateMember = (updatedMember: Member) => {
    dataService.updateMember(updatedMember);
    setMembers([...dataService.getMembers()]);
    setSelectedMember(updatedMember); // Update the profile view
  };

  const handleOpenModal = (member: Member | null = null) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingMember(null);
    setIsModalOpen(false);
  };
  
  const handleSaveMember = (memberData: Omit<Member, 'id'> | Member) => {
    if ('id' in memberData) {
      dataService.updateMember(memberData);
    } else {
      dataService.addMember(memberData as Omit<Member, 'id'>);
    }
    setMembers([...dataService.getMembers()]);
    handleCloseModal();
  };
  
  const handleDeleteClick = (id: string) => {
    setDeletingMemberId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if(deletingMemberId) {
        dataService.deleteMember(deletingMemberId);
        setMembers([...dataService.getMembers()]);
        if (selectedMember && selectedMember.id === deletingMemberId) {
            setSelectedMember(null);
        }
    }
    setIsConfirmOpen(false);
    setDeletingMemberId(null);
  };

  const columns = useMemo<ColumnDef<Member>[]>(() => [
    {
      header: 'Nom',
      cell: (member) => (
        <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
                <img className="h-10 w-10 rounded-full" src={member.photoUrl} alt="" />
            </div>
            <div className="ml-4">
                <div 
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer" 
                    onClick={() => setSelectedMember(member)}
                >
                    {member.firstName} {member.lastName}
                </div>
                <div className="text-xs text-gray-500">{member.gender}, {new Date().getFullYear() - new Date(member.birthdate).getFullYear()} ans</div>
            </div>
        </div>
      )
    },
    {
      header: 'Contact',
      cell: (member) => (
        <div>
            <div className="text-sm text-gray-900">{member.email}</div>
            <div className="text-sm text-gray-500">{member.phone}</div>
        </div>
      )
    },
    {
      header: 'Statut Membre',
      accessorKey: 'status',
      cell: (member) => <MemberStatusBadge status={member.status} />
    },
    {
      header: 'Statut Spirituel',
      accessorKey: 'spiritualStatus',
      cell: (member) => <SpiritualStatusBadge status={member.spiritualStatus} />
    },
    {
      header: 'Inscrit le',
      accessorKey: 'joinedAt'
    },
    {
      header: 'Actions',
      cell: (member) => (
        <div className="flex space-x-2">
            <button className="text-blue-600 hover:text-blue-900" onClick={() => handleOpenModal(member)}><EditIcon/></button>
            <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteClick(member.id)}><DeleteIcon/></button>
        </div>
      )
    }
  ], []);

  if (selectedMember) {
    return <MemberProfile 
                member={selectedMember} 
                onBack={() => setSelectedMember(null)}
                onUpdate={handleUpdateMember}
            />;
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-700">Liste des Membres</h2>
        <div className="space-x-2">
            <Button variant="secondary">Importer</Button>
            <Button variant="primary" leftIcon={<PlusIcon className="w-4 h-4"/>} onClick={() => handleOpenModal()}>
              Ajouter un membre
            </Button>
        </div>
      </div>

      <DataTable columns={columns} data={members} exportFilename='membres' />
      
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMember ? "Modifier le membre" : "Ajouter un membre"}>
        <MemberForm member={editingMember} onSave={handleSaveMember} onCancel={handleCloseModal} />
      </Modal>

      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible."
      />
    </div>
  );
};

export default MemberManagementPage;
