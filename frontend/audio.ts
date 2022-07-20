
 export const useAudio = (type: OscillatorType = 'sine', frequency = 440) => {
    // const raf = useAnimationFrame();
    // const [context] = useState(() => new AudioContext());
    // const [gain] = useState(() => {
    //     const gain = context.createGain();
    //     gain.gain.value = 1;
    //     return gain;
    // });
    // const [oscillator] = useState(() => {
    //     const oscillator = context.createOscillator();
    //     oscillator.type = type;
    //     oscillator.frequency.value = frequency;
    //     return oscillator;
    // });
    // const [analyzer] = useState(() => {
    //     const analyzer = context.createAnalyser();
    //     analyzer.minDecibels = -100;
    //     analyzer.maxDecibels = 0;
    //     analyzer.smoothingTimeConstant = 0;
    //     return analyzer;
    // });
    // const [data] = useState(() => ({
    //     timeDomain: new Uint8Array(analyzer.fftSize),
    //     frequency: new Uint8Array(analyzer.frequencyBinCount),
    // }));

    // const analyze = () => {
    //     analyzer.getByteFrequencyData(data.frequency);
    //     analyzer.getByteTimeDomainData(data.timeDomain);
    // };
    
    // useEffect(() => {
    //     gain.connect(analyzer);
    //     oscillator.start();
    // }, []);

    return {
        // baseType: oscillator.type,
        // sampleRate: context.sampleRate,
        // data,
        // start () {
        //     raf.start(analyze);
        //     analyzer.connect(context.destination);
        // },
        // stop () {
        //     raf.stop();
        //     analyzer.disconnect();
        // },
        // play () {
        //     analyze();
        //     return oscillator.connect(gain);
        // },
        // pause () {
        //     analyze();
        //     return oscillator.disconnect();
        // },
        // volume (volume) {
        //     gain.gain.value = volume;
        // },
        // type (type) {
        //     oscillator.type = type;
        // },
        // frequency (frequency) {
        //     oscillator.frequency.value = frequency;
        // },
    };
};


/**
 * oscillator -> gain -> analyzer -> destination
 */
export class Audio {
    #context: AudioContext;
    #oscillator: OscillatorNode;
    #gain: GainNode;
    #analyzer: AnalyserNode;
    data: {
        timeDomain: Uint8Array,
        frequency: Uint8Array,
    };

    constructor (type: OscillatorType = 'sine', frequency = 440) {
        this.#context = new AudioContext();
        this.#oscillator = this.#context.createOscillator()
        this.#oscillator.type = type;
        this.#oscillator.frequency.value = frequency;
        this.#gain = this.#context.createGain();
        this.#gain.gain.value = 1;
        this.#analyzer = this.#context.createAnalyser();
        this.#analyzer.minDecibels = -100;
        this.#analyzer.maxDecibels = 0;
        this.#analyzer.smoothingTimeConstant = 0;
        this.data = {
            timeDomain: new Uint8Array(this.#analyzer.fftSize),
            frequency: new Uint8Array(this.#analyzer.frequencyBinCount),
        };

        this.#gain.connect(this.#analyzer);
        this.#oscillator.start();
    }

    /**
     * Enable sound output
     */
    start () {
        this.#analyzer.connect(this.#context.destination);
    }

    /**
     * Disable sound output
     */
    stop () {
        this.#analyzer.disconnect();
    }

    /**
     * Play oscillator
     */
    play () {
        this.analyze();
        this.#oscillator.connect(this.#gain);
    }

    /**
     * Stop oscillator
     */
    pause () {
        this.analyze();
        this.#oscillator.disconnect();
    }

    /**
     * Store analyzer info
     */
    analyze () {
        this.#analyzer.getByteFrequencyData(this.data.frequency);
        this.#analyzer.getByteTimeDomainData(this.data.timeDomain);
    }

    get sampleRate () {
        return this.#context.sampleRate;
    }

    get type () {
        return this.#oscillator.type;        
    }

    set volume (volume) {
        this.#gain.gain.value = volume;
    }

    set type (type) {
        this.#oscillator.type = type;
    }

    set frequency (frequency) {
        this.#oscillator.frequency.value = frequency;
    }
}
