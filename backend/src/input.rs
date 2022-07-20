pub struct Keypad {
    pub state: [bool; 16],
}

impl Keypad {
    pub fn new () -> Self {
        Self {
            state: [false; 16],
        }
    }
}
