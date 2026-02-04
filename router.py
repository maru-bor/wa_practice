"""
Router - Load Balancer pro distribuci požadavků
Port: 8000
"""

from flask import Flask, request, Response
import requests

app = Flask(__name__)

# backend servery (round robin)
servers = [
    "http://localhost:8001",  # Python
    "http://localhost:8002",  # JS
]

counter = 0


def pick_server():
    global counter
    server = servers[counter % len(servers)]
    counter += 1
    return server


def forward(path):
    target = pick_server() + path

    headers = {
        k: v
        for k, v in request.headers
        if k.lower() not in ["host", "content-length"]
    }

    resp = requests.request(
        method=request.method,
        url=target,
        headers=headers,
        data=request.get_data(),
        params=request.args,
    )

    return Response(
        resp.content,
        status=resp.status_code,
        headers=dict(resp.headers),
    )


@app.route('/drinks', methods=['GET'])
def get_all_drinks():
    return forward('/drinks')


@app.route('/drinks/<int:id>', methods=['GET'])
def get_drink(id):
    return forward(f'/drinks/{id}')


@app.route('/drinks', methods=['POST'])
def create_drink():
    return forward('/drinks')


@app.route('/drinks/<int:id>', methods=['PUT'])
def update_drink(id):
    return forward(f'/drinks/{id}')


if __name__ == '__main__':
    app.run(port=8000, debug=True)
