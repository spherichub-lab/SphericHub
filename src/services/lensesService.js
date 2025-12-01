import { LensesRepository } from "../repositories/lensesRepository";

export const LensesService = {
  async list(filters = {}) {
    // Validações básicas — impedem que a IA ou o usuário quebrem o código
    if (filters.index && typeof filters.index !== "string") {
      throw new Error("O campo 'index' deve ser string.");
    }

    if (filters.tratamento && typeof filters.tratamento !== "string") {
      throw new Error("O campo 'tratamento' deve ser string.");
    }

    return await LensesRepository.find(filters);
  },

  async create(payload) {
    if (!payload.indice) throw new Error("Campo 'indice' é obrigatório.");
    if (!payload.tratamento) throw new Error("Campo 'tratamento' é obrigatório.");

    return await LensesRepository.create(payload);
  },

  async update(id, payload) {
    if (!id) throw new Error("ID é obrigatório para atualização.");

    return await LensesRepository.update(id, payload);
  },

  async delete(id) {
    if (!id) throw new Error("ID é obrigatório para exclusão.");

    return await LensesRepository.delete(id);
  }
};

export default LensesService;
