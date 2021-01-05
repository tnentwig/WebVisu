import * as React from 'react';
import './popup.css';
import StateManager from '../../visu/statemanagement/statemanager';
import ComSocket from '../../visu/communication/comsocket';

export const ExecutionPopup: React.FunctionComponent = () => {
    // Storing the desired level value
    const [level, setLevel] = React.useState('0');
    // Storing the inputted password
    const [passwd, setPasswd] = React.useState('');
    // Flag if previous inputted password was incorrect
    const [error, setError] = React.useState(false);

    const handleLevelChange = (event: any) => {
        setLevel(event.target.value);
        setError(false);
    };

    const handlePasswdChange = (event: any) => {
        setPasswd(event.target.value);
        setError(false);
    };

    const close = function () {
        StateManager.singleton().openPopup.set(false);
    };

    const submit = function () {
        // Get the deafult password from socket
        const key = '.currentpasswords[' + level + ']';
        // Check if password is correct
        if (
            passwd ===
            ComSocket.singleton().oVisuVariables.get(key).value
        ) {
            // Set the new userlevel
            ComSocket.singleton().setValue(
                '.currentuserlevel',
                level,
            );
            close();
        } else {
            // Reset inputted password
            setPasswd('');
            setError(true);
        }
    };

    return (
        <div className="sup-exec">
            <div className="sup-exec-header">Change user level</div>
            <div>User Level:</div>
            <select value={level} onChange={handleLevelChange}>
                <option value="0">Level 0</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
                <option value="6">Level 6</option>
                <option value="7">Level 7</option>
            </select>
            <div>Password: </div>
            {error ? (
                <div className="sup-exec-error">
                    Submitted password was incorrect. Please try
                    again.
                </div>
            ) : null}
            <input
                type="password"
                name="fname"
                onChange={handlePasswdChange}
            ></input>
            <input type="submit" value="OK" onClick={submit}></input>
            <input
                type="submit"
                value="Cancel"
                onClick={close}
            ></input>
        </div>
    );
};
