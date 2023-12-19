export const COLUMN = 7;
export const ROW = 8;
export const MOVE_DIRECTION = {
    RIGHT: 1,
    LEFT: 3,
    UP: 4,
    DOWN: 2
};
export const MATCH_DIRECTION = {
    HORIZATION: 1,
    VERTICAL: 2
};
export const BATTLE_TYPE = {
    SOLO: 0,
    SYNC: 1,
    TURN: 2,
    REPLAY: 3
}

export const GAME_MODE = {
    PLAY: 0,
    REPLAY: 1,
    VIEW: 2
}
export const STACK_PAGE_DIRECTION = {
    TOP: 1,
    LEFT: 4,
    BOTTOM: 3,
    RIGHT: 2,
    CENTER: 0
}
export const CANDY_CONN = {
    HORIZONTAL: 28,
    VERTICAL: 29
}
export const CANDY_SMASH_TYPE = {
    LINE: 1,
    EXPLODE: 2,
    FLY: 3,
    SQUASH: 4,
    DIG: 5,
    OTHER: 6
}
export const CANDY_MATCH_TYPE = {
    LINE: 0,
    TMODEL: 1,
    LMODEL: 2,
}
export const BATTLE_DURATION = 180000
export const SCENE_NAME = {
    BATTLE_LOADING: "loading_battle",
    BATTLE_MATCHING: "matching_battle",
    BATTLE_CONSOLE: "battle_console",
    BATTLE_GROUND: "battle_ground",
    BATTLE_FRONT: "battle_front",
    BATTLE_SCENE: "battle_scene"
}
export const SCENE_TYPE = {
    PIXI_APPLICATION: 0,
    HTML_DIVELEMENT: 1
}

export const GAME_EVENT = {
    SWIPE_CANDY: "cellSwapped",
    SMESH_CANDY: "cellSmeshed",
    GAME_OVER: "gameOver"

}
export const GAME_ACTION = {
    SWIPE_CANDY: "SWIPE_CANDY",
    SMASH_CANDY: "SMASH_CANDY",
    USE_SKILL: "USE_SKILL"
}
export const GAME_PLAY_TIME = 600000