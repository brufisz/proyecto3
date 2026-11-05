interface NivelParseable {
  tablero: number[][];
  portales?: number[][];
  links?: number[][];
  darkLayer?: number[][];
}

export type GameTypeEntity = [
  string,
  number,
  number,
  number,
  number,
  number,
  number
];

export type GameTypeLevel = GameTypeEntity[];

function agregarEntidad(
  entidades: GameTypeLevel,
  tipo: string,
  x: number,
  y: number,
  direccion: number,
  tile: number
): GameTypeEntity {
  const entidad: GameTypeEntity = [
    tipo,
    x,
    y,
    direccion,
    -1,
    0,
    tile
  ];

  entidades.push(entidad);
  return entidad;
}

function agregarTile(
  entidades: GameTypeLevel,
  tile: number,
  x: number,
  y: number
): void {
  switch (tile) {
    case 3:
      agregarEntidad(entidades, "mirror", x, y, 2, tile);
      break;
    case 4:
      agregarEntidad(entidades, "mirror", x, y, 3, tile);
      break;
    case 5:
      agregarEntidad(entidades, "mirror", x, y, 0, tile);
      break;
    case 6:
      agregarEntidad(entidades, "mirror", x, y, 1, tile);
      break;

    case 11:
      agregarEntidad(entidades, "laserEmissor", x, y, 0, tile);
      break;
    case 12:
      agregarEntidad(entidades, "laserEmissor", x, y, 2, tile);
      break;
    case 13:
      agregarEntidad(entidades, "laserEmissor", x, y, 3, tile);
      break;
    case 14:
      agregarEntidad(entidades, "laserEmissor", x, y, 1, tile);
      break;

    case 16:
    case 17:
    case 18:
    case 19:
    case 20:
    case 21:
    case 22:
    case 23:
    case 24:
      agregarEntidad(entidades, "wall", x, y, -1, tile);
      break;

    case 27:
      agregarEntidad(entidades, "laserReciever", x, y, 0, tile);
      break;
    case 28:
      agregarEntidad(entidades, "laserReciever", x, y, 2, tile);
      break;
    case 29:
      agregarEntidad(entidades, "laserReciever", x, y, 3, tile);
      break;
    case 30:
      agregarEntidad(entidades, "laserReciever", x, y, 1, tile);
      break;

    case 33:
    case 34:
      agregarEntidad(entidades, "wall", x, y, 0, tile);
      break;

    case 37:
      agregarEntidad(entidades, "box", x, y, 0, tile);
      break;

    case 39:
    case 41:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
    case 64:
      agregarEntidad(entidades, "wall", x, y, 0, tile);
      break;

    case 66:
      agregarEntidad(entidades, "player", x, y, 0, tile);
      break;

    case 68:
      agregarEntidad(entidades, "wall", x, y, -1, tile);
      break;
  }
}

function direccionPortal(tile: number): number {
  if (tile === 50) return 0;
  if (tile === 55) return 1;
  if (tile === 51) return 2;
  if (tile === 53) return 3;
  return -1;
}

function buscarEntidad(
  entidades: GameTypeLevel,
  x: number,
  y: number
): GameTypeEntity | undefined {
  let placa: GameTypeEntity | undefined;

  for (let i = 0; i < entidades.length; i++) {
    const entidad = entidades[i];

    if (entidad[1] !== x || entidad[2] !== y) {
      continue;
    }

    if (entidad[0] !== "goal") {
      return entidad;
    }

    placa = entidad;
  }

  return placa;
}

function buscarTipo(
  entidades: GameTypeLevel,
  x: number,
  y: number,
  tipo: string
): GameTypeEntity | undefined {
  for (let i = 0; i < entidades.length; i++) {
    const entidad = entidades[i];

    if (
      entidad[0] === tipo &&
      entidad[1] === x &&
      entidad[2] === y
    ) {
      return entidad;
    }
  }

  return undefined;
}

function buscarPortal(
  entidades: GameTypeLevel,
  x: number,
  y: number
): GameTypeEntity | undefined {
  for (let i = 0; i < entidades.length; i++) {
    const entidad = entidades[i];

    if (
      entidad[1] === x &&
      entidad[2] === y &&
      entidad[4] !== -1
    ) {
      return entidad;
    }
  }

  return undefined;
}

function nuevoGrupo(indice: number): number {
  if (indice >= 30) {
    throw new Error("El nivel tiene demasiados grupos.");
  }

  return 1 << indice;
}

function primerGrupo(grupos: number): number {
  for (let i = 0; i < 30; i++) {
    const grupo = 1 << i;

    if ((grupos & grupo) !== 0) {
      return grupo;
    }
  }

  return 0;
}

function darkValido(frame: number): boolean {
  if (frame >= 0 && frame <= 36) return true;
  if (frame === 42) return true;
  if (frame === 48) return true;
  if (frame >= 54 && frame <= 65) return true;
  if (frame >= 72 && frame <= 83) return true;
  if (frame === 90) return true;
  if (frame === 96) return true;
  return false;
}

export function convertirNivel(
  nivel: NivelParseable
): GameTypeLevel {
  const entidades: GameTypeLevel = [];
  const filas = nivel.tablero.length;

  if (filas === 0) {
    return entidades;
  }

  const columnas = nivel.tablero[0].length;

  for (let y = 0; y < filas; y++) {
    for (let x = 0; x < columnas; x++) {
      let tile = nivel.tablero[y][x];

      if (tile === 2) {
        agregarEntidad(
          entidades,
          "goal",
          x,
          y,
          -1,
          2
        );
        continue;
      }

      if (tile >= 1000 && tile < 2000) {
        agregarEntidad(
          entidades,
          "goal",
          x,
          y,
          -1,
          2
        );

        tile -= 1000;
      }

      agregarTile(
        entidades,
        tile,
        x,
        y
      );
    }
  }

  if (nivel.portales !== undefined) {
    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < columnas; x++) {
        const direccion = direccionPortal(
          nivel.portales[y][x]
        );

        if (direccion === -1) {
          continue;
        }

        let entidad = buscarEntidad(
          entidades,
          x,
          y
        );

        if (entidad === undefined) {
          entidad = agregarEntidad(
            entidades,
            "box",
            x,
            y,
            0,
            1
          );
        }

        entidad[4] = direccion;
      }
    }
  }

  let numeroGrupo = 0;

  if (nivel.links !== undefined) {
    for (let i = 0; i < nivel.links.length; i++) {
      const link = nivel.links[i];

      if (link.length !== 4) {
        continue;
      }

      const portal1 = buscarPortal(
        entidades,
        link[0],
        link[1]
      );

      const portal2 = buscarPortal(
        entidades,
        link[2],
        link[3]
      );

      if (
        portal1 === undefined ||
        portal2 === undefined
      ) {
        continue;
      }

      const grupo = nuevoGrupo(numeroGrupo);
      numeroGrupo++;

      portal1[5] |= grupo;
      portal2[5] |= grupo;
    }

    for (let i = 0; i < nivel.links.length; i++) {
      const link = nivel.links[i];

      if (link.length !== 4) {
        continue;
      }

      let placa = buscarTipo(
        entidades,
        link[0],
        link[1],
        "goal"
      );

      let destinoX = link[2];
      let destinoY = link[3];

      if (placa === undefined) {
        placa = buscarTipo(
          entidades,
          link[2],
          link[3],
          "goal"
        );

        destinoX = link[0];
        destinoY = link[1];
      }

      if (placa === undefined) {
        continue;
      }

      const destino = buscarEntidad(
        entidades,
        destinoX,
        destinoY
      );

      if (
        destino === undefined ||
        destino === placa
      ) {
        continue;
      }

      let grupo = primerGrupo(destino[5]);

      if (grupo === 0) {
        grupo = nuevoGrupo(numeroGrupo);
        numeroGrupo++;
        destino[5] |= grupo;
      }

      placa[5] |= grupo;
    }
  }

  if (nivel.darkLayer !== undefined) {
    for (let y = 0; y < filas; y++) {
      if (nivel.darkLayer[y] === undefined) {
        continue;
      }

      for (let x = 0; x < columnas; x++) {
        const frame = nivel.darkLayer[y][x];

        if (!darkValido(frame)) {
          continue;
        }

        agregarEntidad(
          entidades,
          "dark",
          x,
          y,
          -1,
          frame
        );
      }
    }
  }

  return entidades;
}
