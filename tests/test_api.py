import pytest

from app import create_app


@pytest.fixture()
def client():
    app = create_app({"TESTING": True})
    return app.test_client()


def calculate(client, operation, matrix_a, matrix_b=None):
    return client.post(
        "/api/calculate",
        json={"operation": operation, "matrix_a": matrix_a, "matrix_b": matrix_b},
    )


def test_addition_returns_matrix_shape(client):
    response = calculate(client, "add", [[1, 2], [3, 4]], [[5, 6], [7, 8]])

    assert response.status_code == 200
    assert response.json == {"success": True, "type": "matrix", "shape": [2, 2], "result": [[6.0, 8.0], [10.0, 12.0]]}


def test_complex_eigenvalues_are_json_serializable(client):
    response = calculate(client, "eigenvalues_a", [[0, -1], [1, 0]])

    assert response.status_code == 200
    assert response.json["type"] == "vector"
    assert response.json["result"] == [{"real": 0.0, "imaginary": 1.0}, {"real": 0.0, "imaginary": -1.0}]


def test_rejects_ragged_and_invalid_input(client):
    response = calculate(client, "determinant_a", [[1, 2], [3]])

    assert response.status_code == 400
    assert "same length" in response.json["error"]


def test_rejects_invalid_operation(client):
    response = calculate(client, "delete_everything", [[1]])

    assert response.status_code == 400
