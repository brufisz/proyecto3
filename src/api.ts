const API = "http://localhost:3000";

export type NivelBackend = {
  id: number;
  nombre: string;
  usuario: string;
  publicado: boolean;
  version: number;
  elementos: unknown[];
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

export async function guardarNivelCreadoBackend(
  usuario: string,
  nombre: string
): Promise<void> {
  const respuestaGuardado = await fetch(
    API + "/saveFile/" + encodeURIComponent(usuario)
  );
  const guardado = await respuestaGuardado.json();

  if (respuestaGuardado.ok === false) {
    throw new Error(guardado.estatus);
  }

  for (let i = 0; i < guardado.nivelesCreados.length; i++) {
    if (guardado.nivelesCreados[i].nombre === nombre) {
      return;
    }
  }

  const datos = {
    usuario: usuario,
    nombre: nombre,
    elementos: []
  };

  const respuesta = await fetch(API + "/saveLevel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datos)
  });

  const resultado = await respuesta.json();

  if (respuesta.ok === false) {
    throw new Error(resultado.estatus);
  }
}

export async function publicarNivelBackend(
  usuario: string,
  nombre: string
): Promise<void> {
  const niveles = await leerNivelesUsuario(usuario);

  for (let i = 0; i < niveles.length; i++) {
    const nivel = niveles[i];

    if (nivel.usuario === usuario && nivel.nombre === nombre) {
      if (nivel.publicado === false) {
        const respuesta = await fetch(
          API + "/level/show/" + encodeURIComponent(nombre),
          { method: "PUT" }
        );

        const resultado = await respuesta.json();

        if (respuesta.ok === false) {
          throw new Error(resultado.estatus);
        }

        const visibles = await leerPublicaciones();
        let publicado = false;

        for (let j = 0; j < visibles.length; j++) {
          if (visibles[j].id === nivel.id && visibles[j].publicado === true) {
            publicado = true;
            break;
          }
        }

        if (publicado === false) {
          throw new Error(
            "El backend no guardó el cambio de showLevel: " +
            "el nivel sigue oculto."
          );
        }
      }

      return;
    }
  }
  await guardarNivelCreadoBackend(usuario, nombre);

  const respuesta = await fetch(
    API + "/publishLevel/" + encodeURIComponent(usuario),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre: nombre })
    }
  );

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
        "El backend no guardó la despublicación: " +
        "hideLevel respondió correctamente, pero el nivel sigue publicado."
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
