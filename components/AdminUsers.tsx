import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { getUsers, createUser, updateUser, deleteUser, MOCK_COMPANIES } from '../services/authService';
import { Trash2, Plus, User, Building, Pencil, AlertTriangle, X } from 'lucide-react';

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals State
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: 'user' as UserRole,
        company_id: '',
        active: true,
        password: '' // Mock password field for edit
    });

    const loadUsers = async () => {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
        // Set default company for create
        if (MOCK_COMPANIES.length > 0) {
            setFormData(prev => ({ ...prev, company_id: MOCK_COMPANIES[0].id }));
        }
    }, []);

    // Helper to generate slug from text (remove accents, spaces, special chars)
    const slugify = (text: string) => {
        return text
            .toString()
            .normalize('NFD') // Split accents
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .toLowerCase()
            .replace(/\s+/g, '') // Remove spaces
            .replace(/[^\w-]+/g, '') // Remove non-word chars
            .replace(/--+/g, '-') // Replace multiple - with single -
            .trim();
    };

    // Generate dynamic email based on name and company ID
    const generateEmail = (name: string, companyId: string) => {
        const company = MOCK_COMPANIES.find(c => c.id === companyId);
        const companySlug = company ? slugify(company.name) : 'empresa';
        const nameSlug = slugify(name);
        return `${nameSlug}@${companySlug}`;
    };

    const openCreateModal = () => {
        setModalMode('create');
        const defaultCompanyId = MOCK_COMPANIES[0]?.id || '';

        setFormData({
            full_name: '',
            email: generateEmail('', defaultCompanyId), // Initialize empty mask
            role: 'user',
            company_id: defaultCompanyId,
            active: true,
            password: ''
        });
        setShowModal(true);
    };

    const openEditModal = (user: UserProfile) => {
        setModalMode('edit');
        setUserToEdit(user);
        setFormData({
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            company_id: user.company_id,
            active: user.active,
            password: ''
        });
        setShowModal(true);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;

        // Update Name
        const updatedData = { ...formData, full_name: newName };

        // If in create mode, auto-generate email
        if (modalMode === 'create') {
            updatedData.email = generateEmail(newName, formData.company_id);
        }

        setFormData(updatedData);
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCompanyId = e.target.value;

        // Update Company
        const updatedData = { ...formData, company_id: newCompanyId };

        // If in create mode, auto-generate email based on current name and new company
        if (modalMode === 'create') {
        };

        const handleDelete = async () => {
            if (userToDelete) {
                await deleteUser(userToDelete.id);
                setShowDeleteModal(false);
                setUserToDelete(null);
                loadUsers();
            }
        };

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Gerenciamento de Usuários</h2>
                        <p className="text-sm text-gray-500">Controle de acesso e permissões</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <Plus size={18} /> Novo Usuário
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Carregando usuários...</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Usuário</th>
                                    <th className="px-6 py-3">Login</th>
                                    <th className="px-6 py-3">Função</th>
                                    <th className="px-6 py-3">Empresa</th>
                                    <th className="px-6 py-3 text-center">Ativo</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => {
                                    const company = MOCK_COMPANIES.find(c => c.id === user.company_id);
                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                                <div className="bg-gray-200 p-2 rounded-full">
                                                    <User size={16} className="text-gray-600" />
                                                </div>
                                                {user.full_name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {/* Strip .com for display to match user preference */}
                                                {user.email.replace('.com', '')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {company?.logo_url ? (
                                                        <img src={company.logo_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                                                    ) : <Building size={16} />}
                                                    <span className="font-medium text-gray-700">
                                                        {company?.name || 'Desconhecida'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`} title={user.active ? "Ativo" : "Inativo"}></span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="text-slate-500 hover:text-slate-700 p-2 rounded hover:bg-slate-50"
                                                        title="Editar Usuário"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(user)}
                                                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                                                        title="Remover Usuário"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">{modalMode === 'create' ? 'Adicionar Usuário' : 'Editar Usuário'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Name Input - Triggers Email Generation */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Nome Completo</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                        required
                                        value={formData.full_name}
                                        onChange={handleNameChange}
                                        placeholder="Digite o nome..."
                                    />
                                </div>

                                {/* Company Select - Triggers Email Generation */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Empresa</label>
                                        <select
                                            className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                            value={formData.company_id}
                                            onChange={handleCompanyChange}
                                        >
                                            {MOCK_COMPANIES.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Read-Only Login Field */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Login (Gerado Autom.)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full border border-gray-300 bg-gray-100 text-gray-500 rounded-lg px-3 py-2 outline-none cursor-not-allowed"
                                            required
                                            value={formData.email}
                                            readOnly
                                            tabIndex={-1} // Skip tab
                                        />
                                        <div className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">
                                            Não editável
                                        </div>
                                    </div>
                                    {modalMode === 'create' && (
                                        <p className="text-xs text-slate-600 mt-1">
                                            O login é criado combinando nome e empresa.
                                        </p>
                                    )}
                                </div>

                                {/* Password Field Mock */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700">Senha {modalMode === 'edit' && '(Deixe em branco para manter)'}</label>
                                    <input
                                        type="password"
                                        className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={modalMode === 'create' ? "Senha inicial" : "Nova senha"}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium mb-1 text-gray-700">Função</label>
                                        <select
                                            className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                        >
                                            <option value="user">Usuário</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="activeCheck"
                                        checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                        className="w-4 h-4 text-slate-600 rounded focus:ring-slate-500"
                                    />
                                    <label htmlFor="activeCheck" className="text-sm text-gray-700">Usuário Ativo</label>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancelar</button>
                                    <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium">Salvar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                            <div className="flex flex-col items-center text-center">
                                <div className="bg-red-100 p-3 rounded-full mb-4">
                                    <AlertTriangle className="text-red-600" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Tem certeza que deseja remover o usuário <strong>{userToDelete?.full_name}</strong>? Esta ação não pode ser desfeita.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };