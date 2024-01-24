import PgHandler from '../../components/PgHandler.js'
import importJson from '../../utils/importJson.js'

const config = importJson({ path: '../data/pg-handler-data/config.json' })
const querys = importJson({ path: '../data/pg-handler-data/querys.json' })

/**
 * Instancia de la clase PgHandler para manejar la conexión y consultas a la base de datos PostgreSQL.
 * @type {PgHandler}
 */
const pgHandler = new PgHandler({ config, querys })

export default pgHandler