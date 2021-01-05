import * as React from 'react';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import { IScrollbarShape } from '../../../Interfaces/javainterfaces';
import { createVisuObject } from '../../Objectmanagement/objectManager';

type Props = {
    shape: IScrollbarShape;
    shapeParameters: Map<string, string[][]>;
    updateFunction: Function;
};

export const VerticalScrollbar: React.FunctionComponent<Props> = ({
    shape,
    shapeParameters,
    updateFunction,
}) => {
    // Convert object to an observable one
    const state = useLocalStore(() =>
        createVisuObject(shape, shapeParameters),
    );
    // We have to calculate the values that are specific of orientation
    const centerx = state.a / 2;
    const centery = state.b1 / 2;
    // The paths are describing the triangles at the ends of the scrollbar
    const path1 =
        '' +
        centerx +
        ',' +
        0.4 * centery +
        ' ' +
        1.6 * centerx +
        ',' +
        1.6 * centery +
        ' ' +
        0.4 * centerx +
        ',' +
        1.6 * centery;
    const path2 =
        '' +
        0.4 * centerx +
        ',' +
        0.4 * centery +
        ' ' +
        1.6 * centerx +
        ',' +
        0.4 * centery +
        ' ' +
        centerx +
        ',' +
        1.6 * centery;

    // States To manage the positiong of the slideer
    const [selected, setSelected] = React.useState(false);
    const [initial, setInitial] = React.useState([0, 0]);
    // We need a reference to the rendered scrolbvar to get the rendered size of the scroll area
    const ref = React.useRef(null);

    // At least we need functions to process the user events
    // Increment and decrement the value by click on the ends
    const increment = () => {
        const upper =
            state.lowerBound < state.upperBound
                ? state.upperBound
                : state.lowerBound;
        if (state.value < upper) {
            updateFunction(state.value + 1);
        }
    };
    const decrement = () => {
        const upper =
            state.lowerBound < state.upperBound
                ? state.lowerBound
                : state.upperBound;
        if (state.value > upper) {
            updateFunction(state.value - 1);
        }
    };

    // On click of the slider the selected bit is set to true and the size of scroll area is queried
    // const start = (e: React.MouseEvent) => {
    const start = () => {
        setSelected(true);
        setInitial([
            ref.current.getBoundingClientRect().top,
            ref.current.getBoundingClientRect().bottom,
        ]);
    };

    // Handling the movement of the slider
    const move = (e: React.MouseEvent) => {
        if (selected && typeof updateFunction !== 'undefined') {
            const delta = e.pageY - initial[0];
            const spacing = initial[1] - initial[0];
            const scrollIntervall = Math.abs(
                state.upperBound - state.lowerBound,
            );

            if (!(delta < 0 || delta > spacing)) {
                // Conversion of delta to scrollvalue
                if (state.lowerBound > state.upperBound) {
                    const nextScrollvalue =
                        state.lowerBound -
                        (1 - delta / spacing) * scrollIntervall;
                    updateFunction(nextScrollvalue);
                } else {
                    const nextScrollvalue =
                        state.lowerBound +
                        (1 - delta / spacing) * scrollIntervall;
                    updateFunction(nextScrollvalue);
                }
            } else if (delta < 0) {
                updateFunction(state.upperBound);
            } else if (delta > spacing) {
                updateFunction(state.lowerBound);
            }
        }
    };

    // Return of the react node
    return useObserver(() => (
        <div
            style={{
                position: 'absolute',
                left: state.absCornerCoord.x1,
                top: state.absCornerCoord.y1,
                width: state.relCoord.width,
                height: state.relCoord.height,
            }}
            onMouseMove={move}
            onMouseUp={() => setSelected(false)}
            onMouseLeave={() => setSelected(false)}
        >
            {/* Top button */}
            <svg
                onClick={
                    state.lowerBound < state.upperBound
                        ? increment
                        : decrement
                }
                cursor={'pointer'}
                style={{
                    height: state.b1,
                    width: state.a,
                    position: 'absolute',
                    top: 0,
                }}
            >
                <rect
                    width={state.a}
                    height={state.b1}
                    style={{ fill: '#d4d0c8', stroke: 'darkgrey' }}
                />
                <polygon points={path1} />
            </svg>
            {/* Scroll area */}
            <svg
                cursor={selected ? 'pointer' : null}
                ref={ref}
                style={{
                    position: 'absolute',
                    top: state.b1,
                    height: state.relCoord.height - 2 * state.b1,
                    width: state.a,
                    backgroundColor: '#e6e6e6',
                }}
            ></svg>
            {/* Slider */}
            <svg
                cursor={'pointer'}
                style={{
                    height: state.b2,
                    width: state.a,
                    bottom: state.b1 + state.scrollvalue,
                    position: 'absolute',
                }}
            >
                <rect
                    width={state.a}
                    height={state.b2}
                    style={{ fill: '#d4d0c8', stroke: 'darkgrey' }}
                    onMouseDown={start}
                />
            </svg>
            {/* Bottom button */}
            <svg
                cursor={'pointer'}
                onClick={
                    state.lowerBound < state.upperBound
                        ? decrement
                        : increment
                }
                style={{
                    height: state.b1,
                    width: state.a,
                    position: 'absolute',
                    bottom: 0,
                }}
            >
                <rect
                    width={state.a}
                    height={state.b1}
                    style={{ fill: '#d4d0c8', stroke: 'darkgrey' }}
                />
                <polygon points={path2} />
            </svg>
        </div>
    ));
};
