import * as React from 'react';
import "./spinner.css";

export const Spinner : React.FunctionComponent = ()=> {
    return (
    <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    )
}