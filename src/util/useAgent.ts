export const isRunningInTelegramApp = (): boolean => {
    const userAgent: string = navigator.userAgent || navigator.vendor || window.opera;
    return /Telegram/i.test(userAgent);
}
