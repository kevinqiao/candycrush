export const Telegram =
{
    name: "telegram",
    context: "tg",
    authLife: 1,
    navs: [
        {
            name: "playcenter",
            path: "./PlayCenter",
            uri: "playcenter",
            child: "tournamentHome",
            children: [
                { name: "tournamentHome", path: "./tournament/TournamentHome", uri: "tournament/home" },
                { name: "textureList", path: "", uri: "" },
                { name: "battleHome", path: "./battle/BattleHome", uri: "battle/home" },
                { name: "accountHome", path: "./signin/AccountHome", uri: "signin/home" },
                { name: "avatarList", path: "", uri: "" },
            ]
        }
    ],
    stacks: [

        {
            name: "battlePlay",
            path: "./play/PlayHome",
            uri: "./play/PlayHome",
            auth: true,
            nohistory: true,
            position: {
                closeControl: { btn: 0, confirm: 1, maskActive: 1 },
                direction: 0,
                width: 550,
                height: 1,
            }
        },
        {
            name: "battleReplay",
            path: "./play/PlayHome",
            uri: "./play/PlayHome",
            auth: true,
            position: {
                direction: 4,
                width: 550,
                height: 1,
            }
        },
        {
            name: "leaderBoard",
            path: "./leaderboard/LeaderBoardHome",
            uri: "./leaderboard/LeaderBoardHome",
            position: {
                closeControl: { btn: 0, confirm: 1, maskActive: 1 },
                direction: 3,
                width: 1,
                height: 0.7,
            }
        }

    ]
}
export const PlayPlace =
{
    name: "playPlace",
    context: "match3",
    auth: true,
    navs: [
        {
            name: "playcenter",
            path: "./lobby/LobbyHome",
            uri: "playcenter",
            child: "battleHome",
            children: [
                { name: "tournamentHome", path: "./tournament/TournamentHome", uri: "tournament/home" },
                { name: "textureList", path: "", uri: "" },
                { name: "battleHome", path: "./battle/BattleHome", uri: "battle/home" },
                { name: "accountHome", path: "./signin/AccountHome", uri: "signin/home" },
                { name: "avatarList", path: "", uri: "" },
            ]
        }
    ],
    stacks: [

        {
            name: "battlePlay",
            path: "./play/PlayHome",
            uri: "./play/PlayHome",
            auth: true,
            nohistory: false,
            position: {
                closeControl: { btn: 0, confirm: 1, maskActive: 1 },
                direction: 0,
                width: 1,
                height: 1,
            }
        },
        {
            name: "battleReplay",
            path: "./play/PlayHome",
            uri: "./play/PlayHome",
            auth: true,
            position: {
                direction: 4,
                width: 550,
                height: 1,
            }
        },
        {
            name: "leaderBoard",
            path: "./leaderboard/LeaderBoardHome",
            uri: "./leaderboard/LeaderBoardHome",
            position: {
                closeControl: { btn: 0, confirm: 1, maskActive: 1 },
                direction: 3,
                width: 1,
                height: 0.7,
            }
        }

    ]
}
export const W3Home =
{
    name: "w3",
    context: "/",
    navs: [
        {
            name: "w3player",
            path: "./www/W3Home",
            uri: "/",
        }
    ],
}
export const Covers = [
    {
        name: "signin",
        path: "./signin/LogIn",
        uri: "signin",
        position: {
            closeControl: { btn: 0, confirm: 1, maskActive: 1 },
            direction: 2,
            width: 500,
            height: 1,
        }
    },
    {
        name: "member",
        path: "./member/MemberHome",
        uri: "signin",
        nohistory: true,
        position: {
            closeControl: { btn: 0, confirm: 1, maskActive: 1 },
            direction: 2,
            width: 500,
            height: 1,
        }
    }
]

export const AppsConfiguration: any = [PlayPlace, Telegram, W3Home]