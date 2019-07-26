import VisuParser from './pars/visuparser';

var objXMLParser = new VisuParser("http://192.168.1.110/")
var request = objXMLParser.ParseVisu("plc_visu.xml");
