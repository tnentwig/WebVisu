import * as React from 'react';
import ComSocket from '../../../communication/comsocket';
import { useObserver, useLocalStore } from 'mobx-react-lite';
import {
    stringToBoolean,
    rgbToHexString,
    stringToArray,
} from '../../Utils/utilfunctions';
import ErrorBoundary from 'react-error-boundary';

type Props = {
    section: Element;
};

export const ArrayTable: React.FunctionComponent<Props> = ({
    section,
}) => {
    return null;
};
