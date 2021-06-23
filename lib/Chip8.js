import { Chip8 } from './pkg';

export class EmulatorAudio {
    constructor (type) {
        this.type = type;
        this.ctx = new window.AudioContext();
        this.oscillator = null;
    }

    play () {
        if (!this.oscillator) {
            this.oscillator = this.ctx.createOscillator();
            this.oscillator.connect(this.ctx.destination);
            this.oscillator.type = this.type;
            this.oscillator.frequency.value = 440;
            this.oscillator.start();
        }
    }
    
    pause () {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
    }
};

export class EmulatorKeypad extends EventTarget {
    constructor (settings) {
        super();
        this.map = settings.map;
        document.addEventListener('keydown', this.onKeydown.bind(this));
        document.addEventListener('keyup', this.onKeyup.bind(this));
    }

    onKeydown ({ key }) {
        if (key in this.map) {
            this.dispatchEvent(new CustomEvent('keydown', {
                detail: {
                    nativeKey: key,
                    mappedKey: this.map[key],
                },
            }));
        }
    }

    onKeyup ({ key }) {
        if (key in this.map) {
            this.dispatchEvent(new CustomEvent('keyup', {
                detail: {
                    nativeKey: key,
                    mappedKey: this.map[key],
                },
            }));
        }
    }
}

export class EmulatorDisplay {
    constructor (fn) {
        this.fn = fn;
    }

    render (framebuffer) {
        this.fn(framebuffer);
    }
}

export class Emulator {
    constructor ({
        wasm,
        rom,
        settings,
        audio,
        keypad,
        display,
    }) {
        this.chip8 = Chip8.new(rom);
        this.intervals = [];
        this.wasm = wasm;
        this.settings = settings;
        this.audio = audio;
        this.keypad = keypad;
        this.display = display;
        this.keypad.addEventListener('keydown', ({ detail: { mappedKey } }) => {
            this.chip8.set_key(mappedKey, true);
        });
        this.keypad.addEventListener('keyup', ({ detail: { mappedKey } }) => {
            this.chip8.set_key(mappedKey, false);
        });
    }

    get shouldBeep () {
        return this.chip8.beep();
    }

    start ({
        onError,
    }) {
        this.intervals = [
            [this.cycleCPU.bind(this), this.settings.core.clockSpeed],
            [this.cycleTimers.bind(this), this.settings.core.timerFrequency],
            [this.cycleDisplay.bind(this), this.settings.display.refreshRate],
        ].map(([fn, interval]) => {
            return setInterval(() => {
                try {
                    fn();
                } catch (err) {
                    onError(err);
                }
            }, interval);
        });
    }

    stop () {
        this.intervals.forEach(window.clearInterval);
    }

    cycleCPU () {
        const instruction = this.chip8.step_cpu();
        // onCPU?.(instruction);
    }

    cycleTimers () {
        this.chip8.step_timers();
        if (this.settings.audio) {
            if (this.chip8.beep()) {
                this.audio.play();
            } else {
                this.audio.pause();
            }
        }
    }

    cycleDisplay () {
        this.display.render(new Uint8Array(this.wasm.memory.buffer, this.chip8.get_framebuffer(), 2048));
    }
}

export { default as init } from './pkg';
