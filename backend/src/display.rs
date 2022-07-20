pub const DISPLAY_WIDTH: usize = 64;
pub const DISPLAY_HEIGHT: usize = 32;
pub const VRAM_SIZE: usize = DISPLAY_WIDTH * DISPLAY_HEIGHT;
pub const FRAME_RATE: f32 = 30.0;
pub const FONT_SET: [u8; 80] = [ 
  0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
  0x20, 0x60, 0x20, 0x20, 0x70, // 1
  0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
  0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
  0x90, 0x90, 0xF0, 0x10, 0x10, // 4
  0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
  0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
  0xF0, 0x10, 0x20, 0x40, 0x40, // 7
  0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
  0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
  0xF0, 0x90, 0xF0, 0x90, 0x90, // A
  0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
  0xF0, 0x80, 0x80, 0x80, 0xF0, // C
  0xE0, 0x90, 0x90, 0x90, 0xE0, // D
  0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
  0xF0, 0x80, 0xF0, 0x80, 0x80  // F
];

fn at (x: usize, y: usize) -> usize {
    (x + y * DISPLAY_WIDTH) % (DISPLAY_WIDTH * DISPLAY_HEIGHT)
}

pub struct Display {
    /**
     * Framebuffer should be written to memory at addresses 0xF00 - 0xFFF
     */
    pub framebuffer: [bool; VRAM_SIZE],
}

impl Display {
    pub fn new () -> Self {
        Self {
            framebuffer: [false; VRAM_SIZE], 
        }
    }

    pub fn draw_pixel (&mut self, x: usize, y: usize, on: bool) {
        self.framebuffer[at(x, y)] = on;
    }

    /**
     * Sprites are up to 15 bytes (dimensions: 8x15)
     */
    pub fn draw_sprite (&mut self, x: usize, y: usize, sprite: &[u8]) -> bool {
        let mut collision = false;

        for row in 0..sprite.len() {
            for column in 0..8 {
                let (x_actual, y_actual) = ((x + column) % DISPLAY_WIDTH, (y + row) % DISPLAY_HEIGHT);

                let old = self.framebuffer[at(x_actual, y_actual)];
                let new = (sprite[row] >> (7 - column) & 1) == 1;
    
                self.draw_pixel(x_actual, y_actual, old ^ new);

                if old && new {
                    collision = true;
                }
            }
        }

        collision
    }

    pub fn clear (&mut self) {
        self.framebuffer = [false; VRAM_SIZE];
    }
}
