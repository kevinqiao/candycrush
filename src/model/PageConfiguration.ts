export const Telegram =
{
    name: "telegram",
    context: "tg",
    navs: [
        {
            name: "playcenter",
            path: "./PlayCenter",
            uri: "playcenter",
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
    navs: [
        {
            name: "playcenter",
            path: "./PlayCenter",
            uri: "playcenter",
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
export const Covers = [
    {
        name: "signin",
        path: "./signin/SignIn",
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

export const AppsConfiguration = [PlayPlace, Telegram]