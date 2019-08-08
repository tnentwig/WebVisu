
class ComSocket {
    serverURL: string;
    constructor(serverURL : string) {
        this.serverURL = serverURL;
    }
    
    getVar(varAdr : string) {
        $.ajax({
            type: 'POST',
            url: this.serverURL,
            data: '|0|1|0|'+ varAdr.replace(/,/g, '|') + '|',
            success: function(data, textStatus, jqXhr) {
                        console.log(data);
            },
            error: function(jqXhr, textStatus, errorThrown) {
                        console.log(errorThrown);
            }
        });
    }

    setVar(varAdr : string, varValue : number | string | boolean) {
        $.ajax({
            type: 'POST',
            url: this.serverURL,
            data: '|1|1|0|'+ varAdr.replace(/,/g, '|') + '|'+ varValue + '|',
            success: function(data, textStatus, jqXhr) {
                        console.log(data);
            },
            error: function(jqXhr, textStatus, errorThrown) {
                        console.log(errorThrown);
            }
        });
    }
           
            
}







