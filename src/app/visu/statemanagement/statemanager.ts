import {
    observable,
    autorun,
    // computed,
    IObservableValue,
} from 'mobx';
import ComSocket from '../communication/comsocket';

interface IStateManager {
    // Variables
    oState: Map<string, string>;
    xmlDict: Map<string, string>;
    openPopup: IObservableValue<boolean>;
    init(): void;
}

export default class StateManager implements IStateManager {
    private static instance: IStateManager = new StateManager();

    // objList contains all variables as objects with the name as key and addr & value of the variable
    oState: Map<string, string>;

    xmlDict: Map<string, string>;

    openPopup: IObservableValue<boolean>;

    // this class shall be a singleton
    private constructor() {
        this.oState = observable(new Map());
        this.openPopup = observable.box(false);
        this.xmlDict = new Map();
    }

    public static singleton() {
        return this.instance;
    }

    init() {
        this.oState.set('ISONLINE', 'TRUE');
        /**
         * TODO: There is still a problem here.
         * For whatever reason Comsocket is only observed once.
         * Once the value has been changed, autorun is no longer executed.
         * The cause has yet to be clarified.
         * Until then, manual monitoring is carried out using an interval query
         */
        if (this.oState.get('USECURRENTVISU') === 'TRUE') {
            ComSocket.singleton().setValue(
                '.currentvisu',
                StateManager.singleton().oState.get('STARTVISU'),
            );
            this.oState.set(
                'CURRENTVISU',
                StateManager.singleton().oState.get('STARTVISU'),
            );
            setInterval(() => {
                const value =
                    ComSocket.singleton().oVisuVariables.get(
                        '.currentvisu',
                    ).value;
                const visuName = this.oState
                    .get('CURRENTVISU')
                    .toLowerCase();
                if (typeof value !== 'undefined') {
                    if (
                        visuName !== value.toLowerCase() &&
                        value !== ''
                    ) {
                        this.oState.set(
                            'CURRENTVISU',
                            value.toLowerCase(),
                        );
                    }
                }
            }, 300);
        } else {
            if (this.oState.get('USECURRENTVISU') === 'FALSE') {
                Object.defineProperty(this.oState, 'CURRENTVISU', {
                    get: autorun(() => {
                        if (
                            typeof this.oState.get('ZOOMVISU') !==
                            'undefined'
                        ) {
                            this.oState.set(
                                'CURRENTVISU',
                                this.oState.get('ZOOMVISU'),
                            );
                        } else {
                            this.oState.set(
                                'CURRENTVISU',
                                this.oState.get('STARTVISU'),
                            );
                        }
                    }),
                });
            }
        }
    }
}
