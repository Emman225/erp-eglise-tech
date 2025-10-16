// components/attendance/AttendanceSheetView.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { PlanningEvent, Member } from '../../types';
import { dataService } from '../../data/mockDataService';
import Button from '../shared/Button';
import DataTable, { ColumnDef } from '../shared/DataTable';
import Card from '../shared/Card';

interface AttendanceSheetViewProps {
  event: PlanningEvent;
  onBack: () => void;
}

const AttendanceSheetView: React.FC<AttendanceSheetViewProps> = ({ event, onBack }) => {
    const [members] = useState<Member[]>(dataService.getMembers()); // In real app, might be event.attendees
    const [attendance, setAttendance] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Initialize attendance state
        const initialAttendance = members.reduce((acc, member) => {
            acc[member.id] = false;
            return acc;
        }, {} as Record<string, boolean>);
        setAttendance(initialAttendance);
    }, [members]);
    
    const handleToggle = (memberId: string) => {
        setAttendance(prev => ({
            ...prev,
            [memberId]: !prev[memberId],
        }));
    };

    const presentCount = Object.values(attendance).filter(Boolean).length;
    const absentCount = members.length - presentCount;

    const columns = useMemo<ColumnDef<Member>[]>(() => [
        {
            header: 'Nom',
            cell: (member) => (
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img className="h-10 w-10 rounded-full" src={member.photoUrl} alt="" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
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
            header: 'Présent',
            cell: (member) => (
                <div className="flex justify-center">
                    <input
                        type="checkbox"
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        checked={attendance[member.id] || false}
                        onChange={() => handleToggle(member.id)}
                    />
                </div>
            )
        }
    ], [attendance]);

    return (
        <div className="space-y-6">
            <div>
                 <Button variant="secondary" onClick={onBack}>&larr; Retour à la liste des événements</Button>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">Feuille de présence: {event.title}</h2>
                <p className="text-gray-500">{event.start.toLocaleString()}</p>
            </div>
            
            <Card>
                <div className="p-4 flex justify-between items-center border-b">
                    <h3 className="font-semibold text-gray-700">Liste des Membres</h3>
                    <div className="text-sm space-x-4">
                        <span className="text-green-600 font-medium">Présents: {presentCount}</span>
                        <span className="text-red-600 font-medium">Absents: {absentCount}</span>
                         <Button variant="primary" size="sm">Enregistrer la présence</Button>
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    {/* The DataTable does not fit well here because it has its own Card wrapper.
                    We will use a simplified table but keep the structure similar.
                    A better approach would be to make the DataTable's Card optional.
                    For now, this is a pragmatic solution. */}
                     <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                {columns.map(col => <th key={col.header} className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{col.header}</th>)}
                            </tr>
                         </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {members.map(member => (
                                <tr key={member.id}>
                                    {columns.map(col => (
                                        <td key={col.header} className="px-6 py-4 whitespace-nowrap">
                                            {col.cell ? col.cell(member) : ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                         </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AttendanceSheetView;
