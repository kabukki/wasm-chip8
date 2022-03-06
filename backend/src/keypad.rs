pub struct Keypad {
    pub state: [bool; 16],
}

impl Keypad {
    pub fn new () -> Keypad {
        return Keypad {
            state: [false; 16],
        };
    }
}
