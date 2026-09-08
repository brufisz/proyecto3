import Phaser from "phaser";

import {
  obtenerNiveles,
  crearNivel,
  eliminarNivel,
} from "./niveles";

export class LevelsScene extends Phaser.Scene {

  constructor() {
    super("LevelsScene");
  }

  create(): void {
    this.add.text(40, 30, "Level Editor", {fontSize: "28px", color: "#ffffff"});
    this.crearBoton(120, 90, 160, "+ Create New Level", () => {
        const nivel = crearNivel(10, 16);
        this.scene.start("EditorScene", {nivelId: nivel.id});
    });
    this.mostrarNiveles();
    }

//FUNCIONES!!!

  private crearBoton(x: number, y: number, ancho: number, texto: string, accion: () => void): Phaser.GameObjects.Rectangle {
    const fondo = this.add.rectangle(x, y, ancho, 40, 0x333333);
    fondo.setInteractive({ useHandCursor: true })
    fondo.setStrokeStyle(1, 0x777777);
    this.add.text(x, y, texto,
      {
        fontSize: "16px",
        color: "#ffffff",
      },
    ).setOrigin(0.5);
    fondo.on("pointerdown", () => {
      accion();
    });
    return fondo;
  }

private mostrarNiveles(): void {
    const niveles = obtenerNiveles();
    let y: number = 160;
    for (const nivel of niveles) {
        this.add.text(40, y, nivel.nombre, {fontSize: "18px", color: "#ffffff"}).setOrigin(0, 0.5);
        this.crearBoton(300, y, 90, "Editar", () => {
            this.scene.start("EditorScene", {nivelId: nivel.id});
        });
        this.crearBoton(410, y, 90, "Eliminar", () => {
            eliminarNivel(nivel.id);
            this.scene.restart();
        });
        y = y + 60;
    }
 }









}

