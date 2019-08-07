
class ComSocket {
    serverURL: string;
    constructor(serverURL : string) {
        this.serverURL = serverURL;
    }
    
    BoolVarRequest(addrBoolVar : string) {
        $.ajax({
            type: 'POST',
            url: this.serverURL,
            data: '|0|1|0|'+ addrBoolVar.replace(/,/g, '|') + '|',
            success: function(data, textStatus, jqXhr) {
                        console.log(data);
            },
            error: function(jqXhr, textStatus, errorThrown) {
                        console.log(errorThrown);
            }
                        });
            }
           
            
}

let comsock = new ComSocket('http://192.168.1.110:80/webvisu/webvisu.htm');

comsock.BoolVarRequest('4,144,1,0');



