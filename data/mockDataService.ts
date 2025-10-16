// This is a mock data service to simulate a backend.
import { faker } from '@faker-js/faker';
import {
  ChurchTenant, TenantStatus,
  User,
  Member, Gender, CivilStatus, MemberStatus, SpiritualStatus,
  Role, Permission,
  AuditLog,
  Group,
  StaffMember, StaffStatus,
  PlanningEvent,
  TrainingSession,
  Revenue, TransactionType, PaymentMethod,
  Expense, ExpenseStatus,
  Material, MaterialType, MaterialStatus,
  MaterialRequest, RequestStatus,
  Message, MessageStatus,
  Newcomer, FollowUpStatus,
  Interaction,
  MediaItem, MediaType,
  Volunteer,
  ProjectTeam
} from '../types';

// Using crypto for random IDs
const newId = () => crypto.randomUUID();

// --- DATA GENERATION ---

// Permissions (static)
const permissions: Permission[] = [
    { id: 'p1', module: 'Membres', action: 'Créer' },
    { id: 'p2', module: 'Membres', action: 'Lire' },
    { id: 'p3', module: 'Membres', action: 'Modifier' },
    { id: 'p4', module: 'Membres', action: 'Supprimer' },
    { id: 'p5', module: 'Finances', action: 'Lire' },
    { id: 'p6', module: 'Finances', action: 'Gérer' },
    { id: 'p7', module: 'Utilisateurs', action: 'Gérer' },
];

// Roles
let roles: Role[] = [
    { id: 'r1', tenantId: 't1', nom: 'Super Admin', description: 'Accès total à toutes les fonctionnalités', permissions: permissions },
    { id: 'r2', tenantId: 't1', nom: 'Admin système', description: 'Gère les utilisateurs et les paramètres', permissions: [permissions[1], permissions[6]] },
    { id: 'r3', tenantId: 't1', nom: 'Utilisateur simple', description: 'Accès limité', permissions: [permissions[1]] },
    { id: 'r4', tenantId: 't1', nom: 'Financier', description: 'Gère les finances', permissions: [permissions[4], permissions[5]] },
];
const roleNames = roles.map(r => r.nom);


// Users
let users: User[] = [
  { id: 'u1', tenantId: 't1', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@example.com', role: 'Super Admin', actif: true, multi_sites: true },
  { id: 'u2', tenantId: 't1', prenom: 'Marie', nom: 'Martin', email: 'marie.martin@example.com', role: 'Admin système', actif: true, multi_sites: false },
  { id: 'u3', tenantId: 't1', prenom: 'Paul', nom: 'Bernard', email: 'paul.bernard@example.com', role: 'Utilisateur simple', actif: false, multi_sites: false },
];
for (let i = 0; i < 25; i++) {
    users.push({
        id: newId(),
        tenantId: 't1',
        prenom: faker.person.firstName(),
        nom: faker.person.lastName(),
        email: faker.internet.email(),
        role: faker.helpers.arrayElement(roleNames),
        actif: faker.datatype.boolean(),
        multi_sites: faker.datatype.boolean(),
    });
}

// Members
let members: Member[] = [
    { id: 'm1', tenantId: 't1', firstName: 'Alice', lastName: 'Dubois', gender: Gender.Female, birthdate: '1990-05-20', email: 'alice.d@email.com', phone: '0612345678', address: '1 rue de la Paix', photoUrl: `https://i.pravatar.cc/150?u=m1`, civilStatus: CivilStatus.Single, status: MemberStatus.Active, spiritualStatus: SpiritualStatus.Baptized, joinedAt: '2018-03-10' },
    { id: 'm2', tenantId: 't1', firstName: 'Bob', lastName: 'Lefebvre', gender: Gender.Male, birthdate: '1985-11-12', email: 'bob.l@email.com', phone: '0687654321', address: '2 avenue de la Liberté', photoUrl: `https://i.pravatar.cc/150?u=m2`, civilStatus: CivilStatus.Married, status: MemberStatus.Active, spiritualStatus: SpiritualStatus.ActiveMember, joinedAt: '2015-07-22' },
];
for (let i = 0; i < 28; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    members.push({
        id: newId(),
        tenantId: 't1',
        firstName: firstName,
        lastName: lastName,
        gender: faker.helpers.arrayElement(Object.values(Gender)),
        birthdate: faker.date.birthdate({ min: 18, max: 70, mode: 'age' }).toISOString().split('T')[0],
        email: faker.internet.email({ firstName, lastName }),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        photoUrl: `https://i.pravatar.cc/150?u=${newId()}`,
        civilStatus: faker.helpers.arrayElement(Object.values(CivilStatus)),
        status: faker.helpers.arrayElement(Object.values(MemberStatus)),
        spiritualStatus: faker.helpers.arrayElement(Object.values(SpiritualStatus)),
        baptismDate: faker.datatype.boolean() ? faker.date.past({ years: 10 }).toISOString().split('T')[0] : undefined,
        conversionDate: faker.datatype.boolean() ? faker.date.past({ years: 15 }).toISOString().split('T')[0] : undefined,
        joinedAt: faker.date.past({ years: 5 }).toISOString().split('T')[0],
    });
}

// Tenants
let tenants: ChurchTenant[] = [
  { id: 't1', name: 'Église Centrale', slug: 'eglise-centrale', domain: 'centrale.erp-eglise.com', status: TenantStatus.Active, plan: 'Premium', admin: users[1], createdAt: '2023-01-15' },
];
const adminUsers = users.filter(u => u.role === 'Admin système' || u.role === 'Super Admin');
for (let i = 0; i < 25; i++) {
    const churchName = faker.company.name() + ' Church';
    tenants.push({
        id: newId(),
        name: churchName,
        slug: faker.helpers.slugify(churchName).toLowerCase(),
        domain: `${faker.helpers.slugify(churchName).toLowerCase()}.erp-eglise.com`,
        status: faker.helpers.arrayElement(Object.values(TenantStatus)),
        plan: faker.helpers.arrayElement(['Premium', 'Gratuit']),
        admin: faker.helpers.arrayElement(adminUsers.length > 0 ? adminUsers : users),
        createdAt: faker.date.past({ years: 2 }).toISOString().split('T')[0],
    });
}

// Audit Logs
let auditLogs: AuditLog[] = [
    { id: 'al1', tenantId: 't1', user_id: 'u1', userName: 'Jean Dupont', action: 'SUPPRESSION_UTILISATEUR', objet: 'Utilisateur', objet_id: 'u4', date: '2023-10-26 10:30:00', ip: '192.168.1.1' },
];
const actions = ['CREATION_UTILISATEUR', 'MODIFICATION_MEMBRE', 'SUPPRESSION_GROUPE', 'CONNEXION_REUSSIE', 'EXPORT_DONNEES'];
const objets = ['Utilisateur', 'Membre', 'Groupe', 'Session', 'Finance'];
for (let i = 0; i < 30; i++) {
    const user = faker.helpers.arrayElement(users);
    auditLogs.push({
        id: newId(),
        tenantId: 't1',
        user_id: user.id,
        userName: `${user.prenom} ${user.nom}`,
        action: faker.helpers.arrayElement(actions),
        objet: faker.helpers.arrayElement(objets),
        objet_id: newId(),
        date: faker.date.recent({ days: 30 }).toLocaleString('fr-FR'),
        ip: faker.internet.ip(),
    });
}

// Groups
let groups: Group[] = [
    { id: 'g1', tenantId: 't1', name: 'Groupe des Jeunes', description: 'Activités pour les jeunes de 18-25 ans', type: 'Jeunesse', leader: members[0], members: [members[0], members[1]], createdAt: '2022-09-01' },
];
const groupTypes = ['Jeunesse', 'Chorale', 'Accueil', 'Étude Biblique', 'Cellule de prière'];
for (let i = 0; i < 25; i++) {
    groups.push({
        id: newId(),
        tenantId: 't1',
        name: `${faker.helpers.arrayElement(groupTypes)} ${faker.location.city()}`,
        description: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(groupTypes),
        leader: faker.helpers.arrayElement(members),
        members: faker.helpers.arrayElements(members, faker.number.int({ min: 5, max: 15 })),
        createdAt: faker.date.past({ years: 3 }).toISOString().split('T')[0],
    });
}

// Staff
let staff: StaffMember[] = [
    { ...members[1], staffId: 's1', position: 'Pasteur Principal', department: 'Pastoral', hiredAt: '2010-01-01', staffStatus: StaffStatus.Employee, assignments: [] }
];
const positions = ['Pasteur Assistant', 'Secrétaire', 'Trésorier', 'Diacre', 'Responsable Sonorisation'];
const departments = ['Pastoral', 'Administration', 'Finances', 'Technique', 'Social'];
const staffMembersToAdd = faker.helpers.arrayElements(members.slice(2), 25);
for (const member of staffMembersToAdd) {
    if (!staff.find(s => s.id === member.id)) {
        staff.push({
            ...member,
            staffId: newId(),
            position: faker.helpers.arrayElement(positions),
            department: faker.helpers.arrayElement(departments),
            hiredAt: faker.date.past({ years: 5 }).toISOString().split('T')[0],
            staffStatus: faker.helpers.arrayElement(Object.values(StaffStatus)),
            assignments: [],
        });
    }
}

// Events
let events: PlanningEvent[] = [
    { id: 'ev1', tenantId: 't1', title: 'Culte du Dimanche', category: 'Service', start: new Date(), end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), location: 'Salle principale', attendees: [] },
];
const eventCategories = ['Service', 'Concert', 'Séminaire', 'Répétition', 'Réunion'];
for (let i = 0; i < 20; i++) {
    const start = faker.date.soon({ days: 30 });
    const end = new Date(start.getTime() + faker.number.int({ min: 1, max: 4 }) * 60 * 60 * 1000);
    events.push({
        id: newId(),
        tenantId: 't1',
        title: `${faker.helpers.arrayElement(eventCategories)} ${faker.word.verb()}`,
        category: faker.helpers.arrayElement(eventCategories),
        start: start,
        end: end,
        location: `Salle ${faker.number.int({min: 1, max: 5})}`,
        attendees: [],
    });
}

// Training
let trainingSessions: TrainingSession[] = [
    { id: 'ts1', tenantId: 't1', title: 'Formation des leaders', description: '...', instructor: 'Jean Dupont', startDate: '2023-11-04', endDate: '2023-11-04', location: 'Salle 2', participants: [{ member: members[0], status: 'Inscrit' }] }
];

// Finances
let revenues: Revenue[] = [
    { id: 'rev1', tenantId: 't1', type: TransactionType.Offering, amount: 50000, paymentDate: '2023-10-22', sourceDescription: 'Offrande du culte', paymentMethod: PaymentMethod.Cash },
];
for (let i = 0; i < 30; i++) {
    const sourceMember = faker.helpers.arrayElement(members);
    revenues.push({
        id: newId(),
        tenantId: 't1',
        type: faker.helpers.arrayElement(Object.values(TransactionType)),
        amount: faker.number.int({ min: 5000, max: 100000 }),
        paymentDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
        sourceMemberId: faker.datatype.boolean() ? sourceMember.id : undefined,
        sourceDescription: faker.datatype.boolean() ? `${sourceMember.firstName} ${sourceMember.lastName}` : 'Offrande du culte',
        paymentMethod: faker.helpers.arrayElement(Object.values(PaymentMethod)),
    });
}

let expenses: Expense[] = [
    { id: 'exp1', tenantId: 't1', description: 'Achat de microphones', amount: 75000, beneficiary: 'Music Store', expenseDate: '2023-10-20', costCenter: 'Sonorisation', status: ExpenseStatus.Approved, paymentMethod: PaymentMethod.Check },
];
const costCenters = ['Sonorisation', 'Loyer', 'Électricité', 'Mission', 'Social'];
for (let i = 0; i < 30; i++) {
    expenses.push({
        id: newId(),
        tenantId: 't1',
        description: faker.finance.transactionDescription(),
        amount: faker.number.int({ min: 10000, max: 200000 }),
        beneficiary: faker.company.name(),
        expenseDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
        costCenter: faker.helpers.arrayElement(costCenters),
        status: faker.helpers.arrayElement(Object.values(ExpenseStatus)),
        paymentMethod: faker.helpers.arrayElement(Object.values(PaymentMethod)),
    });
}

// Logistics
let materials: Material[] = [
    { id: 'mat1', tenantId: 't1', name: 'Micro Shure SM58', type: MaterialType.Sound, totalQuantity: 5, availableQuantity: 3, status: MaterialStatus.Good, location: 'Stock Son' },
];
for (let i = 0; i < 25; i++) {
    const totalQuantity = faker.number.int({ min: 1, max: 20 });
    materials.push({
        id: newId(),
        tenantId: 't1',
        name: faker.commerce.productName(),
        type: faker.helpers.arrayElement(Object.values(MaterialType)),
        totalQuantity: totalQuantity,
        availableQuantity: faker.number.int({ min: 0, max: totalQuantity }),
        status: faker.helpers.arrayElement(Object.values(MaterialStatus)),
        location: `Stock ${faker.number.int({ min: 1, max: 5 })}`,
    });
}

let materialRequests: MaterialRequest[] = [
    { id: 'mr1', tenantId: 't1', requesterId: 'u3', requesterName: 'Paul Bernard', eventName: 'Concert de Noël', requestDate: '2023-10-25', startDate: '2023-12-24', endDate: '2023-12-25', items: [{ materialId: 'mat1', quantity: 2 }], status: RequestStatus.Pending },
];
for (let i = 0; i < 25; i++) {
    const user = faker.helpers.arrayElement(users);
    const event = faker.helpers.arrayElement(events);
    if (!event) continue;
    materialRequests.push({
        id: newId(),
        tenantId: 't1',
        requesterId: user.id,
        requesterName: `${user.prenom} ${user.nom}`,
        eventId: event.id,
        eventName: event.title,
        requestDate: faker.date.recent({ days: 10 }).toISOString().split('T')[0],
        startDate: event.start.toISOString().split('T')[0],
        endDate: event.end.toISOString().split('T')[0],
        items: [{
            materialId: faker.helpers.arrayElement(materials).id,
            quantity: faker.number.int({ min: 1, max: 3 })
        }],
        status: faker.helpers.arrayElement(Object.values(RequestStatus)),
    });
}

// Communication
let messages: Message[] = [
    { id: 'msg1', tenantId: 't1', channel: 'SMS', content: 'Rappel: Répétition de la chorale ce soir à 19h.', recipients: [members[0]], sentAt: '2023-10-26 14:00:00', status: MessageStatus.Sent },
];
for (let i = 0; i < 25; i++) {
    const isSms = faker.datatype.boolean();
    messages.push({
        id: newId(),
        tenantId: 't1',
        channel: isSms ? 'SMS' : 'Email',
        subject: isSms ? undefined : faker.lorem.sentence(),
        content: faker.lorem.paragraph(),
        recipients: faker.helpers.arrayElements(members, faker.number.int({ min: 10, max: 50 })),
        sentAt: faker.date.recent({ days: 30 }).toLocaleString('fr-FR'),
        status: faker.helpers.arrayElement(Object.values(MessageStatus)),
    });
}

// CRM
let newcomers: Newcomer[] = [
    { id: 'nc1', tenantId: 't1', firstName: 'Lucie', lastName: 'Moreau', phone: '0712345678', firstVisitDate: '2023-10-22', cameFrom: 'Ami', status: FollowUpStatus.New, assignedTo: users[2] },
];
for (let i = 0; i < 25; i++) {
    newcomers.push({
        id: newId(),
        tenantId: 't1',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        firstVisitDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
        cameFrom: faker.helpers.arrayElement(['Ami', 'Internet', 'Passage', 'Invitation']),
        status: faker.helpers.arrayElement(Object.values(FollowUpStatus)),
        assignedTo: faker.helpers.arrayElement(users),
    });
}

let interactions: Interaction[] = [
    { id: 'int1', newcomerId: 'nc1', date: '2023-10-24', type: 'Appel', notes: 'Premier contact, très positif.', interactor: users[2] },
];

// Media
let mediaItems: MediaItem[] = [
    { id: 'med1', tenantId: 't1', title: 'Prédication du 22/10', type: MediaType.Video, url: '#', tags: ['prédication', 'dimanche'], uploader: users[1], uploadDate: '2023-10-23' },
];

// Volunteers
let volunteers: Volunteer[] = [
    { ...members[0], skills: ['Chant', 'Organisation'], availability: 'Weekends' },
];
const skills = ['Chant', 'Organisation', 'Musique', 'Enseignement', 'Accueil', 'Technique'];
const availabilities = ['Weekends', 'Soirs de semaine', 'Dimanche matin', 'Flexible'];
const volunteerMembers = faker.helpers.arrayElements(members.slice(2), 25);
for (const member of volunteerMembers) {
    if (!volunteers.find(v => v.id === member.id)) {
        volunteers.push({
            ...member,
            skills: faker.helpers.arrayElements(skills, faker.number.int({ min: 1, max: 3 })),
            availability: faker.helpers.arrayElement(availabilities),
        });
    }
}

let projectTeams: ProjectTeam[] = [
    { id: 'pt1', tenantId: 't1', name: 'Équipe d\'accueil', description: 'Accueil des membres et visiteurs', leader: members[0], members: [volunteers[0]], status: 'Active' },
];
const teamNames = ['Équipe d\'accueil', 'Équipe de louange', 'École du dimanche', 'Équipe technique', 'Comité social'];
for (let i = 0; i < 25; i++) {
    projectTeams.push({
        id: newId(),
        tenantId: 't1',
        name: `${faker.helpers.arrayElement(teamNames)} ${i + 1}`,
        description: faker.lorem.sentence(),
        leader: faker.helpers.arrayElement(members),
        members: faker.helpers.arrayElements(volunteers, faker.number.int({ min: 3, max: 10 })),
        status: faker.helpers.arrayElement(['Active', 'Inactive']),
    });
}


// Data Service
export const dataService = {
  // Tenants
  getTenants: () => tenants,
  getTenant: (id: string) => tenants.find(t => t.id === id),
  addTenant: (data: Omit<ChurchTenant, 'id'>) => { tenants.push({ ...data, id: newId() }); },
  updateTenant: (data: ChurchTenant) => { tenants = tenants.map(t => t.id === data.id ? data : t); },
  deleteTenant: (id: string) => { tenants = tenants.filter(t => t.id !== id); },

  // Users
  getUsers: () => users,
  getUser: (id: string) => users.find(u => u.id === id),
  addUser: (data: Omit<User, 'id'>) => { users.push({ ...data, id: newId() }); },
  updateUser: (data: User) => { users = users.map(u => u.id === data.id ? data : u); },
  deleteUser: (id: string) => { users = users.filter(u => u.id !== id); },
  
  // Members
  getMembers: () => members,
  getMember: (id: string) => members.find(m => m.id === id),
  addMember: (data: Omit<Member, 'id'>) => { members.push({ ...data, id: newId() }); },
  updateMember: (data: Member) => { members = members.map(m => m.id === data.id ? data : m); },
  deleteMember: (id: string) => { members = members.filter(m => m.id !== id); },

  // Roles
  getRoles: () => roles,
  getRole: (id: string) => roles.find(r => r.id === id),
  addRole: (data: Omit<Role, 'id'>) => { roles.push({ ...data, id: newId() }); },
  updateRole: (data: Role) => { roles = roles.map(r => r.id === data.id ? data : r); },
  deleteRole: (id: string) => { roles = roles.filter(r => r.id !== id); },
  getPermissions: () => permissions,

  // Audit Logs
  getAuditLogs: () => auditLogs,

  // Groups
  getGroups: () => groups,
  getGroup: (id: string) => groups.find(g => g.id === id),
  addGroup: (data: Omit<Group, 'id'>) => { groups.push({ ...data, id: newId() }); },
  updateGroup: (data: Group) => { groups = groups.map(g => g.id === data.id ? data : g); },
  deleteGroup: (id: string) => { groups = groups.filter(g => g.id !== id); },

  // Staff
  getStaff: () => staff,
  getStaffMember: (id: string) => staff.find(s => s.id === id),
  addStaff: (data: Omit<StaffMember, 'staffId'>) => { staff.push({ ...data, staffId: `s_${newId()}` }); },
  updateStaff: (data: StaffMember) => { staff = staff.map(s => s.staffId === data.staffId ? data : s); },
  deleteStaff: (id: string) => { staff = staff.filter(s => s.id !== id); },
  
  // Events
  getEvents: () => events,
  
  // Training
  getTrainingSessions: () => trainingSessions,
  getTrainingSession: (id: string) => trainingSessions.find(ts => ts.id === id),
  addTrainingSession: (data: Omit<TrainingSession, 'id'>) => { trainingSessions.push({ ...data, id: newId() }); },
  updateTrainingSession: (data: TrainingSession) => { trainingSessions = trainingSessions.map(ts => ts.id === data.id ? data : ts); },
  deleteTrainingSession: (id: string) => { trainingSessions = trainingSessions.filter(ts => ts.id !== id); },

  // Finances
  getRevenues: () => revenues,
  addRevenue: (data: Omit<Revenue, 'id'>) => { revenues.push({ ...data, id: newId() }); },
  updateRevenue: (data: Revenue) => { revenues = revenues.map(r => r.id === data.id ? data : r); },
  deleteRevenue: (id: string) => { revenues = revenues.filter(r => r.id !== id); },
  getExpenses: () => expenses,
  addExpense: (data: Omit<Expense, 'id'>) => { expenses.push({ ...data, id: newId() }); },
  updateExpense: (data: Expense) => { expenses = expenses.map(e => e.id === data.id ? data : e); },
  deleteExpense: (id: string) => { expenses = expenses.filter(e => e.id !== id); },
  
  // Logistics
  getMaterials: () => materials,
  addMaterial: (data: Omit<Material, 'id'>) => { materials.push({ ...data, id: newId() }); },
  updateMaterial: (data: Material) => { materials = materials.map(m => m.id === data.id ? data : m); },
  deleteMaterial: (id: string) => { materials = materials.filter(m => m.id !== id); },
  getMaterialRequests: () => materialRequests,
  addMaterialRequest: (data: Omit<MaterialRequest, 'id'>) => { materialRequests.push({ ...data, id: newId() }); },
  updateMaterialRequest: (data: MaterialRequest) => { materialRequests = materialRequests.map(r => r.id === data.id ? data : r); },
  deleteMaterialRequest: (id: string) => { materialRequests = materialRequests.filter(r => r.id !== id); },
  
  // Communication
  getMessages: () => messages,
  addMessage: (data: Omit<Message, 'id' | 'status' | 'sentAt'>) => { messages.unshift({ ...data, id: newId(), status: MessageStatus.Sent, sentAt: new Date().toLocaleString() }); },

  // CRM
  getNewcomers: () => newcomers,
  addNewcomer: (data: Omit<Newcomer, 'id'>) => { newcomers.push({ ...data, id: newId() }); },
  updateNewcomer: (data: Newcomer) => { newcomers = newcomers.map(n => n.id === data.id ? data : n); },
  deleteNewcomer: (id: string) => { newcomers = newcomers.filter(n => n.id !== id); },
  getInteractionsFor: (newcomerId: string) => interactions.filter(i => i.newcomerId === newcomerId),
  addInteraction: (data: Omit<Interaction, 'id'>) => { interactions.push({ ...data, id: newId() }); },
  
  // Media Library
  getMediaItems: () => mediaItems,
  addMediaItem: (data: Omit<MediaItem, 'id'>) => { mediaItems.push({ ...data, id: newId() }); },
  updateMediaItem: (data: MediaItem) => { mediaItems = mediaItems.map(m => m.id === data.id ? data : m); },
  deleteMediaItem: (id: string) => { mediaItems = mediaItems.filter(m => m.id !== id); },

  // Volunteers
  getVolunteers: () => volunteers,
  // Fix: The 'data' object at runtime includes the member's 'id', but it's omitted
  // from the type to signal an "add" operation. Cast it to the correct Volunteer type.
  addVolunteer: (data: Omit<Volunteer, 'id'>) => { volunteers.push(data as Volunteer); },
  updateVolunteer: (data: Volunteer) => { volunteers = volunteers.map(v => v.id === data.id ? data : v); },
  deleteVolunteer: (id: string) => { volunteers = volunteers.filter(v => v.id !== id); },
  getProjectTeams: () => projectTeams,
  addProjectTeam: (data: Omit<ProjectTeam, 'id'>) => { projectTeams.push({ ...data, id: newId() }); },
  updateProjectTeam: (data: ProjectTeam) => { projectTeams = projectTeams.map(pt => pt.id === data.id ? data : pt); },
  deleteProjectTeam: (id: string) => { projectTeams = projectTeams.filter(pt => pt.id !== id); },

};