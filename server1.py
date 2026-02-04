from flask import Flask, jsonify, request
import json

app = Flask(__name__)
DB_FILE = "db.json"


def load_data():
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

@app.route("/drinks", methods=["GET"])
def get_all():
    data = load_data()
    resp = jsonify(data["drinks"])
    resp.headers["X-Server-ID"] = "1"
    return resp


@app.route("/drinks/<int:drink_id>", methods=["GET"])
def get_one(drink_id):
    data = load_data()
    for d in data["drinks"]:
        if d["id"] == drink_id:
            resp = jsonify(d)
            resp.headers["X-Server-ID"] = "1"
            return resp
    return jsonify({"error": "Not found"}), 404


@app.route("/drinks", methods=["POST"])
def create():
    data = load_data()
    new_drink = request.json

    new_id = max([d["id"] for d in data["drinks"]], default=0) + 1
    new_drink["id"] = new_id

    data["drinks"].append(new_drink)
    save_data(data)
    resp = jsonify(new_drink)
    resp.headers["X-Server-ID"] = "1"
    return resp, 201


@app.route("/drinks/<int:drink_id>", methods=["PUT"])
def update(drink_id):
    data = load_data()
    for d in data["drinks"]:
        if d["id"] == drink_id:
            d.update(request.json)
            save_data(data)
            resp = jsonify(d)
            resp.headers["X-Server-ID"] = "1"
            return resp, 200
    return jsonify({"error": "Not found"}), 404


if __name__ == "__main__":
    app.run(port=8001)
