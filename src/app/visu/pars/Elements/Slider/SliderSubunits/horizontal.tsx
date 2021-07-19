import * as React from 'react';
import { ISliderShape } from '../../../../Interfaces/javainterfaces';
import { createVisuObject } from '../../../Objectmanagement/objectManager';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
    sliderShape: ISliderShape;
    shapeParameters: Map<string, string[][]>;
    updateFunction: Function;
};

export const HorizontalSlider: React.FunctionComponent<Props> = ({
    sliderShape,
    shapeParameters,
    updateFunction,
}) => {
    // Convert object to an observable one
    const state = useLocalStore(() =>
        createVisuObject(sliderShape, shapeParameters),
    );
    // We have to calculate the values that are specific of orientation
    const centerx = state.buttonSize / 2;
    const centery = state.size.height / 2;
    // The paths are describing the triangles at the ends of the slider
    const path1 =
        '' +
        0.4 * centerx +
        ',' +
        centery +
        ' ' +
        1.6 * centerx +
        ',' +
        0.4 * centery +
        ' ' +
        1.6 * centerx +
        ',' +
        1.6 * centery;
    const path2 =
        '' +
        1.6 * centerx +
        ',' +
        centery +
        ' ' +
        0.4 * centerx +
        ',' +
        1.6 * centery +
        ' ' +
        0.4 * centerx +
        ',' +
        0.4 * centery;

    // States To manage the positiong of the slider
    const [selected, setSelected] = React.useState(false);
    const [initial, setInitial] = React.useState([0, 0]);
    // We need a reference to the rendered scrolbvar to get the rendered size of the scroll area
    const ref = React.useRef(null);

    // At least we need functions to process the user events

    // Increment and decrement the value by click on the ends
    const increment = () => {
        const upper =
            state.minimumValue < state.maximumValue
                ? state.maximumValue
                : state.minimumValue;
        if (state.slider < upper) {
            updateFunction(state.slider + 1);
        }
    };
    const decrement = () => {
        const upper =
            state.minimumValue < state.maximumValue
                ? state.minimumValue
                : state.maximumValue;
        if (state.slider > upper) {
            updateFunction(state.slider - 1);
        }
    };

    // function when click on the Scroll area
    const click = (e: React.MouseEvent) => {
        // Calulate the scroll area minus the size of the slider (the scroll start at the center of the slider and not it's corner)
        const coeff =
            state.sliderSize /
            (state.size.width - 2 * state.buttonSize);
        const fullScroll =
            ref.current.getBoundingClientRect().right -
            ref.current.getBoundingClientRect().left;
        // Calulate the usable space for scrolling
        const spacing = fullScroll - fullScroll * coeff;
        // Find the pointer coordinates from the start of the usable scroll area
        const delta =
            e.pageX -
            (ref.current.getBoundingClientRect().left +
                (fullScroll * coeff) / 2);
        const scrollIntervall = Math.abs(
            state.maximumValue - state.minimumValue,
        );
        if (!(delta < 0 || delta > spacing)) {
            // Conversion of delta to sliderValue
            if (state.minimumValue > state.maximumValue) {
                const nextScrollvalue =
                    state.minimumValue -
                    (delta / spacing) * scrollIntervall;
                updateFunction(nextScrollvalue);
            } else {
                const nextScrollvalue =
                    state.minimumValue +
                    (delta / spacing) * scrollIntervall;
                updateFunction(nextScrollvalue);
            }
        } else if (delta < 0) {
            updateFunction(state.minimumValue);
        } else if (delta > spacing) {
            updateFunction(state.maximumValue);
        }
    };

    // On click of the slider the selected bit is set to true and the size of scroll area is queried
    // const start = (e: React.MouseEvent) => {
    const start = () => {
        setSelected(true);
        setInitial([
            ref.current.getBoundingClientRect().left,
            ref.current.getBoundingClientRect().right,
        ]);
    };

    // Handling the movement of the slider
    const move = (e: React.MouseEvent) => {
        if (selected && typeof updateFunction !== 'undefined') {
            // Calulate the scroll area minus the size of the slider (the scroll start at the center of the slider and not it's corner)
            const coeff =
                state.sliderSize /
                (state.size.width - 2 * state.buttonSize);
            const fullScroll = initial[1] - initial[0];
            // Calulate the usable space for scrolling
            const spacing = fullScroll - fullScroll * coeff;
            // Find the pointer coordinates from the start of the usable scroll area
            const delta =
                e.pageX - (initial[0] + (fullScroll * coeff) / 2);
            const scrollIntervall = Math.abs(
                state.maximumValue - state.minimumValue,
            );

            if (!(delta < 0 || delta > spacing)) {
                // Conversion of delta to sliderValue
                if (state.minimumValue > state.maximumValue) {
                    const nextScrollvalue =
                        state.minimumValue -
                        (delta / spacing) * scrollIntervall;
                    updateFunction(nextScrollvalue);
                } else {
                    const nextScrollvalue =
                        state.minimumValue +
                        (delta / spacing) * scrollIntervall;
                    updateFunction(nextScrollvalue);
                }
            } else if (delta < 0) {
                updateFunction(state.minimumValue);
            } else if (delta > spacing) {
                updateFunction(state.maximumValue);
            }
        }
    };

    const [leftButton, setLeftButton] = React.useState([
        '#d4d0c8',
        'darkgrey',
    ]);
    const [slider, setSlider] = React.useState([
        '#d4d0c8',
        'darkgrey',
    ]);
    const [rightButton, setRightButton] = React.useState([
        '#d4d0c8',
        'darkgrey',
    ]);

    const reset = () => {
        setSelected(false);
        setLeftButton(['#d4d0c8', 'darkgrey']);
        setSlider(['#d4d0c8', 'darkgrey']);
        setRightButton(['#d4d0c8', 'darkgrey']);
    };

    // Return of the react node
    return useObserver(() => (
        <div
            style={{
                cursor: 'auto',
                overflow: 'visible',
                pointerEvents: 'visible',
                visibility: state.visibility,
                position: 'absolute',
                left: state.cornerCoord.x1,
                top: state.cornerCoord.y1,
                width: state.size.width,
                height: state.size.height,
            }}
            onMouseMove={move}
            onMouseUp={reset}
            onMouseLeave={reset}
        >
            {state.readAccess ? (
                <ErrorBoundary fallback={<div>Oh no</div>}>
                    {/* Left button */}
                    <svg
                        onMouseUp={() =>
                            setLeftButton(['#d4d0c8', 'darkgrey'])
                        }
                        onMouseDown={() =>
                            setLeftButton(['darkgrey', 'darkgrey'])
                        }
                        onClick={
                            state.minimumValue < state.maximumValue
                                ? decrement
                                : increment
                        }
                        cursor={'pointer'}
                        style={{
                            width: state.buttonSize,
                            height: state.size.height,
                            position: 'absolute',
                            left: 0,
                        }}
                    >
                        <rect
                            width={state.buttonSize}
                            height={state.size.height}
                            style={{
                                fill: leftButton[0],
                                stroke: leftButton[1],
                            }}
                        />
                        <polygon points={path1} />
                        <title>{state.tooltip}</title>
                    </svg>
                    {/* Scroll area */}
                    <svg
                        cursor={selected ? 'pointer' : null}
                        ref={ref}
                        style={{
                            position: 'absolute',
                            left: state.buttonSize,
                            width:
                                state.size.width -
                                2 * state.buttonSize,
                            height: state.size.height,
                            backgroundColor: '#e6e6e6',
                        }}
                        onClick={click}
                    >
                        <title>{state.tooltip}</title>
                    </svg>
                    {/* Slider */}
                    <svg
                        onMouseUp={() =>
                            setSlider(['#d4d0c8', 'darkgrey'])
                        }
                        onMouseDown={() =>
                            setSlider(['darkgrey', 'darkgrey'])
                        }
                        cursor={'pointer'}
                        style={{
                            left:
                                state.buttonSize + state.sliderValue,
                            width: state.sliderSize,
                            height: state.size.height,
                            position: 'absolute',
                        }}
                    >
                        <rect
                            width={state.sliderSize}
                            height={state.size.height}
                            style={{
                                fill: slider[0],
                                stroke: slider[1],
                            }}
                            onMouseDown={start}
                        />
                        <title>{state.tooltip}</title>
                    </svg>
                    {/* Right button */}
                    <svg
                        onMouseUp={() =>
                            setRightButton(['#d4d0c8', 'darkgrey'])
                        }
                        onMouseDown={() =>
                            setRightButton(['darkgrey', 'darkgrey'])
                        }
                        onClick={
                            state.minimumValue < state.maximumValue
                                ? increment
                                : decrement
                        }
                        cursor={'pointer'}
                        style={{
                            width: state.buttonSize,
                            height: state.size.height,
                            position: 'absolute',
                            right: 0,
                        }}
                    >
                        <rect
                            width={state.buttonSize}
                            height={state.size.height}
                            style={{
                                fill: rightButton[0],
                                stroke: rightButton[1],
                            }}
                        />
                        <polygon points={path2} />
                        <title>{state.tooltip}</title>
                    </svg>
                </ErrorBoundary>
            ) : null}
        </div>
    ));
};
