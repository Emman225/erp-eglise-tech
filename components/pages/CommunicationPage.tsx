// components/pages/CommunicationPage.tsx
import React, { useState, useMemo } from 'react';
import { Message, MessageStatus } from '../../types';
import { dataService } from '../../data/mockDataService';
import Button from '../shared/Button';
import { PlusIcon } from '../icons/Icon';
import Modal from '../shared/Modal';
import MessageForm from '../communications/MessageForm';
import DataTable, { ColumnDef } from '../shared/DataTable';

const MessageStatusBadge: React.FC<{ status: MessageStatus }> = ({ status }) => {
  const baseClasses = 'px-2.5 py-0.5 text-xs font-medium rounded-full inline-block';
  const statusClasses = {
    [MessageStatus.Sent]: 'bg-green-100 text-green-800',
    [MessageStatus.Draft]: 'bg-gray-100 text-gray-800',
    [MessageStatus.Failed]: 'bg-red-100 text-red-800',
  };
  return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const CommunicationPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>(dataService.getMessages());
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveMessage = (data: Omit<Message, 'id' | 'status' | 'sentAt'>) => {
        dataService.addMessage(data);
        setMessages([...dataService.getMessages()]);
        setIsModalOpen(false);
    };

    const columns = useMemo<ColumnDef<Message>[]>(() => [
        {
            header: "Canal",
            cell: (msg) => <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{msg.channel}</span>,
        },
        {
            header: "Sujet / Contenu",
            cell: (msg) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{msg.subject || 'N/A'}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{msg.content}</div>
                </div>
            )
        },
        {
            header: "Destinataires",
            cell: (msg) => msg.recipients.length,
        },
        {
            header: "Date d'envoi",
            accessorKey: 'sentAt',
        },
        {
            header: "Statut",
            cell: (msg) => <MessageStatusBadge status={msg.status} />,
        }
    ], []);

    return (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">Communication</h2>
                <Button variant="primary" leftIcon={<PlusIcon className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
                    Nouveau Message
                </Button>
            </div>
            
            <DataTable columns={columns} data={messages} exportFilename="messages" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Envoyer un nouveau message" size="xl">
                <MessageForm onSave={handleSaveMessage} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default CommunicationPage;
