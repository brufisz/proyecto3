import { editorAApi, apiAEditor } from "./parserApi";
import type { ElementoAPI, NivelEditor } from "./parserApi";

const API = "http://localhost:3000";

export type NivelBackend = {
  id: number;
  nombre: string;
  usuario: string;
  publicado: boolean;
  version: number;
  elementos: ElementoAPI[];
  usuariosQueCompletaron: string[];
};

export async function leerPublicaciones(): Promise<NivelBackend[]> {
  const respuesta = await fetch(API + "/loadLevels");
  if (respuesta.ok === false) {
    throw new Error(String(respuesta.status));
  }
  const niveles = await respuesta.json();
  return niveles;
}

export async function leerNivelesUsuario(
  usuario: string
): Promise<NivelBackend[]> {
  const respuesta = await fetch(API + "/" + encodeURIComponent(usuario));
  const resultado = await respuesta.json();

  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }

  return resultado.createdLevels;
}

export async function leerArchivoGuardadoBackend(usuario: string) {
  const respuesta = await fetch(API + "/saveFile/" + encodeURIComponent(usuario));
  const resultado = await respuesta.json();
  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
  return resultado;
}

export async function leerNivelesCreadosBackend(usuario: string): Promise<NivelBackend[]> {
  const archivo = await leerArchivoGuardadoBackend(usuario);
  return archivo.nivelesCreados;
}

export function esNivelDelEditorBackend(nivel: NivelBackend): boolean {
  for (let i = 0; i < nivel.elementos.length; i++) {
    const elemento = nivel.elementos[i];
    if (elemento !== null) {
      const propiedad = elemento.tipo.propiedadEspecial;
      if (typeof propiedad === "string" && propiedad.startsWith("community/editor/1:")) {
        return true;
      }
    }
  }
  return false;
}

export async function leerNivelesGuardadosBackend(usuario: string): Promise<NivelBackend[]> {
  const archivo = await leerArchivoGuardadoBackend(usuario);
  const texto = localStorage.getItem("nivelesGuardados:" + usuario);
  let niveles: NivelBackend[] = [];
  if (texto !== null) {
    niveles = JSON.parse(texto);
  }
  for (let i = 0; i < archivo.nivelesGuardados.length; i++) {
    const recibido = archivo.nivelesGuardados[i];
    let indice = -1;
    for (let j = 0; j < niveles.length; j++) {
      if (niveles[j].id === recibido.id && niveles[j].usuario === recibido.usuario) {
        indice = j;
      }
    }
    if (indice === -1) {
      niveles.push(recibido);
    } else if (recibido.version > niveles[indice].version) {
      niveles[indice] = recibido;
    }
  }
  localStorage.setItem("nivelesGuardados:" + usuario, JSON.stringify(niveles));
  return niveles;
}

export async function guardarNivelCreadoBackend(
  usuario: string,
  nombre: string,
  nivel?: NivelEditor
): Promise<NivelBackend> {
  const creados = await leerNivelesCreadosBackend(usuario);
  if (nivel === undefined) {
    for (let i = 0; i < creados.length; i++) {
      if (creados[i].nombre === nombre && creados[i].elementos.length > 0) {
        return creados[i];
      }
    }
    throw new Error("Faltan los datos del nivel. Guarda el tablero antes de publicar.");
  }
  for (let i = 0; i < creados.length; i++) {
    if (creados[i].nombre === nombre) {
      if (esNivelDelEditorBackend(creados[i]) === false || apiAEditor(creados[i]).id !== nivel.id) {
        throw new Error("Ya existe otro nivel creado con ese nombre. Recarga Mis niveles.");
      }
    } else if (esNivelDelEditorBackend(creados[i]) && apiAEditor(creados[i]).id === nivel.id) {
      throw new Error("El nombre cambio en el servidor. Recarga Mis niveles antes de guardar.");
    }
  }
  const datos = editorAApi(nivel, usuario);
  datos.nombre = nombre;
  await leerNivelesGuardadosBackend(usuario);
  const respuesta = await fetch(API + "/saveLevel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
  const resultado = await respuesta.json();
  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
  const guardados = await leerNivelesCreadosBackend(usuario);
  for (let i = 0; i < guardados.length; i++) {
    if (guardados[i].nombre === nombre) {
      return guardados[i];
    }
  }
  throw new Error("No se encontro el nivel despues de guardarlo.");
}

async function comprobarIdCreadoBackend(usuario: string, id: number, idLocal?: string) {
  const niveles = await leerNivelesCreadosBackend(usuario);
  let cantidad = 0;
  for (let i = 0; i < niveles.length; i++) {
    if (niveles[i].id === id) {
      cantidad++;
    }
  }
  if (cantidad === 0) {
    throw new Error("No se encontro el nivel creado.");
  }
  if (cantidad > 1) {
    throw new Error("El backend repitio este ID. No se puede renombrar o borrar con seguridad.");
  }
  if (idLocal !== undefined) {
    for (let i = 0; i < niveles.length; i++) {
      if (niveles[i].id === id) {
        if (esNivelDelEditorBackend(niveles[i]) === false || apiAEditor(niveles[i]).id !== idLocal) {
          throw new Error("El nivel cambio en el servidor. Recarga Mis niveles.");
        }
      }
    }
  }
}

export async function renombrarNivelCreadoBackend(usuario: string, id: number, nombre: string, idLocal?: string) {
  await comprobarIdCreadoBackend(usuario, id, idLocal);
  const niveles = await leerNivelesCreadosBackend(usuario);
  for (let i = 0; i < niveles.length; i++) {
    if (niveles[i].id !== id && niveles[i].nombre === nombre) {
      throw new Error("Ya existe otro nivel creado con ese nombre.");
    }
  }
  const respuesta = await fetch(API + "/level/name/offline/" + id, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: usuario, nombre: nombre })
  });
  const resultado = await respuesta.json();
  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
}

export async function eliminarNivelCreadoBackend(usuario: string, id: number, idLocal?: string) {
  await comprobarIdCreadoBackend(usuario, id, idLocal);
  const respuesta = await fetch(API + "/level/delete/" + id, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: usuario })
  });
  const resultado = await respuesta.json();
  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
}

export async function publicarNivelBackend(usuario: string, nombre: string, nivel?: NivelEditor): Promise<void> {
  if (nivel !== undefined) {
    await guardarNivelCreadoBackend(usuario, nombre, nivel);
  }
  const niveles = await leerNivelesUsuario(usuario);
  for (let i = 0; i < niveles.length; i++) {
    const nivelPublicado = niveles[i];
    if (nivelPublicado.usuario === usuario && nivelPublicado.nombre === nombre) {
      if (nivelPublicado.publicado === false) {
        const respuesta = await fetch(API + "/level/show/" + encodeURIComponent(nombre), { method: "PUT" });
        const resultado = await respuesta.json();
        if (respuesta.ok === false) {
          throw new Error(resultado.estatus);
        }
        const visibles = await leerPublicaciones();
        let publicado = false;
        for (let j = 0; j < visibles.length; j++) {
          if (visibles[j].id === nivelPublicado.id && visibles[j].publicado === true) {
            publicado = true;
            break;
          }
        }
        if (publicado === false) {
          throw new Error("El backend no guardó el cambio de showLevel: el nivel sigue oculto.");
        }
      }
      return;
    }
  }
  await guardarNivelCreadoBackend(usuario, nombre);
  const respuesta = await fetch(API + "/publishLevel/" + encodeURIComponent(usuario), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre: nombre })
  });
  const resultado = await respuesta.json();
  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
}

export async function despublicarNivelBackend(
  nombre: string
): Promise<void> {
  const respuesta = await fetch(
    API + "/level/hide/" + encodeURIComponent(nombre),
    { method: "PUT" }
  );

  const resultado = await respuesta.json();

  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }

  const visibles = await leerPublicaciones();

  for (let i = 0; i < visibles.length; i++) {
    if (visibles[i].nombre === nombre && visibles[i].publicado === true) {
      throw new Error(
        "El backend no guardó la despublicación"
      );
    }
  }
}

export async function renombrarPublicacionBackend(
  id: number,
  nombre: string
): Promise<void> {
  const respuesta = await fetch(API + "/level/name/online/" + id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nombre: nombre })
  });

  const resultado = await respuesta.json();

  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
}

export async function leerNivelPublicadoBackend(nombre: string): Promise<NivelBackend> {
  const respuesta = await fetch(API + "/loadLevels/level/" + encodeURIComponent(nombre));
  const resultado = await respuesta.json();
  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
  return resultado;
}

export async function actualizarPublicacionBackend(usuario: string, nivel: NivelEditor, publicacion: NivelBackend) {
  if (publicacion.usuario !== usuario) {
    throw new Error("La publicacion pertenece a otro usuario.");
  }
  const visibles = await leerPublicaciones();
  for (let i = 0; i < visibles.length; i++) {
    if (visibles[i].nombre === nivel.nombre && visibles[i].id !== publicacion.id) {
      throw new Error("Ya existe otra publicacion con ese nombre.");
    }
  }
  await guardarNivelCreadoBackend(usuario, nivel.nombre, nivel);
  const datos = editorAApi(nivel, usuario, publicacion);
  const respuesta = await fetch(API + "/level/" + encodeURIComponent(publicacion.nombre), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
  const resultado = await respuesta.json();
  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
}

export async function descargarNivelBackend(usuario: string, nombre: string): Promise<NivelBackend> {
  const actual = await leerNivelPublicadoBackend(nombre);
  apiAEditor(actual);
  const guardados = await leerNivelesGuardadosBackend(usuario);
  for (let i = 0; i < guardados.length; i++) {
    if (guardados[i].id === actual.id && guardados[i].usuario === actual.usuario) {
      if (guardados[i].version === actual.version) {
        return guardados[i];
      }
      const respuestaAnterior = await fetch(API + "/deleteLevelUser/" + encodeURIComponent(guardados[i].nombre), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario })
      });
      const resultadoAnterior = await respuestaAnterior.json();
      if (respuestaAnterior.ok === false) {
        throw new Error(resultadoAnterior.estatus);
      }
    }
  }
  const respuesta = await fetch(API + "/saveLevelUser/" + encodeURIComponent(nombre), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: usuario })
  });
  const resultado = await respuesta.json();
  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
  await leerNivelesGuardadosBackend(usuario);
  return actual;
}

export async function eliminarNivelGuardadoBackend(usuario: string, id: number) {
  const guardados = await leerNivelesGuardadosBackend(usuario);
  const restantes: NivelBackend[] = [];
  for (let i = 0; i < guardados.length; i++) {
    const nivel = guardados[i];
    if (nivel.id === id) {
      const respuesta = await fetch(API + "/deleteLevelUser/" + encodeURIComponent(nivel.nombre), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario })
      });
      const resultado = await respuesta.json();
      if (respuesta.ok === false) {
        throw new Error(resultado.estatus);
      }
    } else {
      restantes.push(nivel);
    }
  }
  localStorage.setItem("nivelesGuardados:" + usuario, JSON.stringify(restantes));
}

let completandoNivel = false;

export async function completarNivelDescargadoBackend(usuario: string, id: number) {
  if (completandoNivel) {
    return;
  }
  completandoNivel = true;
  try {
    const guardados = await leerNivelesGuardadosBackend(usuario);
    const publicados = await leerPublicaciones();
    for (let i = 0; i < guardados.length; i++) {
      const guardado = guardados[i];
      if (guardado.id !== id) {
        continue;
      }
      for (let j = 0; j < publicados.length; j++) {
        const actual = publicados[j];
        if (actual.id !== id || actual.usuario !== guardado.usuario) {
          continue;
        }
        if (actual.version !== guardado.version) {
          throw new Error("Actualiza la descarga antes de guardar el progreso.");
        }
        if (actual.usuariosQueCompletaron.indexOf(usuario) === -1) {
          const respuesta = await fetch(API + "/level/" + encodeURIComponent(actual.nombre), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: usuario })
          });
          const resultado = await respuesta.json();
          if (respuesta.ok === false) {
            throw new Error(resultado.estatus);
          }
        }
        if (guardado.usuariosQueCompletaron.indexOf(usuario) === -1) {
          guardado.usuariosQueCompletaron.push(usuario);
        }
        localStorage.setItem("nivelesGuardados:" + usuario, JSON.stringify(guardados));
        return;
      }
    }
    throw new Error("No se encontro la descarga o su publicacion.");
  } finally {
    completandoNivel = false;
  }
}

export type PerfilBackend = {
  username: string;
  password: string;
  profileID: number;
};

export type ConfiguracionBackend = {
  theme: string;
  volume: number;
  resolution: string;
  user: string;
};

export async function registrarPerfil(
  nombre: string,
  contrasena: string
) {
  const datos = {
    username: nombre,
    password: contrasena
  };

  const respuesta = await fetch(
    "http://localhost:3000/saveProfile",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    }
  );

  const resultado = await respuesta.json();

  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
}

export async function obtenerPerfil(nombre: string) {
  const respuesta = await fetch(
    "http://localhost:3000/" + encodeURIComponent(nombre)
  );

  const resultado = await respuesta.json();

  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }

  const perfil: PerfilBackend = resultado.profileData;

  return perfil;
}

export async function autenticarPerfil(
  nombre: string,
  contrasena: string
) {
  const datos = {
    username: nombre,
    password: contrasena
  };

  const respuesta = await fetch(
    "http://localhost:3000/logProfile",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    }
  );

  const resultado = await respuesta.json();

  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }

  const perfil = await obtenerPerfil(nombre);

  return perfil;
}

export async function obtenerConfiguracion(nombre: string) {
  const respuesta = await fetch(
    "http://localhost:3000/" +
    encodeURIComponent(nombre) +
    "/configs"
  );

  const resultado = await respuesta.json();

  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }

  const configuracion: ConfiguracionBackend = resultado;

  return configuracion;
}

export async function guardarConfiguracion(
  nombre: string,
  tema: string,
  volumen: number,
  resolucion: string
) {
  const datos = {
    theme: tema,
    volume: volumen,
    resolution: resolucion
  };

  const respuesta = await fetch(
    "http://localhost:3000/" +
    encodeURIComponent(nombre) +
    "/saveConfigs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(datos)
    }
  );

  const resultado = await respuesta.json();

  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
}
