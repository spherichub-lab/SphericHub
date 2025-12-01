export const Validators = {
  isString(value, fieldName) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`O campo '${fieldName}' deve ser uma string válida.`);
    }
  },

  isNumber(value, fieldName) {
    if (typeof value !== "number" || isNaN(value)) {
      throw new Error(`O campo '${fieldName}' deve ser um número válido.`);
    }
  },

  isRequired(value, fieldName) {
    if (value === undefined || value === null || value === "") {
      throw new Error(`O campo '${fieldName}' é obrigatório.`);
    }
  }
};
