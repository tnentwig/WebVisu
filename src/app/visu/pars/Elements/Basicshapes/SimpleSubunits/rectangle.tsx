import * as React from 'react';
import { ISimpleShape } from '../../../../Interfaces/javainterfaces';
import { createVisuObject } from '../../../Objectmanagement/objectManager';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
    simpleShape: ISimpleShape;
    textField: JSX.Element;
    inputField: JSX.Element;
    dynamicParameters: Map<string, string[][]>;
    onmousedown: Function;
    onmouseup: Function;
    onclick: Function;
};

export const Rectangle: React.FunctionComponent<Props> = React.memo(
    ({
        simpleShape,
        textField,
        inputField,
        dynamicParameters,
        onclick,
        onmousedown,
        onmouseup,
    }) => {
        // Convert object to an observable one
        const state = useLocalStore(() =>
            createVisuObject(simpleShape, dynamicParameters),
        );

        return useObserver(() => (
            <div
                style={{
                    cursor: 'auto',
                    overflow: 'visible',
                    pointerEvents: state.pointerEvents,
                    visibility: state.visibility,
                    position: 'absolute',
                    left:
                        Math.min(
                            state.transformedCornerCoord.x1,
                            state.transformedCornerCoord.x2,
                        ) +
                        state.transformedStartCoord.left -
                        state.lineWidth,
                    top:
                        Math.min(
                            state.transformedCornerCoord.y1,
                            state.transformedCornerCoord.y2,
                        ) +
                        state.transformedStartCoord.top -
                        state.lineWidth,
                    width:
                        state.transformedSize.width +
                        2 * state.lineWidth,
                    height:
                        state.transformedSize.height +
                        2 * state.lineWidth,
                }}
            >
                {state.readAccess ? (
                    <ErrorBoundary fallback={<div>Oh no</div>}>
                        {inputField}
                        <svg
                            style={{ float: 'left' }}
                            width={
                                state.transformedSize.width +
                                2 * state.lineWidth
                            }
                            height={
                                state.transformedSize.height +
                                2 * state.lineWidth
                            }
                            overflow="visible"
                        >
                            <svg
                                onClick={
                                    typeof onclick === 'undefined' ||
                                    onclick === null
                                        ? null
                                        : state.writeAccess
                                        ? () => onclick()
                                        : null
                                }
                                onMouseDown={
                                    typeof onmousedown ===
                                        'undefined' ||
                                    onmousedown === null
                                        ? null
                                        : state.writeAccess
                                        ? () => onmousedown()
                                        : null
                                }
                                onMouseUp={
                                    typeof onmouseup ===
                                        'undefined' ||
                                    onmouseup === null
                                        ? null
                                        : state.writeAccess
                                        ? () => onmouseup()
                                        : null
                                }
                                onMouseLeave={
                                    typeof onmouseup ===
                                        'undefined' ||
                                    onmouseup === null
                                        ? null
                                        : state.writeAccess
                                        ? () => onmouseup()
                                        : null
                                } // We have to reset if somebody leaves the object with pressed key
                                cursor={
                                    (typeof onclick !== 'undefined' &&
                                        onclick !== null) ||
                                    (typeof onmousedown !==
                                        'undefined' &&
                                        onmousedown !== null) ||
                                    (typeof onmouseup !==
                                        'undefined' &&
                                        onmouseup !== null)
                                        ? 'pointer'
                                        : null
                                }
                                width={
                                    state.transformedSize.width *
                                        (state.motionAbsScale /
                                            1000) +
                                    2 * state.lineWidth
                                }
                                height={
                                    state.transformedSize.height *
                                        (state.motionAbsScale /
                                            1000) +
                                    2 * state.lineWidth
                                }
                                overflow="visible"
                            >
                                <rect
                                    width={
                                        state.transformedSize.width
                                    }
                                    height={
                                        state.transformedSize.height
                                    }
                                    fill={state.fill}
                                    stroke={state.stroke}
                                    strokeWidth={state.strokeWidth}
                                    strokeDasharray={
                                        state.strokeDashArray
                                    }
                                    transform={state.transform}
                                >
                                    <title>{state.tooltip}</title>
                                </rect>
                                {typeof textField === 'undefined' ||
                                textField === null ? null : (
                                    <svg overflow="visible">
                                        {textField}
                                    </svg>
                                )}
                            </svg>
                        </svg>
                    </ErrorBoundary>
                ) : null}
            </div>
        ));
    },
);
