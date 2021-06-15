class Display {
    // Framebuffer should be written to memory at addresses 0xF00 - 0xFFF
    framebuffer: u8[] = new Array(64 * 32);

    draw (x: u8, y: u8, on: bool): void {
        this.framebuffer[x + y * 64] = on ? 1 : 0;
    }

    clear (): void {
        this.framebuffer.fill(0);
    }
}

export const display = new Display();
