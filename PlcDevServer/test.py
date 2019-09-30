import logging
import json
from flask import Flask, request, render_template, jsonify

app = Flask(__name__)
app.debug = True

@app.route("/hallo", methods=['GET', 'POST'])
def index():
    if request.method == "POST":
        request1 = request.get_json()
        for x, y in request1.items():
            app.logger.info('%s %s', x, y)
    return render_template("index.html")


if __name__ == "__main__":
    app.run()