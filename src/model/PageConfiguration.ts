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
            name: "leaderboard",
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
    entry: "playcenter",
    context: "/",
    auth: 1,//0-public 1-consumer 2-worker 3-admin
    navs: [
        {
            name: "playcenter",
            auth: 1,
            path: "./lobby/LobbyHome",
            uri: "playcenter",
            child: "battleHome",
            children: [
                { name: "tournamentHome", path: "./tournament/TournamentHome", uri: "tournament/home" },
                { name: "assetHome", path: "./assets/AssetListHome", uri: "asset/home" },
                { name: "battleHome", path: "./battle/RecordListHome", uri: "battle/home" },
                { name: "accountHome", path: "./signin/AccountHome", uri: "signin/home" },
                { name: "avatarList", path: "", uri: "" },
            ]
        },
        {
            name: "www",
            auth: 0,
            path: "./www/W3Home",
            uri: "w3",
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
                animate: { from: { scale: 0.5 }, to: { scale: 1 } },
                width: 1,
                height: 1,
            }
        },
        {
            name: "battleReplay",
            path: "./play/ReplayHome",
            uri: "./battle/replay",
            auth: true,
            nohistory: true,
            position: {
                closeControl: { btn: 0, confirm: 0, maskActive: 0 },
                direction: 0,
                width: 1,
                height: 1,
            }
        },
        {
            name: "leaderboard",
            path: "./leaderboard/LeaderBoardHome",
            uri: "./battle/leaderboard",
            position: {
                closeControl: { btn: 0, confirm: 0, maskActive: 0 },
                direction: 0,
                width: 0.7,
                height: 0.7,
                maxWidth: 500,
            }
        }

    ]
}
// export const W3Home =
// {
//     name: "w3",
//     context: "/w3",
//     navs: [
//         {
//             name: "w3player",
//             path: "./www/W3Home",
//             uri: "/",
//         }
//     ],
// }
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

export const AppsConfiguration: any[] = [PlayPlace]