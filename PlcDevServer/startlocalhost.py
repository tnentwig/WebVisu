import logging
import json
from flask import Flask, request, render_template, jsonify, redirect, Response, session

app = Flask(__name__)
app.secret_key = "sessionkey"
app.debug = True

@app.route('/')
def redirection():
    return redirect("/index", code=302)

@app.route("/index", methods=['GET', 'POST'])
def index():
    # The request is a json object with the address as key and the submitted value as value
    # It will be handled by flask as dict
    if request.method == "POST":
        session.clear()
        serverVarList = request.get_json()
        for key in serverVarList:
            session[key]=serverVarList[key]
    return render_template("index.html")

@app.route("/webvisu/webvisu.htm", methods=['GET', 'POST'])
def webserv():
    # There are two options of request.
    # 1) value inquiry request: get the value of variables, form: "|0|<number of variables>|0|<address first var>|1|<address second var>|n-1|<adress nth var>|"
    # 2) set value request: set the value of variables, form: "|1|<number of variables>|0|<address first var>|<first value to be set>|2|<address second var>|<second value to be set>|n-1|<adress nth var>|<nth value to be set>|"
    # The address is sent in the form of four numbers e.g. |xxx|xxx|xxx|xxx|
    if request.method == "POST":
        reqStr = request.data.decode("utf8")
        reqArray = reqStr.split("|")
        # Remove the first and last item. If the string is splitted the first and last "|" will cause a "" item
        reqArray.pop(0)
        reqArray.pop(len(reqArray)-1)
        # the first item shows the type of request, "1"--> setvalue "0"--> getvalue
        reqType = reqArray[0]
        # the second item contains the number of variables to be set or to be interrogated 
        reqQuantity = int(reqArray[1])
        # Inquiry request
        if reqType=="0":
            # Initialize the response
            response = "|0|"
            # Iterate through the variables
            for element in range(0, reqQuantity):
                pointer = 2+element*5
                # Get address
                key = ""+reqArray[pointer+1]+","+reqArray[pointer+2]+","+reqArray[pointer+3]+","+reqArray[pointer+4]

            return session[0]
        # Set value request
        elif reqType=="1":
            key = ""
        else:
            return "hi"

if __name__ == "__main__":
    app.run()