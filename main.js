document.addEventListener("DOMContentLoaded", function () {
    Game.start();
}, false);
var Game = /** @class */ (function () {
    function Game() {
    }
    Game.start = function () {
        Game.characters = [];
        Game.enemies = [];
        var c = new CharacterEntity();
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
        var k = new EnemyEntity();
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
    };
    Game.unpause = function () {
        document.getElementById("unpauseButton").classList.add("hide");
        document.getElementById("pauseButton").classList.remove("hide");
        Game.gameState = "play";
        requestAnimationFrame(Game.gameTick);
    };
    Game.pause = function () {
        Game.gameState = "pause";
        document.getElementById("unpauseButton").classList.remove("hide");
        document.getElementById("pauseButton").classList.add("hide");
    };
    Game.gameTick = function (frameTime) {
        if (Game.lastTickTime) {
            var waiting = [];
            var elapsedFrames = frameTime - Game.lastTickTime;
            elapsedFrames = elapsedFrames / 1000 * 60; // convert from ms to sec, then 60 fps
            // Try to act. If your desired action is unprocessable, you can "wait" until everyone else has had a turn.
            for (var _i = 0, _a = Game.characters; _i < _a.length; _i++) {
                var e = _a[_i];
                var action = e.act();
                if (!Game.process(e, action, elapsedFrames))
                    waiting.push(e);
            }
            for (var _b = 0, _c = Game.enemies; _b < _c.length; _b++) {
                var e = _c[_b];
                var action = e.act();
                if (!Game.process(e, action, elapsedFrames))
                    waiting.push(e);
            }
            // If everyone waits, we're in a holding pattern, so pause the game
            if (waiting.length == Game.characters.length + Game.enemies.length) {
                Game.pause();
            }
            else {
                // let the waiters have their 2nd chance. No 3rd chance, if your action still fails you lose your turn.
                for (var _d = 0, waiting_1 = waiting; _d < waiting_1.length; _d++) {
                    var e = waiting_1[_d];
                    var action = e.act();
                    Game.process(e, action, elapsedFrames);
                }
            }
        }
        if (Game.gameState == "play") {
            Game.lastTickTime = frameTime;
            requestAnimationFrame(Game.gameTick);
        }
        else {
            Game.lastTickTime = null;
        }
    };
    Game.process = function (e, act, elapsedFrames) {
        if (act instanceof MoveAction) {
            var _a = e.getMoveDist(elapsedFrames, act.destx, act.desty), dx = _a[0], dy = _a[1];
            var destx = e.x + dx;
            var desty = e.y + dy;
            var newBox = [[destx - (Entity.charSize / 2), desty - (Entity.charSize / 2)],
                [destx + (Entity.charSize / 2), desty + (Entity.charSize / 2)]
            ];
            var collision = Game.checkCollision(e, newBox);
            if (collision.length) {
                // Try only moving along y axis
                newBox[0][0] = e.x - (Entity.charSize / 2);
                newBox[1][0] = e.x + (Entity.charSize / 2);
                collision = Game.checkCollision(e, newBox);
                if (!collision.length)
                    destx = e.x;
            }
            if (collision.length) {
                newBox[0][0] = destx - (Entity.charSize / 2);
                newBox[1][0] = destx + (Entity.charSize / 2);
                newBox[0][1] = e.y - (Entity.charSize / 2);
                newBox[1][1] = e.y + (Entity.charSize / 2);
                collision = Game.checkCollision(e, newBox);
                if (!collision.length)
                    desty = e.y;
            }
            if (!collision.length) {
                e.x = destx;
                e.y = desty;
                e.element.style.left = (destx - Entity.charSize / 2).toString();
                e.element.style.top = (desty - Entity.charSize / 2).toString();
                return true;
            }
        }
        return false;
    };
    Game.checkCollision = function (e, newBox) {
        var collisionEntities = [];
        for (var _i = 0, _a = Game.characters; _i < _a.length; _i++) {
            var e2 = _a[_i];
            if (e2.id != e.id) {
                var collision = Game.boxCollision(newBox, e2.getBox());
                if (collision) {
                    collisionEntities.push(e2);
                }
            }
        }
        for (var _b = 0, _c = Game.enemies; _b < _c.length; _b++) {
            var e2 = _c[_b];
            if (e2.id != e.id) {
                var collision = Game.boxCollision(newBox, e2.getBox());
                if (collision) {
                    collisionEntities.push(e2);
                }
            }
        }
        return collisionEntities;
    };
    /**
     *
     * @param box1 number[2][2] of upper-left and lower-right of box
     * @param box2 number[2][2] of upper-left and lower-right of box
     * @returns {boolean} true if boxes overlap (collision)
     */
    Game.boxCollision = function (box1, box2) {
        if (box1[0][0] <= box2[1][0] &&
            box1[1][0] >= box2[0][0] &&
            box1[0][1] <= box2[1][1] &&
            box1[1][1] >= box2[0][1])
            return true;
        // else
        return false;
    };
    Game.select = function (e) {
        if (Game.selected) {
            Game.selected.element.classList.remove("selected");
            var statBlock_1 = document.querySelector(".statblock.id-" + Game.selected.id.toString());
            statBlock_1.classList.remove("selected");
            if (Game.selected.target) {
                Game.selected.target.element.classList.remove("selectedTarget");
                var statBlock_2 = document.querySelector(".statblock.id-" + Game.selected.target.id.toString());
                statBlock_2.classList.remove("selectedTarget");
            }
        }
        Game.selected = e;
        e.element.classList.add("selected");
        var statBlock = document.querySelector(".statblock.id-" + e.id.toString());
        statBlock.classList.add("selected");
        if (e.target) {
            e.target.element.classList.add("selectedTarget");
            var statBlock_3 = document.querySelector(".statblock.id-" + e.target.id.toString());
            statBlock_3.classList.add("selectedTarget");
        }
        document.querySelector("#characterCommands .characterName").innerHTML = e.name;
        var commandsDiv = document.getElementById("characterCommands");
        commandsDiv.style.display = "flex";
        if (e instanceof CharacterEntity) {
            Game.showCommandButtons("mainCommands");
        }
        else {
            Game.showCommandButtons("none");
        }
    };
    Game.cancel = function () {
        if (this.commandMode != "") {
            this.commandMode = "";
            Game.showCommandButtons("mainCommands");
        }
        else {
            if (Game.selected) {
                Game.selected.element.classList.remove("selected");
                var statBlock = document.querySelector(".statblock.id-" + Game.selected.id.toString());
                statBlock.classList.remove("selected");
                if (Game.selected.target) {
                    Game.selected.target.element.classList.remove("selectedTarget");
                    var statBlock_4 = document.querySelector(".statblock.id-" + Game.selected.target.id.toString());
                    statBlock_4.classList.remove("selectedTarget");
                }
                Game.selected = null;
                document.getElementById("characterCommands").style.display = "none";
            }
        }
    };
    Game.showCommandButtons = function (id) {
        var els = document.querySelectorAll("#characterCommands .buttonGroup");
        for (var i = 0; i < els.length; i++) {
            var el_1 = els[i];
            el_1.classList.add("hide");
        }
        var el = document.querySelector("#characterCommands #" + id);
        if (el)
            el.classList.remove("hide");
    };
    Game.startSelectTarget = function () {
        Game.commandMode = "selectTarget";
        Game.showCommandButtons("selectTargetCommands");
    };
    Game.startMoveToLocation = function () {
        Game.commandMode = "moveToLocation";
        Game.showCommands("moveToLocationCommands");
    };
    Game.gameState = "pause";
    Game.selected = null;
    Game.commandMode = "";
    return Game;
}());
