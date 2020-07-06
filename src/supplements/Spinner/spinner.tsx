import * as React from 'react';
import "./spinner.css";

type Props = {
    text : string
}

export const Spinner : React.FunctionComponent<Props> = ({text})=> {
    return (
        <div className="sup-flexbox">
            <div className="sup-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            <div >{text}</div>
        </div>
    )
}
