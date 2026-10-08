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

