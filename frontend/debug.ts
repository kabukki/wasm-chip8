import { Emulator } from '../backend/pkg';

class Memoizable {
    protected memoize (name: string, getter: () => unknown) {
        Object.defineProperty(this, name, {
            get () {
                try {
                    Object.defineProperty(this, name, {
                        value: getter(),
                        writable: false,
                    });
                    return this[name];
                } catch (err) {
                    console.warn(`Failed to get value of ${name}`, err.message);
                    return null;
                }
            },
            configurable: true,
        });    
    }
}

class DebugDisassembly extends Memoizable {
    constructor (private vm: Emulator) {
        super();
        this.memoize('total', () => vm.debug_disassembly_total());
    }

    at (address: number) {
        return this.vm.debug_disassembly_at(address);
    }

    addressToIndex (address: number) {
        return this.vm.debug_disassembly_address_to_index(address);
    }

    indexToAddress (index: number) {
        return this.vm.debug_disassembly_index_to_address(index);
    }
}

class DebugCpu extends Memoizable {
    constructor (vm: Emulator) {
        super();
        this.memoize('clock', () => vm.debug_cpu_clock());
        this.memoize('clockTimer', () => vm.debug_cpu_clock_timer());
        this.memoize('pc', () => vm.debug_cpu_pc());
        this.memoize('sp', () => vm.debug_cpu_sp());
        this.memoize('v', () => vm.debug_cpu_v());
        this.memoize('i', () => vm.debug_cpu_i());
        this.memoize('stack', () => vm.debug_cpu_stack());
        this.memoize('dt', () => vm.debug_cpu_dt());
        this.memoize('st', () => vm.debug_cpu_st());
    }
}

export class Debug extends Memoizable {
    constructor (vm: Emulator) {
        super();
        this.memoize('cpu', () => new DebugCpu(vm));
        this.memoize('disassembly', () => new DebugDisassembly(vm));
        this.memoize('memory', () => vm.debug_memory());
        this.memoize('input', () => vm.debug_input());
        this.memoize('clock', () => vm.debug_clock());
    }
}
