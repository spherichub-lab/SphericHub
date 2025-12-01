import { LensesController } from "../../src/controllers/lensesController.js";

export default async function handler(req, res) {
  const method = req.method;

  try {
    if (method === "GET") {
      const filters = req.query || {};
      const response = await LensesController.list({ filters });
      return res.status(response.success ? 200 : 400).json(response);
    }

    if (method === "POST") {
      const body = req.body || {};
      const response = await LensesController.create({ body });
      return res.status(response.success ? 201 : 400).json(response);
    }

    if (method === "PUT") {
      const id = req.query.id;
      const body = req.body || {};
      const response = await LensesController.update({ params: { id }, body });
      return res.status(response.success ? 200 : 400).json(response);
    }

    if (method === "DELETE") {
      const id = req.query.id;
      const response = await LensesController.delete({ params: { id } });
      return res.status(response.success ? 200 : 400).json(response);
    }

    // Método desconhecido
    return res.status(405).json({ success: false, error: "Método não permitido" });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Erro interno no servidor: " + error.message
    });
  }
}
