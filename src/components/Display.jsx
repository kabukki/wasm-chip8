import React, { useEffect, useRef } from 'react';

export const Display = ({ data, width, height, scale = 8, settings, children }) => {
    const canvas = useRef(null);

    useEffect(() => {
        const context = canvas.current.getContext('2d');

        requestAnimationFrame(() => {
            if (data) {
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        context.fillStyle = data[x + y * width] === 1 ? settings.colorOn : settings.colorOff;
                        context.fillRect(x * scale, y * scale, scale, scale);
                    }
                }
            } else {
                context.fillStyle = settings.colorOff;
                context.fillRect(0, 0, width * scale, height * scale);
            }
        });
    }, [data]);

    return (
        <div className="relative">
            <canvas
                className="block rounded"
                style={{ imageRendering: 'pixelated' }}
                ref={canvas}
                width={width * scale}
                height={height * scale}
            />
            <div className="absolute left-1 top-1">
                {children}
            </div>
        </div>
    );
};
