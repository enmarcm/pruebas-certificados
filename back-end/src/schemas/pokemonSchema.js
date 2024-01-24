import z from "zod"

/**
 * Esquema de validación para agregar un nuevo Pokémon.
 * @type {z.ZodObject}
 * @property {z.ZodString} name - El nombre del Pokémon.
 * @property {z.ZodString} image - La imagen del Pokémon.
 * @property {z.ZodArray} types - Los tipos del Pokémon.
 * @property {z.ZodArray} attacks - Los ataques del Pokémon.
 * @property {z.ZodArray} games - Los juegos en los que aparece el Pokémon.
 */
const addPokemonSchema = z.object({
    name: z.string().min(3).max(20),
    image: z.string(),
    types: z.array(z.string().min(3).max(20)).min(1),
    attacks: z.array(z.string().min(3).max(20)).min(1),
    games: z.array(z.string().min(3).max(20)).min(1)
})

/**
 * Verifica si los datos para agregar un nuevo Pokémon cumplen con el esquema de validación.
 * @async
 * @param {Object} options - Las opciones para verificar los datos.
 * @param {Object} options.data - Los datos a verificar.
 * @returns {Promise<z.ZodParsedType>} El objeto JSON con los datos verificados o un mensaje de error.
 */
export const verifyAddPokemon = async ({ data }) => {
    try {
        return await addPokemonSchema.safeParseAsync(data)
    } catch (error) {
        return {error}
    }
}