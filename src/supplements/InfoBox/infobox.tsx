import * as React from 'react';
import "./infobox.css";

export const ConnectionFault : React.FunctionComponent = ()=> {
    return (
    <div className="info-connectionFault">
        <div className=".info-connectionFault-header">The PLC webserver is not reachable!</div>
    </div>
    )
}