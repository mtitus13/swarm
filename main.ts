document.addEventListener("DOMContentLoaded", function() {
    Game.start();
}, false);

class Game {
    static characters: CharacterEntity[];
    static enemies: EnemyEntity[];

    static start() {
        Game.characters = [];
        Game.enemies = [];

        let c = new CharacterEntity();
        c.hp = c.maxhp = 10;
        c.speed = 15;
        c.glyph = "@";
        c.x = 400;
        c.y = 500;
        c.name = "Maerok";
        Game.characters.push(c);
        c.put();

        c = new CharacterEntity();
        c.hp = c.maxhp = 10;
        c.speed = 20;
        c.glyph = "@";
        c.x = 100;
        c.y = 500;
        c.name = "Roku";
        Game.characters.push(c);
        c.put();

        let k = new EnemyEntity();
        k.hp = k.maxhp = 3;
        k.speed = 8;
        k.glyph = "k";
        k.x = 400;
        k.y = 100;
        k.name = "Kobold";
        Game.enemies.push(k);
        k.put();

        k = new EnemyEntity();
        k.hp = k.maxhp = 3;
        k.speed = 8;
        k.glyph = "k";
        k.x = 700;
        k.y = 100;
        k.name = "Kobold";
        Game.enemies.push(k);
        k.put();
    }

    static lastTickTime: number;
    static gameState = "pause";
    static unpause() {
        document.getElementById("unpauseButton").classList.add("hide");
        document.getElementById("pauseButton").classList.remove("hide");
        Game.gameState = "play";
        requestAnimationFrame(Game.gameTick);
    }

    static pause() {
        Game.gameState = "pause";
        document.getElementById("unpauseButton").classList.remove("hide");
        document.getElementById("pauseButton").classList.add("hide");
    }

    static gameTick(frameTime) {
        if(Game.lastTickTime) {
            let waiting: Entity[] = [];
            let elapsedFrames = frameTime - Game.lastTickTime;
            elapsedFrames = elapsedFrames / 1000 * 60; // convert from ms to sec, then 60 fps
            // Try to act. If your desired action is unprocessable, you can "wait" until everyone else has had a turn.
            for (let e of Game.characters) {
                let action = e.act();
                if(!Game.process(e, action, elapsedFrames))
                    waiting.push(e);
            }
            for (let e of Game.enemies) {
                let action = e.act();
                if(!Game.process(e, action, elapsedFrames))
                    waiting.push(e);
            }
            // If everyone waits, we're in a holding pattern, so pause the game
            if(waiting.length == Game.characters.length + Game.enemies.length) {
                Game.pause();
            } else {
                // let the waiters have their 2nd chance. No 3rd chance, if your action still fails you lose your turn.
                for(let e of waiting) {
                    let action = e.act();
                    Game.process(e, action, elapsedFrames);
                }
            }
        }
        if(Game.gameState == "play") {
            Game.lastTickTime = frameTime;
            requestAnimationFrame(Game.gameTick);
        } else {
            Game.lastTickTime = null;
        }
    }

    static process(e: Entity, act: Action, elapsedFrames:number) {
        if(act instanceof MoveAction) {
            let [dx, dy] = e.getMoveDist(elapsedFrames, act.destx, act.desty);
            let destx = e.x + dx;
            let desty = e.y + dy;
            let newBox = [[destx - (Entity.charSize / 2), desty - (Entity.charSize / 2)],
                [destx + (Entity.charSize / 2), desty + (Entity.charSize / 2)]
            ];
            let collision = Game.checkCollision(e, newBox);

            if(collision.length) {
                // Try only moving along y axis
                newBox[0][0] = e.x - (Entity.charSize/2);
                newBox[1][0] = e.x + (Entity.charSize/2);
                collision = Game.checkCollision(e, newBox);
                if(!collision.length) destx = e.x;
            }

            if(collision.length) {
                newBox[0][0] = destx - (Entity.charSize/2);
                newBox[1][0] = destx + (Entity.charSize/2);

                newBox[0][1] = e.y - (Entity.charSize/2);
                newBox[1][1] = e.y + (Entity.charSize/2);
                collision = Game.checkCollision(e, newBox);
                if(!collision.length) desty = e.y;
            }

            if(!collision.length) {
                e.x = destx;
                e.y = desty;
                e.element.style.left = (destx - Entity.charSize / 2).toString();
                e.element.style.top = (desty - Entity.charSize / 2).toString();
                return true;
            }
        }
        return false;
    }

    private static checkCollision(e: Entity, newBox): Entity[] {
        let collisionEntities = [];
        for (let e2 of Game.characters) {
            if (e2.id != e.id) {
                let collision = Game.boxCollision(newBox, e2.getBox());
                if(collision) {
                    collisionEntities.push(e2);
                }
            }
        }
        for(let e2 of Game.enemies) {
            if (e2.id != e.id) {
                let collision = Game.boxCollision(newBox, e2.getBox());
                if(collision) {
                    collisionEntities.push(e2);
                }
            }
        }
        return collisionEntities;
    }

    /**
     *
     * @param box1 number[2][2] of upper-left and lower-right of box
     * @param box2 number[2][2] of upper-left and lower-right of box
     * @returns {boolean} true if boxes overlap (collision)
     */
    static boxCollision(box1: number[][], box2: number[][]): boolean {
        if(box1[0][0] <= box2[1][0] &&
            box1[1][0] >= box2[0][0] &&
            box1[0][1] <= box2[1][1] &&
            box1[1][1] >= box2[0][1])
            return true;
        // else
        return false;
    }

    static selected: Entity = null;

    static select(e: Entity) {
        if(Game.selected) {
            Game.selected.element.classList.remove("selected");
            let statBlock = document.querySelector(".statblock.id-" + Game.selected.id.toString());
            statBlock.classList.remove("selected");

            if(Game.selected.target) {
                Game.selected.target.element.classList.remove("selectedTarget");
                let statBlock = document.querySelector(".statblock.id-" + Game.selected.target.id.toString());
                statBlock.classList.remove("selectedTarget");
            }
        }
        Game.selected = e;
        e.element.classList.add("selected");
        let statBlock = document.querySelector(".statblock.id-" + e.id.toString());
        statBlock.classList.add("selected");

        if(e.target) {
            e.target.element.classList.add("selectedTarget");
            let statBlock = document.querySelector(".statblock.id-" + e.target.id.toString());
            statBlock.classList.add("selectedTarget");
        }

        document.querySelector("#characterCommands .characterName").innerHTML = e.name;
        let commandsDiv = document.getElementById("characterCommands");
        commandsDiv.style.display = "flex";
        if(e instanceof CharacterEntity) {
            Game.showCommandButtons("mainCommands");
        } else {
            Game.showCommandButtons("none");
        }
    }

    static commandMode = "";
    static cancel() {
        if(this.commandMode != "") {
            this.commandMode = "";
            Game.showCommandButtons("mainCommands");
        } else {
            if(Game.selected) {
                Game.selected.element.classList.remove("selected");
                let statBlock = document.querySelector(".statblock.id-" + Game.selected.id.toString());
                statBlock.classList.remove("selected");

                if(Game.selected.target) {
                    Game.selected.target.element.classList.remove("selectedTarget");
                    let statBlock = document.querySelector(".statblock.id-" + Game.selected.target.id.toString());
                    statBlock.classList.remove("selectedTarget");
                }
                Game.selected = null;
                document.getElementById("characterCommands").style.display = "none";
            }
        }
    }

    static showCommandButtons(id: string) {
        let els = document.querySelectorAll("#characterCommands .buttonGroup");
        for(let i = 0; i < els.length; i++) {
            let el = els[i];
            el.classList.add("hide");
        }
        let el = document.querySelector("#characterCommands #" + id);
        if(el)
            el.classList.remove("hide");
    }

    static startSelectTarget() {
        Game.commandMode = "selectTarget";
        Game.showCommandButtons("selectTargetCommands");
    }

    static startMoveToLocation() {
        Game.commandMode = "moveToLocation";
        Game.showCommands("moveToLocationCommands");
    }
}