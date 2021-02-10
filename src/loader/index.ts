import { decompressSync, strFromU8 } from 'fflate';

const prefixList: Array<String> = ['', '/PLC', '/webvisu'];

prefixList.forEach((prefix) => {
    fetch(prefix + '/WebVisuApp.js.gz').then((response) => {
        if (response.ok) {
            response.arrayBuffer().then((data) => {
                const dataArray = decompressSync(
                    new Uint8Array(data),
                );
                const WebVisuAppScript = strFromU8(dataArray);
                eval(WebVisuAppScript);
            });
        }
    });
});
