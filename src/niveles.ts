export type Nivel = {
    id: string;
    nombre: string;
    ancho?: number;
    alto?: number
    tablero: number[][];
  };
  
export function obtenerNiveles(): Nivel[] {
    const texto = localStorage.getItem("niveles");
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