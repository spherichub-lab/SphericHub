import { LensesService } from "../services/lensesService";

export const LensesController = {
  async list(req) {
    try {
      const filters = req?.filters || {};
      const result = await LensesService.list(filters);

      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async create(req) {
    try {
      const payload = req?.body || {};
      const created = await LensesService.create(payload);

      return {
        success: true,
        data: created
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async update(req) {
    try {
      const id = req?.params?.id;
      const payload = req?.body || {};
      const updated = await LensesService.update(id, payload);

      return {
        success: true,
        data: updated
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async delete(req) {
    try {
      const id = req?.params?.id;
      const deleted = await LensesService.delete(id);

      return {
        success: true,
        data: deleted
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default LensesController;
