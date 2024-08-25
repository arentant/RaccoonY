import React from "react";

import {
    TransformWrapper,
    TransformComponent,
    useControls,
} from "react-zoom-pan-pinch";

const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();

    return (
        <div className="tools">
            <button onClick={() => zoomIn()}>+</button>
            <button onClick={() => zoomOut()}>-</button>
            <button onClick={() => resetTransform()}>x</button>
        </div>
    );
};

const TestApp = ({ children }: { children: React.ReactNode }) => {
    return (
        <TransformWrapper
            minScale={0.2}
            maxScale={3}
            wheel={{ step: 50 }}
            initialPositionX={0}
            initialPositionY={0}
            panning={{
                allowMiddleClickPan: true,
                
                wheelPanning: true,
                excluded: ['hex']

            }}
            
            alignmentAnimation={{
                sizeX: 10000000000,
                sizeY: 10000000000,
                disabled: true,
                animationType: 'linear',

            }}

        >
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <>
                    <Controls />
                    <TransformComponent>
                        {children}
                    </TransformComponent>
                </>
            )}
        </TransformWrapper>
    );
};

export default TestApp