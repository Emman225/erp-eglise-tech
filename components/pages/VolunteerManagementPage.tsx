// components/pages/VolunteerManagementPage.tsx
import React, { useState, useMemo } from 'react';
import { ProjectTeam, Volunteer } from '../../types';
import { dataService } from '../../data/mockDataService';
import Button from '../shared/Button';
import { PlusIcon, EditIcon, DeleteIcon } from '../icons/Icon';
import Modal from '../shared/Modal';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import ProjectTeamDetails from '../volunteers/ProjectTeamDetails';
import VolunteerForm from '../volunteers/VolunteerForm';
import ProjectTeamForm from '../volunteers/ProjectTeamForm';
import DataTable, { ColumnDef } from '../shared/DataTable';

const VolunteerManagementPage: React.FC = () => {
    const [teams, setTeams] = useState<ProjectTeam[]>(dataService.getProjectTeams());
    const [volunteers, setVolunteers] = useState<Volunteer[]>(dataService.getVolunteers());
    const [activeTab, setActiveTab] = useState<'teams' | 'volunteers'>('teams');
    const [selectedTeam, setSelectedTeam] = useState<ProjectTeam | null>(null);

    const [isTeamModalOpen, setTeamModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<ProjectTeam | null>(null);
    const [isVolunteerModalOpen, setVolunteerModalOpen] = useState(false);
    const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<{ id: string; type: 'team' | 'volunteer' } | null>(null);

    // Handlers
    const handleOpenTeamModal = (team: ProjectTeam | null = null) => { setEditingTeam(team); setTeamModalOpen(true); };
    const handleSaveTeam = (data: Omit<ProjectTeam, 'id'> | ProjectTeam) => {
        if ('id' in data) dataService.updateProjectTeam(data); else dataService.addProjectTeam(data as Omit<ProjectTeam, 'id'>);
        setTeams([...dataService.getProjectTeams()]); setTeamModalOpen(false);
    };
    const handleOpenVolunteerModal = (volunteer: Volunteer | null = null) => { setEditingVolunteer(volunteer); setVolunteerModalOpen(true); };
    const handleSaveVolunteer = (data: Omit<Volunteer, 'id'> | Volunteer) => {
        if ('id' in data) dataService.updateVolunteer(data as Volunteer); else dataService.addVolunteer(data as Omit<Volunteer, 'id'>);
        setVolunteers([...dataService.getVolunteers()]); setVolunteerModalOpen(false);
    };
    const handleDeleteClick = (id: string, type: 'team' | 'volunteer') => { setDeletingItem({ id, type }); setIsConfirmOpen(true); };
    const handleConfirmDelete = () => {
        if (!deletingItem) return;
        if (deletingItem.type === 'team') {
            dataService.deleteProjectTeam(deletingItem.id); setTeams([...dataService.getProjectTeams()]);
            if (selectedTeam?.id === deletingItem.id) setSelectedTeam(null);
        } else {
            dataService.deleteVolunteer(deletingItem.id); setVolunteers([...dataService.getVolunteers()]);
        }
        setIsConfirmOpen(false); setDeletingItem(null);
    };

    const teamColumns = useMemo<ColumnDef<ProjectTeam>[]>(() => [
        { header: 'Nom', cell: t => (
            <div>
                <div className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer" onClick={() => setSelectedTeam(t)}>{t.name}</div>
                <div className="text-xs text-gray-500">{t.description}</div>
            </div>
        )},
        { header: 'Leader', cell: t => `${t.leader.firstName} ${t.leader.lastName}` },
        { header: 'Membres', cell: t => t.members.length },
        { header: 'Statut', cell: t => <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{t.status}</span> },
        { header: 'Actions', cell: t => (
            <div className="flex space-x-2">
                <button onClick={() => handleOpenTeamModal(t)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                <button onClick={() => handleDeleteClick(t.id, 'team')} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
            </div>
        )}
    ], []);

    const volunteerColumns = useMemo<ColumnDef<Volunteer>[]>(() => [
        { header: 'Nom', cell: v => `${v.firstName} ${v.lastName}` },
        { header: 'Compétences', cell: v => v.skills.join(', ') },
        { header: 'Disponibilité', accessorKey: 'availability' },
        { header: 'Actions', cell: v => (
            <div className="flex space-x-2">
                <button onClick={() => handleOpenVolunteerModal(v)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                <button onClick={() => handleDeleteClick(v.id, 'volunteer')} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
            </div>
        )}
    ], []);

    if (selectedTeam) {
        return <ProjectTeamDetails team={selectedTeam} onBack={() => setSelectedTeam(null)} />;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">Gestion des Bénévoles et Équipes Projet</h2>

            <div className="flex justify-between items-center border-b border-gray-200">
                <div className="flex">
                    <button onClick={() => setActiveTab('teams')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'teams' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Équipes Projet</button>
                    <button onClick={() => setActiveTab('volunteers')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'volunteers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Liste des Bénévoles</button>
                </div>
                 <Button variant="primary" leftIcon={<PlusIcon className="w-4 h-4" />} onClick={() => activeTab === 'teams' ? handleOpenTeamModal() : handleOpenVolunteerModal()}>
                    {activeTab === 'teams' ? 'Créer une équipe' : 'Ajouter un bénévole'}
                </Button>
            </div>

            {activeTab === 'teams' && <DataTable columns={teamColumns} data={teams} exportFilename="equipes_projet" />}
            {activeTab === 'volunteers' && <DataTable columns={volunteerColumns} data={volunteers} exportFilename="benevoles" />}

            <Modal isOpen={isTeamModalOpen} onClose={() => setTeamModalOpen(false)} title={editingTeam ? "Modifier l'équipe" : "Créer une équipe projet"} size="xl">
                <ProjectTeamForm team={editingTeam} onSave={handleSaveTeam} onCancel={() => setTeamModalOpen(false)} />
            </Modal>
            <Modal isOpen={isVolunteerModalOpen} onClose={() => setVolunteerModalOpen(false)} title={editingVolunteer ? "Modifier le bénévole" : "Ajouter un bénévole"}>
                <VolunteerForm volunteer={editingVolunteer} onSave={handleSaveVolunteer} onCancel={() => setVolunteerModalOpen(false)} />
            </Modal>

            <ConfirmationDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} title="Confirmer la suppression" message="Êtes-vous sûr de vouloir supprimer cet élément ?" />
        </div>
    );
};

export default VolunteerManagementPage;
