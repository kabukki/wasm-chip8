pub struct Display {
    // Framebuffer should be written to memory at addresses 0xF00 - 0xFFF
    framebuffer: [u8; 64 * 32],
}

impl Display {
    fn draw (&mut self, x: u8, y: u8, on: bool) {
        self.framebuffer[(x + y * 64) as usize] = if (on) { 1 } else { 0 };
    }

    fn clear (&mut self) {
        self.framebuffer = [0; 64 * 32];
    }
}

pub static DISPLAY: Display = Display {
    framebuffer: [0; 64 * 32], 
};
