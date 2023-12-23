export const NavContext = [
    {
        name: "playcenter",
        uri: "./PlayCenter",
    }, {
        name: "membercenter",
        uri: "./MemberCenter",
    }
]
export const NavPages = [
    {
        name: "tournamentHome",
        context: "playcenter",
        uri: "./tournament/TournamentHome",
        cache: 0,
    },

    {
        name: "playHome",
        context: "playcenter",
        uri: "./test/TexturePlay",
    },
    {
        name: "textureList",
        context: "playcenter",
        uri: "./test/TextureList",
    },
    {
        name: "avatarList",
        context: "playcenter",
        uri: "./test/AvatarList",
    },
    {
        name: "goalPanel",
        context: "playcenter",
        uri: "./play/console/GoalPanel",
    },
    {
        name: "battleHome",
        context: "playcenter",
        uri: "./battle/BattleHome",
        cache: 0
    }
    ,
    {
        name: "accountHome",
        context: "playcenter",
        uri: "./signin/AccountHome",
        cache: 0
    }
    ,
    {
        name: "test",
        context: "playcenter",
        uri: "./signin/AccountHome",
        cache: 0
    }
    ,
    {
        name: "texturePlay",
        context: "playcenter",
        uri: "./test/TexturePlay",
    }
    ,

    {
        name: "market",
        context: "membercenter",
        uri: "./member/Market",
    },
    {
        name: "transaction",
        context: "membercenter",
        uri: "./member/Transaction",
    },
    {
        name: "reward",
        context: "membercenter",
        uri: "./member/Reward",
    }
    ,
    {
        name: "help",
        context: "membercenter",
        uri: "./member/Help",
    }
    ,
    {
        name: "membership",
        context: "membercenter",
        uri: "./member/Membership",
    }
    ,
    {
        name: "texture",
        context: "membercenter",
        uri: "./member/Membership",
    }
]
export const StackPages = [
    {
        name: "signin",
        uri: "./signin/SignIn",
        direction: 2,
        width: 500,
        height: 1,
    },
    {
        name: "battlePlay",
        uri: "./play/BattleHome",
        auth: true,
        closeType: 2,
        direction: 0,
        width: 550,
        height: 1,
    },
    {
        name: "battleReplay",
        uri: "./play/ReplayBattle",
        direction: 2,
        width: 500,
        height: 1,
    },
    {
        name: "gameReplay",
        uri: "./play/ReplayGame",
        direction: 0,
        width: 500,
        height: 1,
    }

]