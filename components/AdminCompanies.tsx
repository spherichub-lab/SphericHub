import React, { useState, useEffect } from 'react';
import { Company } from '../types';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../services/authService';
import { Trash2, Plus, Building, Pencil, AlertTriangle, X, Upload, Image as ImageIcon } from 'lucide-react';

export const AdminCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const [formData, setFormData] = useState({
      name: '',
      logo_url: '',
      active: true
  });

  const loadCompanies = async () => {
    setLoading(true);
    const data = await getCompanies();
    setCompanies(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const openCreateModal = () => {
      setModalMode('create');
      setFormData({ name: '', logo_url: '', active: true });
      setShowModal(true);
  };

  const openEditModal = (company: Company) => {
      setModalMode('edit');
      setCompanyToEdit(company);
      setFormData({
          name: company.name,
          logo_url: company.logo_url || '',
          active: company.active
      });
      setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // In a real app, you would upload `file` to S3/Supabase Storage here.
        // For this demo, we use the Base64 string directly as the URL.
        setFormData(prev => ({ ...prev, logo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name) return;

      try {
          if (modalMode === 'create') {
              await createCompany(formData);
          } else if (modalMode === 'edit' && companyToEdit) {
              await updateCompany(companyToEdit.id, formData);
          }
          setShowModal(false);
          loadCompanies();
      } catch (error) {
          console.error("Error saving company", error);
      }
  };

  const confirmDelete = (company: Company) => {
      setCompanyToDelete(company);
      setShowDeleteModal(true);
  };

  const handleDelete = async () => {
      if (companyToDelete) {
          await deleteCompany(companyToDelete.id);
          setShowDeleteModal(false);
          setCompanyToDelete(null);
          loadCompanies();
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
           <h2 className="text-xl font-bold text-gray-800">Gerenciamento de Empresas</h2>
           <p className="text-sm text-gray-500">Controle das óticas e laboratórios parceiros</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
           <Plus size={18} /> Nova Empresa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         {loading ? (
             <div className="p-8 text-center text-gray-500">Carregando empresas...</div>
         ) : (
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-3">Logo</th>
                        <th className="px-6 py-3">Nome da Empresa</th>
                        <th className="px-6 py-3 text-center">Ativa</th>
                        <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {companies.map(company => (
                        <tr key={company.id} className="hover:bg-gray-50">
                             <td className="px-6 py-4">
                                <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                                    {company.logo_url ? (
                                        <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <Building className="text-gray-400" size={20} />
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {company.name}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${company.active ? 'bg-green-500' : 'bg-red-500'}`} title={company.active ? "Ativa" : "Inativa"}></span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => openEditModal(company)}
                                        className="text-slate-500 hover:text-slate-700 p-2 rounded hover:bg-slate-50"
                                        title="Editar Empresa"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={() => confirmDelete(company)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                                        title="Remover Empresa"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         )}
      </div>

       {/* Create/Edit Modal */}
       {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{modalMode === 'create' ? 'Nova Empresa' : 'Editar Empresa'}</h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20}/></button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Nome da Empresa</label>
                          <input 
                            type="text" 
                            className="w-full border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-500 outline-none" 
                            required 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                          />
                      </div>
                      
                      {/* Visual File Upload Area */}
                      <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700">Logotipo</label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors relative group">
                            
                            {formData.logo_url ? (
                                <div className="text-center">
                                    <img src={formData.logo_url} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-lg mb-2 shadow-sm"/>
                                    <p className="text-xs text-green-600 font-medium">Imagem carregada</p>
                                    <p className="text-xs text-gray-400">Clique para substituir</p>
                                </div>
                            ) : (
                                <div className="space-y-1 text-center">
                                    <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                                        <ImageIcon size={32} />
                                    </div>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <span className="font-medium text-slate-600 hover:text-slate-500">Clique para enviar</span>
                                        <p className="pl-1">ou arraste até aqui</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF até 2MB</p>
                                </div>
                            )}
                            
                            <input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                          </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                          <input 
                            type="checkbox" 
                            id="activeCompCheck"
                            checked={formData.active}
                            onChange={e => setFormData({...formData, active: e.target.checked})}
                            className="w-4 h-4 text-slate-600 rounded focus:ring-slate-500"
                          />
                          <label htmlFor="activeCompCheck" className="text-sm text-gray-700">Empresa Ativa</label>
                      </div>

                      <div className="pt-4 flex gap-3">
                          <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancelar</button>
                          <button type="submit" className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium">Salvar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};