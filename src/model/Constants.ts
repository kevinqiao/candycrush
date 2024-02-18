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
export const BATTLE_LOAD = {
    PLAY: 0,
    REPLAY: 1,
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
    USE_SKILL: "skillUsed",
    GAME_OVER: "gameOver"
} as { [key: string]: string };
export const GAME_STATUS = {
    OPEN: 0,
    END: 1,
    SETTLED: 2
}
export const BATTLE_STATUS = {
    OPEN: 0,
    END: 1,
    SETTLED: 2
}
export const GAME_ACTION = {
    SWIPE_CANDY: "SWIPE_CANDY",
    SMASH_CANDY: "SMASH_CANDY",
    USE_SKILL: "USE_SKILL"
} as { [key: string]: string };
// export const GAME_PLAY_TIME = 600000
export const CHANNEL_AUTH = {
    CLERK: 0,
    TELEGRAM_BOT: 1,
    THIRD_WEB: 2,
};
export const GAME_TYPE = {
    MATCH3: 1,
    KUMU: 2,
    SOLITAIRE: 3
}
export const BATTLE_SEARCH_MAX_TIME = 2500;
export const BATTLE_COUNT_DOWN_TIME = 10000;
export const getEventByAction = (action: string): string | null => {
    for (const k in GAME_ACTION) {
        const v = GAME_ACTION[k];
        if (v === action) {
            return GAME_EVENT[k]
        }
    }
    return null
}