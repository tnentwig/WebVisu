import HTML5Visu from './controlcenter';

/* 
    Fetched visualisations are stored in session storage for faster loading within a session.
    A page reload will clear this storage.
*/

window.onunload = function () {
    sessionStorage.clear();
};

/*
    Display the WebVisu
*/
const objHTML5Visu = new HTML5Visu();
objHTML5Visu.showMainVisu();
