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
        name: "playcenter",
        uri: "./PlayCenter",
    },

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
        uri: "./play/PlayHome",
        auth: true,
        closeType: 2,
        direction: 0,
        width: 550,
        height: 1,
    },
    {
        name: "battleReplay",
        uri: "./play/PlayHome",
        auth: true,
        direction: 4,
        width: 550,
        height: 1,
    },
    {
        name: "leaderBoard",
        uri: "./leaderboard/LeaderBoardHome",
        direction: 3,
        width: 1,
        height: 0.7,
    }

]