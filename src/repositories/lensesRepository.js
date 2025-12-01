import supabase from "../services/supabaseClient";

export const LensesRepository = {
  // Buscar lentes com filtros opcionais
  async find(filters = {}) {
    let query = supabase.from("lentes").select("*");

    if (filters.index) query = query.eq("indice", filters.index);
    if (filters.tratamento) query = query.eq("tratamento", filters.tratamento);
    if (filters.dnp_min) query = query.gte("dnp", filters.dnp_min);
    if (filters.dnp_max) query = query.lte("dnp", filters.dnp_max);

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data;
  },

  // Criar lente
  async create(payload) {
    const { data, error } = await supabase
      .from("lentes")
      .insert(payload)
      .select();

    if (error) throw new Error(error.message);
    return data;
  },

  // Atualizar lente por ID
  async update(id, payload) {
    const { data, error } = await supabase
      .from("lentes")
      .update(payload)
      .eq("id", id)
      .select();

    if (error) throw new Error(error.message);
    return data;
  },

  // Deletar lente por ID
  async delete(id) {
    const { error } = await supabase.from("lentes").delete().eq("id", id);

    if (error) throw new Error(error.message);
    return true;
  },
};

export default LensesRepository;
