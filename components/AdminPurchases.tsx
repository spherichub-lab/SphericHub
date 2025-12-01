import React, { useState, useEffect } from 'react';
import { Purchase, getPurchases, createPurchase, deletePurchase } from '../services/purchaseService';
import { MOCK_COMPANIES } from '../services/authService';
import { Plus, Trash2, Calendar, Building, ShoppingCart, X, Loader2 } from 'lucide-react';

export const AdminPurchases: React.FC = () => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Modal & Form
    const [showModal, setShowModal] = useState(false);
    const [newPurchase, setNewPurchase] = useState({
        company_id: '',
        supplier: '',
        purchase_date: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadPurchases = async () => {
        setLoading(true);
        try {
            const data = await getPurchases(selectedCompany, startDate, endDate);
            setPurchases(data);
        } catch (error) {
            console.error("Failed to load purchases", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPurchases();
    }, [selectedCompany, startDate, endDate]);

    const handleOpenModal = () => {
        setNewPurchase({
            company_id: MOCK_COMPANIES[0]?.id || '',
            supplier: '',
            purchase_date: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPurchase.company_id || !newPurchase.supplier) return;

        setIsSubmitting(true);
        try {
            await createPurchase({
                company_id: newPurchase.company_id,
                supplier: newPurchase.supplier,
                purchase_date: new Date(newPurchase.purchase_date).toISOString()
            });
            setShowModal(false);
            loadPurchases();
        } catch (error) {
            console.error("Error creating purchase", error);
            alert("Erro ao registrar compra.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            try {
                await deletePurchase(id);
                loadPurchases();
            } catch (error) {
                console.error("Error deleting purchase", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingCart className="text-slate-700" size={24} />
                            Gestão de Compras
                        </h2>
                        <p className="text-sm text-gray-500">Registre e monitore compras por empresa e fornecedor.</p>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Plus size={18} /> Nova Compra
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Company Filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Empresa</label>
                        <div className="relative">
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none appearance-none bg-white"
                            >
                                <option value="">Todas as Empresas</option>
                                {MOCK_COMPANIES.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <Building className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">De</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Até</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                            />
                            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-slate-400" size={32} />
                        <p>Carregando registros...</p>
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        Nenhum registro encontrado para os filtros selecionados.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Data</th>
                                    <th className="px-6 py-3">Empresa</th>
                                    <th className="px-6 py-3">Fornecedor</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {purchases.map(purchase => {
                                    const company = MOCK_COMPANIES.find(c => c.id === purchase.company_id);
                                    return (
                                        <tr key={purchase.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {new Date(purchase.purchase_date).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {company?.logo_url ? (
                                                        <img src={company.logo_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                                                    ) : <Building size={16} className="text-gray-400" />}
                                                    <span className="text-gray-700">{company?.name || 'Desconhecida'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {purchase.supplier}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(purchase.id)}
                                                    className="text-red-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Nova Compra</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Empresa</label>
                                <select
                                    className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                    value={newPurchase.company_id}
                                    onChange={e => setNewPurchase({ ...newPurchase, company_id: e.target.value })}
                                    required
                                >
                                    {MOCK_COMPANIES.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Fornecedor</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                    required
                                    value={newPurchase.supplier}
                                    onChange={e => setNewPurchase({ ...newPurchase, supplier: e.target.value })}
                                    placeholder="Nome do fornecedor..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Data da Compra</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 outline-none"
                                    required
                                    value={newPurchase.purchase_date}
                                    onChange={e => setNewPurchase({ ...newPurchase, purchase_date: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Salvando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
