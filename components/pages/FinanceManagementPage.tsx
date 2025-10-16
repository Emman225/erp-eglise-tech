// components/pages/FinanceManagementPage.tsx
import React, { useState, useMemo } from 'react';
import { Revenue, Expense, ExpenseStatus, TransactionType } from '../../types';
import { dataService } from '../../data/mockDataService';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { PlusIcon, EditIcon, DeleteIcon, CheckBadgeIcon } from '../icons/Icon';
import Modal from '../shared/Modal';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import RevenueForm from '../finances/RevenueForm';
import ExpenseForm from '../finances/ExpenseForm';
import DataTable, { ColumnDef } from '../shared/DataTable';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <Card className={`p-5 ${color}`}>
        <h4 className="text-sm font-medium text-white/80">{title}</h4>
        <p className="text-3xl font-bold text-white">{value}</p>
    </Card>
);

const RevenueTypeBadge: React.FC<{ type: TransactionType }> = ({ type }) => {
    const colors = {
        [TransactionType.Tithe]: 'bg-blue-100 text-blue-800',
        [TransactionType.Offering]: 'bg-green-100 text-green-800',
        [TransactionType.Contribution]: 'bg-yellow-100 text-yellow-800',
        [TransactionType.Donation]: 'bg-purple-100 text-purple-800',
        [TransactionType.Other]: 'bg-gray-100 text-gray-800',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full inline-block ${colors[type]}`}>{type}</span>;
};

const ExpenseStatusBadge: React.FC<{ status: ExpenseStatus }> = ({ status }) => {
    const colors = {
        [ExpenseStatus.Pending]: 'bg-yellow-100 text-yellow-800',
        [ExpenseStatus.Approved]: 'bg-green-100 text-green-800',
        [ExpenseStatus.Rejected]: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full inline-block ${colors[status]}`}>{status}</span>;
};


const FinanceManagementPage: React.FC = () => {
    const [revenues, setRevenues] = useState<Revenue[]>(dataService.getRevenues());
    const [expenses, setExpenses] = useState<Expense[]>(dataService.getExpenses());
    const [activeTab, setActiveTab] = useState<'revenues' | 'expenses'>('revenues');

    const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
    const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<{ id: string; type: 'revenue' | 'expense' } | null>(null);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount);
    };

    const totals = useMemo(() => {
        const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
        const totalExpense = expenses.filter(e => e.status === ExpenseStatus.Approved).reduce((sum, e) => sum + e.amount, 0);
        return {
            revenue: totalRevenue,
            expense: totalExpense,
            balance: totalRevenue - totalExpense,
        };
    }, [revenues, expenses]);

    // Revenue Handlers
    const handleOpenRevenueModal = (revenue: Revenue | null = null) => {
        setEditingRevenue(revenue);
        setIsRevenueModalOpen(true);
    };
    const handleSaveRevenue = (data: Omit<Revenue, 'id'> | Revenue) => {
        if ('id' in data) dataService.updateRevenue(data);
        else dataService.addRevenue(data as Omit<Revenue, 'id'>);
        setRevenues([...dataService.getRevenues()]);
        setIsRevenueModalOpen(false);
    };

    // Expense Handlers
    const handleOpenExpenseModal = (expense: Expense | null = null) => {
        setEditingExpense(expense);
        setIsExpenseModalOpen(true);
    };
    const handleSaveExpense = (data: Omit<Expense, 'id'> | Expense) => {
        if ('id' in data) dataService.updateExpense(data);
        else dataService.addExpense(data as Omit<Expense, 'id'>);
        setExpenses([...dataService.getExpenses()]);
        setIsExpenseModalOpen(false);
    };
    const handleApproveExpense = (expense: Expense) => {
        const updatedExpense = { ...expense, status: ExpenseStatus.Approved };
        dataService.updateExpense(updatedExpense);
        setExpenses([...dataService.getExpenses()]);
    }

    // Delete Handlers
    const handleDeleteClick = (id: string, type: 'revenue' | 'expense') => {
        setDeletingItem({ id, type });
        setIsConfirmOpen(true);
    };
    const handleConfirmDelete = () => {
        if (!deletingItem) return;
        if (deletingItem.type === 'revenue') {
            dataService.deleteRevenue(deletingItem.id);
            setRevenues([...dataService.getRevenues()]);
        } else {
            dataService.deleteExpense(deletingItem.id);
            setExpenses([...dataService.getExpenses()]);
        }
        setIsConfirmOpen(false);
        setDeletingItem(null);
    };

    const revenueColumns = useMemo<ColumnDef<Revenue>[]>(() => [
        { header: 'Type', cell: r => <RevenueTypeBadge type={r.type} /> },
        { header: 'Montant', cell: r => formatCurrency(r.amount) },
        { header: 'Date', accessorKey: 'paymentDate' },
        { header: 'Source', accessorKey: 'sourceDescription' },
        { header: 'Mode Paiement', accessorKey: 'paymentMethod' },
        { header: 'Actions', cell: r => (
            <div className="flex space-x-2">
                <button onClick={() => handleOpenRevenueModal(r)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                <button onClick={() => handleDeleteClick(r.id, 'revenue')} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
            </div>
        )}
    ], []);

    const expenseColumns = useMemo<ColumnDef<Expense>[]>(() => [
        { header: 'Description', accessorKey: 'description' },
        { header: 'Montant', cell: e => formatCurrency(e.amount) },
        { header: 'Date', accessorKey: 'expenseDate' },
        { header: 'Centre de Coût', accessorKey: 'costCenter' },
        { header: 'Statut', cell: e => <ExpenseStatusBadge status={e.status} /> },
        { header: 'Actions', cell: e => (
            <div className="flex space-x-2">
                {e.status === ExpenseStatus.Pending && (
                    <button onClick={() => handleApproveExpense(e)} className="text-green-600 hover:text-green-900" title="Valider"><CheckBadgeIcon className="w-5 h-5"/></button>
                )}
                <button onClick={() => handleOpenExpenseModal(e)} className="text-blue-600 hover:text-blue-900"><EditIcon /></button>
                <button onClick={() => handleDeleteClick(e.id, 'expense')} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
            </div>
        )}
    ], []);


    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-700">Tableau de Bord Financier</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total des Revenus" value={formatCurrency(totals.revenue)} color="bg-green-500" />
                <StatCard title="Total des Dépenses (Validées)" value={formatCurrency(totals.expense)} color="bg-red-500" />
                <StatCard title="Solde Actuel" value={formatCurrency(totals.balance)} color="bg-blue-500" />
            </div>

            <div>
                <div className="flex justify-between items-center border-b border-gray-200">
                    <div className="flex">
                        <button onClick={() => setActiveTab('revenues')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'revenues' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Revenus
                        </button>
                        <button onClick={() => setActiveTab('expenses')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'expenses' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Dépenses
                        </button>
                    </div>
                     <Button variant="primary" leftIcon={<PlusIcon className="w-4 h-4" />} onClick={() => activeTab === 'revenues' ? handleOpenRevenueModal() : handleOpenExpenseModal()}>
                        {activeTab === 'revenues' ? 'Ajouter un revenu' : 'Ajouter une dépense'}
                    </Button>
                </div>

                <div className="mt-4">
                    {activeTab === 'revenues' && <DataTable columns={revenueColumns} data={revenues} exportFilename='revenus' />}
                    {activeTab === 'expenses' && <DataTable columns={expenseColumns} data={expenses} exportFilename='depenses' />}
                </div>
            </div>

            <Modal isOpen={isRevenueModalOpen} onClose={() => setIsRevenueModalOpen(false)} title={editingRevenue ? "Modifier un revenu" : "Ajouter un revenu"}>
                <RevenueForm revenue={editingRevenue} onSave={handleSaveRevenue} onCancel={() => setIsRevenueModalOpen(false)} />
            </Modal>

            <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title={editingExpense ? "Modifier une dépense" : "Ajouter une dépense"}>
                <ExpenseForm expense={editingExpense} onSave={handleSaveExpense} onCancel={() => setIsExpenseModalOpen(false)} />
            </Modal>
            
            <ConfirmationDialog 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible."
            />
        </div>
    );
};

export default FinanceManagementPage;
