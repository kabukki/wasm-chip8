import { useState, useEffect } from 'react';

export const useAudio = () => {
    const [audio] = useState(new window.AudioContext());
    const [playing, setPlaying] = useState(false);
    
    useEffect(() => {
        if (playing) {
            const oscillator = audio.createOscillator();
            oscillator.connect(audio.destination);
            oscillator.type = 'sine';
            oscillator.frequency.value = 440;
            oscillator.start();
            return () => oscillator.stop();
        }
    }, [playing]);

    return {
        isPlaying: playing,
        play () {
            setPlaying(true);
        },
        pause () {
            setPlaying(false);
        },
    };
};
