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

    start () {
        this.#analyzer.connect(this.#context.destination);
    }

    stop () {
        this.#analyzer.disconnect();
    }

    play () {
        this.analyze();
        this.#oscillator.connect(this.#gain);
    }

    pause () {
        this.analyze();
        this.#oscillator.disconnect();
    }

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

    set volume (volume: number) {
        this.#gain.gain.value = volume;
    }

    set type (type: OscillatorType) {
        this.#oscillator.type = type;
    }

    set frequency (frequency: number) {
        this.#oscillator.frequency.value = frequency;
    }
}
