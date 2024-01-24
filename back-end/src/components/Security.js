/**
 * Clase Security que maneja la seguridad de la aplicación.
 */
class Security {
  /**
   * Constructor de la clase Security.
   * @param {Object} options - Opciones para la clase Security.
   * @param {Object} options.controller - Controlador de la aplicación.
   * @param {Object} options.config - Configuración de la aplicación.
   * @param {string} options.config.pathBO - Ruta de los objetos de negocio.
   * @param {boolean} [options.config.loadInit=true] - Indica si se deben cargar los permisos al instanciar la clase.
   */
  constructor({ controller, config }) {
    /**
     * Controlador de la aplicación.
     * @type {Object}
     */
    this.controller = controller;

    /**
     * Configuración de la aplicación.
     * @type {Object}
     */
    this.config = config;

    /**
     * Ruta de los objetos de negocio.
     * @type {string}
     */
    this.pathBO = this.config.pathBO;

    /**
     * Mapa de permisos de usuario.
     * @type {Map}
     */
    this.permissions = new Map();

    // Carga los permisos al instanciar la clase si se especifica en la configuración
    if (this.config.loadInit || this.config.loadInit === undefined)
      this.loadPermissions();
  }

  /**
   * Carga los permisos de usuario.
   * @async
   * @returns {Promise<void>}
   */
  loadPermissions = async () => {
    try {
      // Si ya se cargaron los permisos, no hace nada
      if (this.permissions.size > 0) return;

      // Obtiene los permisos del controlador
      const permisos = await this.controller.executeMethod({
        method: "obtenerPermisos",
        params: [],
      });

      // Crea el mapa de permisos
      this.#putPermissionsMap({ permisos });

      return;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Verifica si los permisos ya se cargaron y los carga si no.
   * @async
   * @private
   * @returns {Promise<boolean>} - Indica si los permisos ya se cargaron.
   */
  #verifyLoadPermissions = async () => {
    try {
      if (this.permissions.size === 0) {
        console.log("Esperando cargar servicios");
        await this.loadPermissions();
        return true;
      }
      return;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Coloca en el mapa los permisos obtenidos del controlador.
   * @param {Object[]} options.permisos - Lista de permisos obtenidos del controlador.
   * @param {string} options.permisos[].profile - Perfil de usuario.
   * @param {string} options.permisos[].object - Objeto de negocio.
   * @param {string} options.permisos[].method - Método permitido.
   * @param {string} options.permisos[].area - Área del objeto de negocio.
   * @private
   */
  #putPermissionsMap = ({ permisos }) => {
    // Coloca en el mapa de los permisos obtenidos del controlador
    const result = permisos.reduce((acc, permiso) => {
      const { profile, object, method, area } = permiso;
      
      acc[profile] = acc[profile] || {};
      acc[profile][area] = acc[profile][area] || {};
      acc[profile][area][object] = acc[profile][area][object] || [];
      acc[profile][area][object].push(method);
      return acc;
    }, {});

    // Agrega los permisos al mapa de permisos
    for (const profile in result) {
      const porArea = result[profile];
      this.permissions.set(profile, porArea);
    }
    return;
  };

  /**
   * Recarga los permisos de usuario.
   * @async
   * @private
   * @returns {Promise<boolean>} - Indica si se recargaron los permisos.
   */
  #reloadPermission = async () => {
    try {
      this.permissions.clear();
      await this.loadPermissions();
      return true;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Verifica si un usuario tiene permiso para ejecutar un método en un objeto de negocio.
   * @async
   * @param {Object} options - Opciones para verificar los permisos.
   * @param {string} options.profile - Perfil de usuario.
   * @param {string} options.area - Área del objeto de negocio.
   * @param {string} options.object - Objeto de negocio.
   * @param {string} options.method - Método a ejecutar.
   * @returns {Promise<boolean>} - Indica si el usuario tiene permiso para ejecutar el método.
   */
  hasPermission = async ({ profile, area, object, method }) => {
    try {
      // Verifica si los permisos ya se cargaron y los carga si no
      await this.#verifyLoadPermissions();

      // Verifica si el usuario tiene permiso para ejecutar el método
      const permiso = this.permissions
        .get(profile)
        [area][object].includes(method);

      return permiso ? true : false;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Ejecuta un método en un objeto de negocio.
   * @async
   * @param {Object} options - Opciones para ejecutar el método.
   * @param {string} options.area - Área del objeto de negocio.
   * @param {string} options.object - Objeto de negocio.
   * @param {string} options.method - Método a ejecutar.
   * @param {Array} [options.params=[]] - Parámetros para el método.
   * @returns {Promise<*>} - Resultado del método.
   */
  executeMethod = async ({ area, object, method, params = [] }) => {
    try {
      // Obtiene la ruta del objeto de negocio
      const path = `${this.pathBO}/${area}/${object}.js`;

      // Importa el módulo del objeto de negocio
      const module = await import(path);

      // Obtiene la clase del objeto de negocio
      const moduleReady = module.default ?? module[object];

      // Crea una instancia del objeto de negocio
      const obj = new moduleReady();

      // Obtiene el método a ejecutar
      const metodoAEjecutar = obj[method] ?? moduleReady[method];

      // Ejecuta el método
      const methodResult = await metodoAEjecutar(...(typeof params === "object" ? [params] : params));
      return methodResult;
    } catch (error) {
      console.error(`Existio un error ${error}`);
      return { error };
    }
  };

  /**
   * Establece el permiso de un usuario para ejecutar un método en un objeto de negocio.
   * @async
   * @param {Object} options - Opciones para establecer el permiso.
   * @param {string} options.area - Área del objeto de negocio.
   * @param {string} options.object - Objeto de negocio.
   * @param {string} options.method - Método a ejecutar.
   * @param {string} options.profile - Perfil de usuario.
   * @param {boolean} options.status - Indica si se debe permitir o bloquear el método.
   * @returns {Promise<boolean>} - Indica si se estableció el permiso.
   */
  setPermission = async ({ area, object, method, profile, status }) => {
    try {
      // Verifica si el método existe
      const [methodExist] = await this.#verifyMethod({ area, object, method });
      if (!methodExist) return false;
      const idMethod = methodExist.id_method;

      // Verifica si el perfil existe
      const [profileExist] = await this.#verifyProfile({ profile });
      if (!profileExist) return false;
      const idProfile = profileExist.id_profile;

      // Establece el permiso en la base de datos
      return status
        ? await this.#addPermission({
            object,
            idProfile,
            idMethod,
            profile,
            method,
            area,
          })
        : await this.#removePermission({
            object,
            idProfile,
            idMethod,
            profile,
            method,
            area,
          });
    } catch (error) {
      return { error };
    }
  };

  /**
   * Verifica si un método existe.
   * @async
   * @param {Object} options - Opciones para verificar el método.
   * @param {string} options.area - Área del objeto de negocio.
   * @param {string} options.object - Objeto de negocio.
   * @param {string} options.method - Método a verificar.
   * @returns {Promise<Object[]>} - Lista de métodos que coinciden con los parámetros.
   * @private
   */
  #verifyMethod = async ({ area, object, method }) => {
    try {
      await this.controller.executeMethod({
        method: "verifyMethod",
        params: { area, object, method },
      });
    } catch (error) {
      return { error };
    }
  };

  /**
   * Verifica si un perfil de usuario existe.
   * @async
   * @param {Object} options - Opciones para verificar el perfil.
   * @param {string} options.profile - Perfil de usuario a verificar.
   * @returns {Promise<Object[]>} - Lista de perfiles que coinciden con los parámetros.
   * @private
   */
  #verifyProfile = async ({ profile }) => {
    try {
      await this.controller.executeMethod({
        method: "verifyProfile",
        params: { profile },
      });
    } catch (error) {
      return { error };
    }
  };

  /**
   * Agrega un permiso para un usuario.
   * @async
   * @param {Object} options - Opciones para agregar el permiso.
   * @param {number} options.idProfile - ID del perfil de usuario.
   * @param {number} options.idMethod - ID del método.
   * @param {string} options.profile - Perfil de usuario.
   * @param {string} options.method - Método a permitir.
   * @param {string} options.area - Área del objeto de negocio.
   * @param {string} options.object - Objeto de negocio.
   * @returns {Promise<boolean>} - Indica si se agregó el permiso.
   * @private
   */
  #addPermission = async (options) => {
    try {
      const { idProfile, idMethod, profile, method, area, object } = options;

      // Agrega el permiso en la base de datos
      const execute = await this.controller.executeMethod({
        method: "addPermission",
        params: { idMethod, idProfile },
      });

      // Agrega el permiso al mapa de permisos
      this.permissions.get(profile)[area][object].push(method);
      return this.permissions.get(profile)[area][object].includes(method);
    } catch (error) {
      return { error };
    }
  };

  /**
   * Elimina un permiso para un usuario.
   * @async
   * @param {Object} options - Opciones para eliminar el permiso.
   * @param {number} options.idProfile - ID del perfil de usuario.
   * @param {number} options.idMethod - ID del método.
   * @param {string} options.profile - Perfil de usuario.
   * @param {string} options.method - Método a bloquear.
   * @param {string} options.area - Área del objeto de negocio.
   * @param {string} options.object - Objeto de negocio.
   * @returns {Promise<boolean>} - Indica si se eliminó el permiso.
   * @private
   */
  #removePermission = async (options) => {
    try {
      const { idProfile, idMethod, profile, method, area, object } = options;

      // Elimina el permiso de la base de datos
      const execute = await this.controller.executeMethod({
        method: "removePermission",
        params: { idMethod, idProfile },
      });

      // Elimina el permiso del mapa de permisos
      const indiceBorrar = this.permissions
        .get(profile)
        [area][object].indexOf(method);

      if (indiceBorrar === -1) return false;
      this.permissions.get(profile)[area][object].splice(indiceBorrar, 1);
      return execute;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Bloquea un perfil de usuario.
   * @async
   * @param {Object} options - Opciones para bloquear el perfil.
   * @param {string} options.profile - Perfil de usuario a bloquear.
   * @returns {Promise<boolean>} - Indica si se bloqueó el perfil.
   */
  blockProfile = async ({ profile }) => {
    try {
      // Verifica si el perfil existe
      const [profileExist] = await this.#verifyProfile({ profile });
      if (!profileExist) return false;
      const idProfile = profileExist.id_profile;

      // Bloquea el perfil en la base de datos
      const execute = await this.controller.executeMethod({
        method: "blockProfile",
        params: { idProfile },
      });

      // Borra los permisos del perfil del mapa de permisos
      this.permissions.set(profile, {});
      return execute;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Bloquea un método en un objeto de negocio.
   * @async
   * @param {Object} options - Opciones para bloquear el método.
   * @param {string} options.area - Área del objeto de negocio.
   * @param {string} options.object - Objeto de negocio.
   * @param {string} options.method - Método a bloquear.
   * @returns {Promise<boolean>} - Indica si se bloqueó el método.
   */
  blockMethod = async ({ area, object, method }) => {
    try {
      // Verifica si el método existe
      const [methodExist] = await this.#verifyMethod({ area, object, method });
      if (!methodExist) return false;
      const idMethod = methodExist.id_method;

      // Bloquea el método en la base de datos
      const execute = await this.controller.executeMethod({
        method: "blockMethod",
        params: { idMethod },
      });

      // Borra el método del mapa de permisos
      this.#blockMethodMap({ method });

      return execute;
    } catch (error) {
      return { error };
    }
  };

  /**
   * Elimina un método del mapa de permisos.
   * @param {string} options.method - Método a eliminar.
   * @private
   */
  #blockMethodMap = ({ method }) => {
    // Elimina el método del mapa de permisos
    this.permissions.forEach((profile) => {
      for (const key in profile) {
        for (const key2 in profile[key]) {
          const indexBorrar = profile[key][key2].indexOf(method);
          if (indexBorrar !== -1) {
            profile[key][key2].splice(indexBorrar, 1);
          }
        }
      }
    });
  };
}

export default Security;
