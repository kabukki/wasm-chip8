pub struct Keypad {
    pub keys: [bool; 16],
}

impl Keypad {
    pub fn new () -> Keypad {
        return Keypad {
            keys: [false; 16],
        };
    }
}
