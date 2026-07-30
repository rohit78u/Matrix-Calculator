# Matrix Lab

A small, production-ready Flask web application for common matrix and linear algebra calculations.

## Features

- **Matrix Operations**:
  - Addition
  - Subtraction 
  - Multiplication
  - Transpose
  - Determinant calculation
  - Matrix inversion

- **Reliable API**: validates JSON payloads, matrix shape, finite numeric values, and a 10×10 maximum matrix size.
- **Accessible UI**: responsive matrix editor, presets, and clear calculation errors.
- **Complex eigenvalues**: returned as `{ "real": ..., "imaginary": ... }` values.

## How to Use

1. Set matrix dimensions using the row/column selectors
2. Enter values in the matrix grids
3. Select an operation from the dropdown
4. Click "Calculate" to view results

## Installation

```bash
python -m venv .venv
.venv\Scripts\activate  # Windows PowerShell
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000.

## Production

Set `PORT` to the port exposed by your host and run with Gunicorn:

```bash
gunicorn --workers 2 --bind 0.0.0.0:$PORT app:app
```

`Procfile` provides this command for compatible platforms. Do not use Flask's development server in production.

## Testing

```bash
pytest
```

## Project Structure

```
Matrix-Calculator/
├── app.py                # Flask application
├── matrix_calculator.py  # Matrix operation logic
├── requirements.txt      # Python dependencies
├── tests/                # API regression tests
├── static/
│   └── css/
│       └── style.css     # Stylesheets
└── templates/
    └── index.html        # Main interface
```

## Requirements

- Python 3.6+
- Flask
- NumPy (for matrix operations)

## Demo Instructions

1. Run the application: `python app.py`
2. Open browser to: http://localhost:5000
3. Example workflow:
   - Set two 2x2 matrices
   - Enter values
   - Select "Multiplication"
   - View results

## Screenshot

To add your demo screenshot:
1. Take screenshot of running application
2. Save as `demo-screenshot.png` in project root
3. The image will automatically appear here

## License

MIT License
hey

