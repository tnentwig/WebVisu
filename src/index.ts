import VisuParser from './pars/xml2json'

var objXMLParser = new VisuParser("http://192.168.1.110/")

var request = objXMLParser.getVisuXML("plc_visu.xml");

