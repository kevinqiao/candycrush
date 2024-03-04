import { useCallback } from "react";


export const useAuthorize = () => {

    const authClerk = useCallback(async (token: string): Promise<any> => {
        const url = "http://localhost/clerk";
        // const url = "https://telegram-bot-8bgi.onrender.com/clerk";
        console.log("clerk token:" + token)
        const res = await fetch(url, {
            method: "GET", // 或 'POST', 'PUT', 'DELETE' 等
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // 将 token 添加到请求头中
                mode: "cors",
            },
        });
        const json = await res.json();
        return json

    }, [])
    const authTgbot = useCallback(async (data: any): Promise<any> => {
        const BOT_URL = "https://telegram-bot-8bgi.onrender.com/tg/auth";
        const res = await fetch(BOT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ authData: data }),
        })
        const json = await res.json();
        return json

    }, [])


    return { authClerk, authTgbot }
}