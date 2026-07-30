import os

from flask import Flask, jsonify, render_template, request
from werkzeug.exceptions import BadRequest, RequestEntityTooLarge

from matrix_calculator import MatrixCalculator


def create_app(config=None):
    app = Flask(__name__)
    app.config.from_mapping(
        MAX_CONTENT_LENGTH=64 * 1024,
        JSON_SORT_KEYS=False,
    )
    if config:
        app.config.update(config)

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.post("/api/calculate")
    def calculate():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            raise BadRequest("Request body must be a JSON object.")

        operation = payload.get("operation")
        try:
            result = MatrixCalculator.calculate(
                operation, payload.get("matrix_a"), payload.get("matrix_b")
            )
        except ValueError as error:
            return jsonify({"error": str(error)}), 400

        return jsonify({"success": True, **MatrixCalculator.serialize(result)})

    @app.errorhandler(BadRequest)
    def handle_bad_request(error):
        return jsonify({"error": error.description}), 400

    @app.errorhandler(RequestEntityTooLarge)
    def handle_large_request(_error):
        return jsonify({"error": "Request body is too large."}), 413

    @app.errorhandler(Exception)
    def handle_unexpected_error(_error):
        app.logger.exception("Unexpected application error")
        return jsonify({"error": "An unexpected server error occurred."}), 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG") == "1",
    )
