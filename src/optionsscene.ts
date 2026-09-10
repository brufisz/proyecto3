import Phaser from "phaser";

interface GameState {
    entities: {
        type: string;
        x: number;
        y: number;
        dir: number;
    }[];
}

export class OptionsScene extends Phaser.Scene {
    private prevlevel: number;
    private history: GameState[] = [];
    
    private selected = 0;

    private menuItems: Phaser.GameObjects.Text[] = [];

    init(data: { level: number, history: GameState[] }) {
        this.prevlevel = data.level;
        this.history = data.history;
    }
    
    private updateMenu() {
        const labels = ["RETURN", "OPTIONS", "EXIT"];

        for (let i = 0; i < this.menuItems.length; i++) {
            if (i === this.selected) {
                this.menuItems[i].setText("> " + labels[i]);
            } else {
                this.menuItems[i].setText(" " + labels[i]);
            }
        }
    }
    constructor() {
        super("options");
    }

    preload() {
    }

    create() {
        const options = [
            "RETURN",
            "OPTIONS",
            "EXIT"
        ];
        for (let i = 0; i < options.length; i++) {
            const text = this.add.text(
                400,
                360 + i * 40,
                options[i],
                {
                    fontFamily: "biysmall",
                    fontSize: "16px",
                    color: "#ffffff",
                }
            ).setOrigin(0.5);
            this.menuItems.push(text);
        }
        
        this.updateMenu();

        this.input.keyboard!.on("keydown-UP", () => {
            this.selected =
                (this.selected - 1 + this.menuItems.length) %
                this.menuItems.length;

            this.updateMenu();
        });

        this.input.keyboard!.on("keydown-DOWN", () => {
            this.selected =
               (this.selected + 1) %
               this.menuItems.length;

            this.updateMenu();
        });

        this.input.keyboard!.on("keydown-ENTER", () => {
            switch (this.selected) {
                case 0:
                    this.scene.start("game", {level: this.prevlevel, history: this.history});
                    break;
                
                case 1:
                    this.scene.start("options");
                    break;

                case 2:
                    this.scene.start("menu");
                    break;
            }
        });
    }
}