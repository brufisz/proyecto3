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

