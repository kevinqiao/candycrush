export const NavPages = [
    {
        name: "tournamentHome",
        uri: "./tournament/TournamentHome",
        auth:true
    },
    {
        name: "playHome",
        uri: "./play/PlayHome",
    },
    {
        name: "battleHome",
        uri: "./battle/BattleHome",
    }
    ,
    {
        name: "accountHome",
        uri: "./signin/AccountHome",
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
        uri: "./play/BattlePlay",
        auth: true,
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
    }

]