import { useState } from 'react';

function useSleep(duration: number): [boolean, () => void] {
    const [isSleeping, setIsSleeping] = useState<boolean>(false);

    const sleep = () => {
        setIsSleeping(true);
        setTimeout(() => {
            setIsSleeping(false);
        }, duration);
    };

    return [isSleeping, sleep];
}

export default useSleep;
