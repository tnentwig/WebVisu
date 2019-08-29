from flask import Flask, request, render_template

app = Flask(__name__)
app.debug = True


@app.route("/", methods=['GET', 'POST'])
def index():
    if request.method == "POST":
        name = request.form["name"]
        return name + " Hello"
    return render_template("index.html")


if __name__ == "__main__":
    app.run()