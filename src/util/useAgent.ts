export const isRunningInTelegramApp = (): boolean => {
    const userAgent: string = navigator.userAgent || navigator.vendor || window.opera;
    return /Telegram/i.test(userAgent);
}

export const getTerminalType = (): number => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(userAgent) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)) {
        return 0;
    }
    // 检测是否在 Telegram Desktop Web Browser 中
    else if (/Windows NT|Macintosh|Linux x86_64/i.test(userAgent)) {
        return 1;
    }
    return -1;
}
