pub const CLOCK_CPU: f64    =   500.0;
pub const CLOCK_TIMER: f64  =   60.0;

pub struct Clock {
    pub rate: f64,
    pub time: f64,
}

impl Clock {
    pub fn new (rate: f64) -> Self {
        Self {
            rate,
            time: 0.0,
        }
    }

    /**
     * Advances clock by one tick
     */
    pub fn tick (&mut self) {
        self.time += 1.0 / self.rate;
    }

    /**
     * Resets time
     */
    pub fn reset (&mut self) {
        self.time = 0.0;
    }
}

pub struct ClockDivider {
    pub rate: f64,
    pub cycles: usize,
}

impl ClockDivider {
    pub fn new (rate: f64) -> Self {
        Self {
            rate,
            cycles: 0,
        }
    }

    /**
     * Updates number of cycles and returns whether a new cycle has been run
     */
    pub fn tick (&mut self, clock: f64) -> bool {
        let previous = self.cycles;
        self.cycles = (clock / (1.0 / self.rate)) as usize;
        self.cycles != previous
    }
}
