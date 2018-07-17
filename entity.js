var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var EntityAlignment;
(function (EntityAlignment) {
    EntityAlignment["Character"] = "Character";
    EntityAlignment["Enemy"] = "Enemy";
})(EntityAlignment || (EntityAlignment = {}));
var Entity = /** @class */ (function () {
    function Entity() {
        this.id = Entity.entityIdNext;
        Entity.entityIdNext++;
    }
    Entity.prototype.debug = function (message) {
        var el = document.querySelector(".statBlock.id-" + this.id.toString() + " .debug");
        if (el) {
            el.innerText += message + "\n";
        }
    };
    Entity.prototype.act = function () {
        var action = null;
        if (this.target) {
            if (Math.abs(this.target.x - this.x) > Entity.charSize + 1 ||
                Math.abs(this.target.y - this.y) > Entity.charSize + 1) {
                action = new MoveAction();
                action.actor = this;
                action.destx = this.target.x;
                action.desty = this.target.y;
            }
        }
        else {
            action = new NoAction();
            action.actor = this;
        }
        return action;
    };
    Entity.prototype.getMoveDist = function (elapsedFrames, destx, desty) {
        if (elapsedFrames > 1)
            elapsedFrames = 1;
        var dx = destx - this.x;
        var dy = desty - this.y;
        var mag = Math.sqrt(dx * dx + dy * dy);
        dx = dx / mag;
        dy = dy / mag;
        var dist = elapsedFrames * this.speed / 10;
        dx = dx * dist;
        dy = dy * dist;
        return [dx, dy];
    };
    Entity.prototype.setTarget = function (target) {
        var span = document.querySelector(".id-" + this.id.toString() + " .targetName");
        if (target) {
            this.target = target;
            if (span)
                span.innerText = target.name;
        }
        else {
            this.target = undefined;
            if (span)
                span.innerText = "";
        }
    };
    Entity.prototype.highlight = function () {
        var els = document.querySelectorAll(".id-" + this.id.toString());
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            el.classList.add("highlight");
        }
        if (this.target) {
            els = document.querySelectorAll(".id-" + this.target.id.toString());
            for (var i = 0; i < els.length; i++) {
                var el = els[i];
                el.classList.add("highlightTarget");
            }
        }
    };
    Entity.prototype.stopHighlight = function () {
        var els = document.querySelectorAll(".id-" + this.id.toString());
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            el.classList.remove("highlight");
        }
        if (this.target) {
            els = document.querySelectorAll(".id-" + this.target.id.toString());
            for (var i = 0; i < els.length; i++) {
                var el = els[i];
                el.classList.remove("highlightTarget");
            }
        }
    };
    Entity.prototype.put = function () {
        var _this = this;
        if (this.x && this.y && this.glyph) {
            var divEl = document.createElement("div");
            divEl.classList.add("entity");
            divEl.classList.add(this.alignment);
            divEl.classList.add("id-" + this.id.toString());
            divEl.style.left = (this.x - Entity.charSize / 2).toString();
            divEl.style.top = (this.y - Entity.charSize / 2).toString();
            divEl.innerText = this.glyph;
            divEl.addEventListener("mouseenter", this.highlight.bind(this));
            divEl.addEventListener("mouseleave", this.stopHighlight.bind(this));
            divEl.addEventListener("click", function () { return Game.select(_this); });
            document.getElementById("view").appendChild(divEl);
            this.element = divEl;
            var statBlock = document.createElement("div");
            statBlock.classList.add("statBlock");
            statBlock.classList.add("id-" + this.id.toString());
            statBlock.addEventListener("mouseenter", this.highlight.bind(this));
            statBlock.addEventListener("mouseleave", this.stopHighlight.bind(this));
            statBlock.addEventListener("click", function () { return Game.select(_this); });
            var nameDiv = document.createElement("div");
            nameDiv.classList.add("entityName");
            nameDiv.innerText = this.name;
            statBlock.appendChild(nameDiv);
            var hpLabelDiv = document.createElement("div");
            hpLabelDiv.classList.add("entityHP");
            hpLabelDiv.innerText = "HP: ";
            var hpSpan = document.createElement("span");
            hpSpan.classList.add("hpValue");
            hpSpan.innerText = this.hp.toString() + "/" + this.hp.toString();
            hpLabelDiv.appendChild(hpSpan);
            statBlock.appendChild(hpLabelDiv);
            var targetDiv = document.createElement("div");
            targetDiv.classList.add("entityTarget");
            targetDiv.innerText = "Target: ";
            var targetNameSpan = document.createElement("span");
            targetNameSpan.classList.add("targetName");
            if (this.target) {
                targetNameSpan.innerText = this.target.name;
            }
            targetDiv.appendChild(targetNameSpan);
            statBlock.appendChild(targetDiv);
            var debug = document.createElement("tt");
            debug.classList.add("debug");
            debug.innerText = "X:" + this.x.toString() + " Y:" + this.y.toString() + "\n";
            statBlock.appendChild(debug);
            var listDiv = document.getElementById(this.listDiv);
            if (listDiv) {
                listDiv.appendChild(statBlock);
            }
        }
    };
    Entity.prototype.getBox = function () {
        return [[this.x - (Entity.charSize / 2), this.y - (Entity.charSize / 2)],
            [this.x + (Entity.charSize / 2), this.y + (Entity.charSize / 2)]
        ];
    };
    Entity.entityIdNext = 1;
    Entity.charSize = 30;
    return Entity;
}());
var CharacterEntity = /** @class */ (function (_super) {
    __extends(CharacterEntity, _super);
    function CharacterEntity() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.glyph = "@";
        _this.alignment = EntityAlignment.Character;
        _this.listDiv = "partyList";
        return _this;
    }
    return CharacterEntity;
}(Entity));
var EnemyEntity = /** @class */ (function (_super) {
    __extends(EnemyEntity, _super);
    function EnemyEntity() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.glyph = "k";
        _this.alignment = EntityAlignment.Enemy;
        _this.listDiv = "enemyList";
        return _this;
    }
    return EnemyEntity;
}(Entity));
var CharacterEntity = /** @class */ (function (_super) {
    __extends(CharacterEntity, _super);
    function CharacterEntity() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.glyph = "@";
        _this.alignment = EntityAlignment.Character;
        _this.listDiv = "partyList";
        return _this;
    }
    return CharacterEntity;
}(Entity));
var EnemyEntity = /** @class */ (function (_super) {
    __extends(EnemyEntity, _super);
    function EnemyEntity() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.glyph = "k";
        _this.alignment = EntityAlignment.Enemy;
        _this.listDiv = "enemyList";
        return _this;
    }
    return EnemyEntity;
}(Entity));
