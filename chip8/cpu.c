#include "cpu.h"

// extern int size;

uint8_t       rom[4096];
int           map_offset = 1;
unsigned int  map[16384] = { 0xAA000000 };

int add (int first, int second) {
  return first + second;
}

void tick () {
  if (map_offset < 16384) {
    map[map_offset] = 0xAA000000 + map_offset;
    map_offset++;
  }
}

int main () {
  CPU cpu;

  while (cpu.pc < 4096) {
    uint16_t opcode = (rom[cpu.pc] << 8) + rom[cpu.pc];
    map[map_offset++] = opcode;
    cpu.pc++;
  }

  return 0;
}
