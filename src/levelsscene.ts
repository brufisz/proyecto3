import Phaser from "phaser";

import {
  obtenerNiveles,
  crearNivel,
  eliminarNivel,
  crearBoton,
  renombrarNivel,
} from "./niveles";

export class LevelsScene extends Phaser.Scene {

  constructor() {
    super("LevelsScene");
  }

  create(): void {
    this.add.text(40, 30, "Level Editor", {fontSize: "28px", color: "#ffffff"});
    crearBoton(this, 120, 90, 160, "+ Create New Level", () => {
        const nivel = crearNivel(10, 16);
        this.scene.start("EditorScene", {nivelId: nivel.id});
    });
    this.mostrarNiveles();
    }

//FUNCIONES!!!

private mostrarNiveles(): void {
    const niveles = obtenerNiveles();
    let y: number = 160;
    for (const nivel of niveles) {
        this.add.text(40, y, nivel.nombre, {fontSize: "18px", color: "#ffffff"}).setOrigin(0, 0.5);
        crearBoton(this, 300, y, 90, "Editar", () => {
            this.scene.start("EditorScene", {nivelId: nivel.id});
        });
        crearBoton(this, 410, y, 90, "Eliminar", () => {
            eliminarNivel(nivel.id);
            this.scene.restart();
        });
        crearBoton(this, 520, y, 90, "Renombrar", () => {
          const nuevoNombre = prompt("Nuevo nombre:", nivel.nombre);
          if (nuevoNombre === null || nuevoNombre.trim() === "") {
            return;
          }
          renombrarNivel(nivel.id, nuevoNombre.trim());
          this.scene.restart();
      });
        y = y + 60;
    }
 }









}

