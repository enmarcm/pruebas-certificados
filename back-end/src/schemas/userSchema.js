import z from "zod";

const USERNAME_REGEX = /^[a-zA-Z0-9_\-.]+$/;
const QUESTIONS_REGEX = /^[a-zA-Z0-9./@\-_\s]+$/;

/**
 * Esquema de validación para agregar o actualizar un usuario.
 * @typedef {Object} UserSchema
 * @property {string[]} profiles - Los perfiles asociados con el usuario.
 * @property {string} user - El nombre de usuario del usuario.
 * @property {string} email - El correo electrónico del usuario.
 * @property {string} password - La contraseña del usuario.
 * @property {Object[]} questions - Las preguntas de seguridad asociadas con el usuario.
 * @property {string} questions.question - La pregunta de seguridad.
 * @property {string} questions.answer - La respuesta a la pregunta de seguridad.
 */

/**
 * Esquema de validación para agregar un usuario.
 * @type {UserSchema}
 */
const addUserSchema = z.object({
  profiles: z.array(z.string().min(3).max(20)).min(1),
  user: z.string().min(5).max(10).regex(USERNAME_REGEX),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(20),
  questions: z
    .array(
      z.object({
        question: z
          .string()
          .min(3)
          .max(70)
          .regex(QUESTIONS_REGEX)
          .toLowerCase(),
        answer: z.string().min(3).max(70).regex(QUESTIONS_REGEX).toLowerCase(),
      })
    )
    .min(2)
    .max(6),
});

/**
 * Esquema de validacion para responder una pregunta de seguridad.
 * @typedef {Object} answerSchema
 * @property {string} answer - La respuesta a la pregunta de seguridad.
 */

/**
 * Esquema de validación para una respuesta a una pregunta de seguridad.
 * @type {answerSchema}
 */
const answerSchema =  z.array(
    z.object({
      answer: z.string().min(3).max(70).regex(QUESTIONS_REGEX).toLowerCase(),
    })
  ).min(2).max(5)


/**
 * Verifica si los datos proporcionados cumplen con el esquema de validación para agregar un usuario.
 * @async
 * @param {Object} options - Un objeto que contiene los datos a validar.
 * @param {Object} options.data - Los datos a validar.
 * @returns {Promise<{ success: boolean, data?: UserSchema, error?: z.ZodError }>} - Un objeto que indica si la validación fue exitosa o no. Si la validación fue exitosa, el objeto también contiene los datos validados. Si la validación no fue exitosa, el objeto también contiene un error que describe el problema.
 */
export const verifyAddUser = async ({ data }) => {
  try {
    return await addUserSchema.safeParseAsync(data);
  } catch (error) {
    return { error };
  }
};

/**
 * Verifica si los datos proporcionados cumplen con el esquema de validación para actualizar un usuario.
 * @async
 * @param {Object} options - Un objeto que contiene los datos a validar.
 * @param {Object} options.data - Los datos a validar.
 * @returns {Promise<{ success: boolean, data?: UserSchema, error?: z.ZodError }>} - Un objeto que indica si la validación fue exitosa o no. Si la validación fue exitosa, el objeto también contiene los datos validados. Si la validación no fue exitosa, el objeto también contiene un error que describe el problema.
 */
export const verifyUpdateUser = async ({ data }) => {
  try {
    return await addUserSchema.partial().safeParseAsync(data);
  } catch (error) {
    return { error };
  }
};

/**
 * Verifica si la respuesta proporcionada cumple con el esquema de validación para responder una pregunta de seguridad.
 * @async
 * @param {Object} options - Un objeto que contiene la respuesta a validar
 * @param {String} options.answer - La respuesta a validar
 * @returns {Promise<{ success: boolean, data?: UserSchema, error?: z.ZodError }>} - Un objeto que indica si la validación fue exitosa o no. Si la validación fue exitosa, el objeto también contiene los datos validados. Si la validación no fue exitosa, el objeto también contiene un error que describe el problema.
 */
export const verifyAnswerQuestion = async ({ answer }) => {
  try {
    return await answerSchema.safeParseAsync(answer);
  } catch (error) {
    return { error };
  }
};
