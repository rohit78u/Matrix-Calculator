# !Matrix Calculator Web Applications Ez

![Matrix Calculator Screenshot](demo-screenshot.png)

A Flask-based web application for performing various matrix operations with an intuitive interface.

## Features

- **Matrix Operations**:
  - Addition
  - Subtraction 
  - Multiplication
  - Transpose
  - Determinant calculation
  - Matrix inversion

- **User-Friendly Interface**:
  - Dynamic matrix input grids
  - Responsive design
  - Real-time results display
  - Clean, modern UI

## How to Use

1. Set matrix dimensions using the row/column selectors
2. Enter values in the matrix grids
3. Select an operation from the dropdown
4. Click "Calculate" to view results

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Matrix-Calculator.git

# Navigate to project directory
cd Matrix-Calculator

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

Then open your browser to: http://localhost:5000

## Project Structure

```
Matrix-Calculator/
├── app.py                # Flask application
├── matrix_calculator.py  # Matrix operation logic
├── requirements.txt      # Python dependencies
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

