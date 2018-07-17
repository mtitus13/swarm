class Action {
    actor: Entity;
}

class NoAction extends Action {}

class MoveAction extends Action {
    destx: number;
    desty: number;
}