import { decompressSync, strFromU8 } from 'fflate';

fetch('/webvisu/WebVisuApp.js.gz')
    .then((response) => response.arrayBuffer())
    .then((data) => {
        const dataArray = decompressSync(new Uint8Array(data));
        const WebVisuAppScript = strFromU8(dataArray);
        eval(WebVisuAppScript);
    });
