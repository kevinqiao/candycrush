// export const COLUMN = 7;
// export const ROW = 8;
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


export const GAME_MODE = {
    PLAY: 0,
    REPLAY: 1,
    VIEW: 2
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
    USE_SKILL: "skillUsed",
    GAME_OVER: "gameOver"
} as { [key: string]: string };


export const GAME_ACTION = {
    SWIPE_CANDY: "SWIPE_CANDY",
    SMASH_CANDY: "SMASH_CANDY",
    USE_SKILL: "USE_SKILL"
} as { [key: string]: string };

export const GAME_GOAL = [
    { id: 1, goal: [{ asset: 0, quantity: 3 }, { asset: 1, quantity: 3 }] },
    { id: 2, goal: [{ asset: 0, quantity: 10 }, { asset: 1, quantity: 10 }, { asset: 2, quantity: 10 }, { asset: 3, quantity: 10 }] },
    { id: 3, goal: [{ asset: 0, quantity: 10 }, { asset: 1, quantity: 10 }, { asset: 2, quantity: 10 }, { asset: 3, quantity: 10 }] },
]
