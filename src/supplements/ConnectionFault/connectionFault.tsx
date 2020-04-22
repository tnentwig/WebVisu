import * as React from 'react';

export const ConnectionFault : React.FunctionComponent = ()=> {
    return (
    <div className="conn-fault">
        <div>The PLC webserver is not reachable!</div>
    </div>
    )
}