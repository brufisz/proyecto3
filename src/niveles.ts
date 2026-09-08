//EXPERIMENTACION DE BACK

export type Nivel = {
    id: string;
    nombre: string;
    ancho?: number;
    alto?: number;
    tablero: number[][];
  };

export function guardarNiveles(niveles: Nivel[]): void {
  localStorage.setItem("nivelesCreados", JSON.stringify(niveles));
}
  
export function obtenerNiveles(): Nivel[] {
    const texto = localStorage.getItem("nivelesCreados");
    if (texto === null) {
     return [];
    }
    return JSON.parse(texto);
}

export function crearNivel(filas: number, columnas: number): Nivel {
    const niveles = obtenerNiveles();
    const tablero: number[][] = [];
    for (let fila = 0; fila < filas; fila++) {
      const nuevaFila: number[] = [];
      for (let columna = 0; columna < columnas; columna++) {
        nuevaFila.push(0);
      }
      tablero.push(nuevaFila);
    }
    let nuevaId = 1;
    for (const nivel of niveles) {
        const idNumerica = Number(nivel.id);
        if (idNumerica >= nuevaId) {
            nuevaId = idNumerica + 1;
        }
    }
    const nivel: Nivel = {
      id: nuevaId.toString(),
      nombre: 'Untitled Level',
      tablero: tablero,
    };
    niveles.push(nivel);  
    return nivel;
  }

  export function eliminarNivel(id: string): void {
    const nivelesLista = obtenerNiveles();
    const nivelesRestantes = nivelesLista.filter((nivel) => {
      return nivel.id !== id;
    });
    guardarNiveles(nivelesRestantes);
  }

  export function obtenerNivel(id: string): Nivel | undefined {
    const niveles = obtenerNiveles();
    return niveles.find((item) => {
      return item.id === id;
    });
  }

  export function actualizarNivel(nivelActualizado: Nivel): void {
    const nivelesLista = obtenerNiveles();
    const indice = nivelesLista.findIndex((item) => {
      return item.id === nivelActualizado.id;
    });
    if (indice === -1) {
      return;
    }
    nivelesLista[indice] = nivelActualizado;
    guardarNiveles(nivelesLista);
  }