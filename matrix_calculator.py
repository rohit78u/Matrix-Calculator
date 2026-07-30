import numpy as np


class MatrixCalculator:
    MAX_DIMENSION = 10
    BINARY_OPERATIONS = {"add", "subtract", "multiply"}
    OPERATIONS = {
        "add", "subtract", "multiply", "transpose_a", "transpose_b",
        "determinant_a", "determinant_b", "inverse_a", "inverse_b",
        "eigenvalues_a", "eigenvalues_b", "svd_a", "svd_b",
    }

    @classmethod
    def calculate(cls, operation, matrix_a_data, matrix_b_data):
        if operation not in cls.OPERATIONS:
            raise ValueError("Select a valid matrix operation.")

        matrix_a = cls._as_matrix(matrix_a_data, "Matrix A")
        matrix_b = None
        if operation in cls.BINARY_OPERATIONS or operation.endswith("_b"):
            matrix_b = cls._as_matrix(matrix_b_data, "Matrix B")

        if operation == "add":
            return cls.add_matrices(matrix_a, matrix_b)
        if operation == "subtract":
            return cls.subtract_matrices(matrix_a, matrix_b)
        if operation == "multiply":
            return cls.multiply_matrices(matrix_a, matrix_b)

        matrix = matrix_a if operation.endswith("_a") else matrix_b
        action = operation.rsplit("_", 1)[0]
        return getattr(cls, action)(matrix)

    @classmethod
    def _as_matrix(cls, values, label):
        if not isinstance(values, list) or not values or not all(isinstance(row, list) for row in values):
            raise ValueError(f"{label} must be a non-empty two-dimensional array.")
        if len(values) > cls.MAX_DIMENSION or any(not row or len(row) > cls.MAX_DIMENSION for row in values):
            raise ValueError(f"{label} dimensions must be between 1 and {cls.MAX_DIMENSION}.")
        column_count = len(values[0])
        if any(len(row) != column_count for row in values):
            raise ValueError(f"{label} rows must all have the same length.")
        try:
            matrix = np.asarray(values, dtype=float)
        except (TypeError, ValueError) as error:
            raise ValueError(f"{label} must contain only numbers.") from error
        if not np.isfinite(matrix).all():
            raise ValueError(f"{label} must contain only finite numbers.")
        return matrix

    @staticmethod
    def add_matrices(matrix_a, matrix_b):
        if matrix_a.shape != matrix_b.shape:
            raise ValueError("Matrices must have matching dimensions for addition.")
        return matrix_a + matrix_b

    @staticmethod
    def subtract_matrices(matrix_a, matrix_b):
        if matrix_a.shape != matrix_b.shape:
            raise ValueError("Matrices must have matching dimensions for subtraction.")
        return matrix_a - matrix_b

    @staticmethod
    def multiply_matrices(matrix_a, matrix_b):
        if matrix_a.shape[1] != matrix_b.shape[0]:
            raise ValueError("Matrix A columns must match Matrix B rows for multiplication.")
        return matrix_a @ matrix_b

    @staticmethod
    def transpose(matrix):
        return matrix.T

    @staticmethod
    def determinant(matrix):
        MatrixCalculator._require_square(matrix, "determinant")
        return float(np.linalg.det(matrix))

    @staticmethod
    def inverse(matrix):
        MatrixCalculator._require_square(matrix, "inversion")
        try:
            return np.linalg.inv(matrix)
        except np.linalg.LinAlgError as error:
            raise ValueError("Matrix is singular and cannot be inverted.") from error

    @staticmethod
    def eigenvalues(matrix):
        MatrixCalculator._require_square(matrix, "eigenvalue calculation")
        return np.linalg.eigvals(matrix)

    @staticmethod
    def svd(matrix):
        u_matrix, singular_values, vh_matrix = np.linalg.svd(matrix, full_matrices=False)
        return {"U": u_matrix, "S": singular_values, "Vh": vh_matrix}

    @staticmethod
    def _require_square(matrix, action):
        if matrix.shape[0] != matrix.shape[1]:
            raise ValueError(f"Matrix must be square for {action}.")

    @classmethod
    def serialize(cls, result):
        if isinstance(result, dict):
            return {"type": "svd", "result": {key: cls._values(value) for key, value in result.items()}}
        if isinstance(result, np.ndarray):
            result_type = "vector" if result.ndim == 1 else "matrix"
            return {"type": result_type, "shape": list(result.shape), "result": cls._values(result)}
        return {"type": "scalar", "result": cls._number(result)}

    @classmethod
    def _values(cls, value):
        return [cls._values(item) if isinstance(item, (list, np.ndarray)) else cls._number(item) for item in value]

    @staticmethod
    def _number(value):
        value = complex(value)
        if abs(value.imag) < 1e-10:
            return round(value.real, 10)
        return {"real": round(value.real, 10), "imaginary": round(value.imag, 10)}
