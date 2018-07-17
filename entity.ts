enum EntityAlignment {
    Character = "Character",
    Enemy = "Enemy",
}

class Entity {
    static entityIdNext = 1;
    id: number;
    x: number; y: number;
    speed: number;
    glyph: string;
    element: HTMLDivElement;
    listDiv: string;

    name: string;
    target: Entity;
    hp: number; maxhp: number;
    alignment: string;

    static charSize = 30;

    constructor() {
        this.id = Entity.entityIdNext;
        Entity.entityIdNext++;
    }

    debug(message: string) {
        let el: HTMLElement = document.querySelector(".statBlock.id-" + this.id.toString() + " .debug");
        if(el) {
            el.innerText += message + "\n";
        }
    }

    act(): Action {
        let action = null;
        if(this.target) {
            if(Math.abs(this.target.x - this.x) > Entity.charSize + 1 ||
                Math.abs(this.target.y - this.y) > Entity.charSize + 1) {
                action = new MoveAction();
                action.actor = this;

                action.destx = this.target.x;
                action.desty = this.target.y;
            }
        } else {
            action = new NoAction();
            action.actor = this;
        }

        return action;
    }

    getMoveDist(elapsedFrames: number, destx: number, desty: number): number[] {
        if(elapsedFrames > 1) elapsedFrames = 1;
        let dx = destx - this.x;
        let dy = desty - this.y;
        let mag = Math.sqrt(dx * dx + dy * dy);
        dx = dx / mag;
        dy = dy / mag;

        let dist = elapsedFrames * this.speed / 10;
        dx = dx * dist;
        dy = dy * dist;
        return [dx, dy];
    }

    setTarget(target: Entity|undefined) {
        let span: HTMLSpanElement = document.querySelector(".id-" + this.id.toString() + " .targetName");
        if(target) {
            this.target = target;

            if(span) span.innerText = target.name;
        }
        else {
            this.target = undefined;
            if(span) span.innerText = "";
        }
    }

    highlight() {
        let els: NodeListOf<Element> = document.querySelectorAll(".id-" + this.id.toString());
        for(let i = 0; i < els.length; i++) {
            let el = els[i];
            el.classList.add("highlight");
        }
        if(this.target) {
            els = document.querySelectorAll(".id-" + this.target.id.toString());
            for(let i = 0; i < els.length; i++) {
                let el = els[i];
                el.classList.add("highlightTarget");
            }
        }
    }

    stopHighlight() {
        let els: NodeListOf<Element> = document.querySelectorAll(".id-" + this.id.toString());
        for(let i = 0; i < els.length; i++) {
            let el = els[i];
            el.classList.remove("highlight");
        }

        if(this.target) {
            els = document.querySelectorAll(".id-" + this.target.id.toString());
            for(let i = 0; i < els.length; i++) {
                let el = els[i];
                el.classList.remove("highlightTarget");
            }
        }
    }

    put() {
        if(this.x && this.y && this.glyph) {
            let divEl: HTMLDivElement= document.createElement("div");
            divEl.classList.add("entity");
            divEl.classList.add(this.alignment);
            divEl.classList.add("id-" + this.id.toString());
            divEl.style.left = (this.x - Entity.charSize / 2).toString();
            divEl.style.top = (this.y - Entity.charSize / 2).toString();
            divEl.innerText = this.glyph;

            divEl.addEventListener("mouseenter", this.highlight.bind(this));
            divEl.addEventListener("mouseleave", this.stopHighlight.bind(this));
            divEl.addEventListener("click", () => Game.select(this));

            document.getElementById("view").appendChild(divEl);
            this.element = divEl;

            let statBlock: HTMLDivElement= document.createElement("div");
            statBlock.classList.add("statBlock");
            statBlock.classList.add("id-" + this.id.toString());
            statBlock.addEventListener("mouseenter", this.highlight.bind(this));
            statBlock.addEventListener("mouseleave", this.stopHighlight.bind(this));
            statBlock.addEventListener("click", () => Game.select(this));

            let nameDiv: HTMLDivElement = document.createElement("div");
            nameDiv.classList.add("entityName");
            nameDiv.innerText = this.name;
            statBlock.appendChild(nameDiv);

            let hpLabelDiv: HTMLDivElement = document.createElement("div");
            hpLabelDiv.classList.add("entityHP");
            hpLabelDiv.innerText = "HP: ";

            let hpSpan: HTMLSpanElement = document.createElement("span");
            hpSpan.classList.add("hpValue");
            hpSpan.innerText = this.hp.toString() + "/" + this.hp.toString();
            hpLabelDiv.appendChild(hpSpan);
            statBlock.appendChild(hpLabelDiv);

            let targetDiv: HTMLDivElement = document.createElement("div");
            targetDiv.classList.add("entityTarget");
            targetDiv.innerText = "Target: ";

            let targetNameSpan: HTMLSpanElement = document.createElement("span");
            targetNameSpan.classList.add("targetName");
            if(this.target) {
                targetNameSpan.innerText = this.target.name;
            }
            targetDiv.appendChild(targetNameSpan);
            statBlock.appendChild(targetDiv);

            let debug: HTMLElement = document.createElement("tt");
            debug.classList.add("debug");
            debug.innerText = "X:" + this.x.toString() + " Y:" + this.y.toString() + "\n";
            statBlock.appendChild(debug);

            let listDiv = document.getElementById(this.listDiv);
            if(listDiv) {
                listDiv.appendChild(statBlock);
            }
        }
    }

    getBox(): number[][] {
        return [[this.x - (Entity.charSize / 2), this.y - (Entity.charSize/ 2)],
            [this.x + (Entity.charSize / 2), this.y + (Entity.charSize / 2)]
            ];
    }
}

class CharacterEntity extends Entity {
    glyph = "@";
    alignment = EntityAlignment.Character;
    listDiv = "partyList";
}

class EnemyEntity extends Entity {
    glyph = "k";
    alignment = EntityAlignment.Enemy;
    listDiv = "enemyList";
}