#ifndef CPU_H_
#define CPU_H_

#include <stdint.h>

typedef struct {
    uint8_t     v[16];          // Registers
    uint16_t    pc;             // Program counter
    int         stack[16];      // Stack origin
    int         sp;             // Stack pointer
} CPU;

#endif
