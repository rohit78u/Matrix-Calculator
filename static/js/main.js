class MatrixLab {
  constructor() {
    this.currentMatrix = "A";
    this.matrices = { A: [[1, 0], [0, 1]], B: [[1, 2], [3, 4]] };
    this.busy = false;
    this.operations = { add: "Addition", subtract: "Subtraction", multiply: "Multiplication", transpose_a: "Transpose A", determinant_a: "Determinant A", inverse_a: "Inverse A", eigenvalues_a: "Eigenvalues A", svd_a: "SVD A", transpose_b: "Transpose B", determinant_b: "Determinant B", inverse_b: "Inverse B", eigenvalues_b: "Eigenvalues B", svd_b: "SVD B" };
    this.bindEvents();
    this.renderGrid();
  }

  bindEvents() {
    document.querySelectorAll(".matrix-tab").forEach((button) => button.addEventListener("click", () => {
      this.currentMatrix = button.dataset.matrix;
      document.querySelectorAll(".matrix-tab").forEach((item) => item.classList.toggle("active", item === button));
      this.renderGrid();
    }));
    document.querySelectorAll(".tab-btn").forEach((button) => button.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((item) => item.classList.toggle("active", item === button));
      document.querySelectorAll(".tab-content").forEach((item) => item.classList.toggle("active", item.id === `tab-${button.dataset.tab}`));
    }));
    document.querySelectorAll(".step-btn").forEach((button) => button.addEventListener("click", () => this.resize(button.dataset.dim, button.dataset.dir)));
    document.querySelectorAll(".preset-btn").forEach((button) => button.addEventListener("click", () => this.applyPreset(button.dataset.preset)));
    document.getElementById("calculate-btn").addEventListener("click", () => this.calculate());
    document.getElementById("reset-view-btn").addEventListener("click", () => { this.matrices = { A: [[1, 0], [0, 1]], B: [[1, 2], [3, 4]] }; this.currentMatrix = "A"; this.renderGrid(); this.clearResult(); });
  }

  renderGrid() {
    const matrix = this.matrices[this.currentMatrix];
    document.getElementById("rows-value").textContent = matrix.length;
    document.getElementById("cols-value").textContent = matrix[0].length;
    const grid = document.getElementById("matrix-grid");
    grid.style.gridTemplateColumns = `repeat(${matrix[0].length}, 1fr)`;
    grid.replaceChildren();
    matrix.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
      const input = document.createElement("input");
      input.type = "number"; input.step = "any"; input.value = value;
      input.setAttribute("aria-label", `${this.currentMatrix}, row ${rowIndex + 1}, column ${columnIndex + 1}`);
      input.addEventListener("change", () => { const number = Number(input.value); if (Number.isFinite(number)) this.matrices[this.currentMatrix][rowIndex][columnIndex] = number; else input.value = this.matrices[this.currentMatrix][rowIndex][columnIndex]; });
      grid.append(input);
    }));
  }

  resize(dimension, direction) {
    const matrix = this.matrices[this.currentMatrix], rows = matrix.length, columns = matrix[0].length;
    const next = Math.max(1, Math.min(10, (dimension === "rows" ? rows : columns) + (direction === "up" ? 1 : -1)));
    if (dimension === "rows") {
      while (matrix.length < next) matrix.push(Array(columns).fill(0));
      matrix.length = next;
    } else {
      matrix.forEach((row) => { while (row.length < next) row.push(0); row.length = next; });
    }
    this.renderGrid();
  }

  applyPreset(name) {
    const presets = { identity2: [[1, 0], [0, 1]], identity3: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], fibonacci: [[1, 1, 2], [3, 5, 8], [13, 21, 34]], hilbert: [[1, .5, 1 / 3], [.5, 1 / 3, .25], [1 / 3, .25, .2]] };
    const size = name === "random2" ? 2 : 3;
    this.matrices[this.currentMatrix] = presets[name] || Array.from({ length: size }, () => Array.from({ length: size }, () => Math.round((Math.random() * 10 - 5) * 10) / 10));
    this.renderGrid();
  }

  async calculate() {
    if (this.busy) return;
    this.busy = true; const button = document.getElementById("calculate-btn"); button.disabled = true; button.textContent = "Calculating…";
    try {
      const response = await fetch("/api/calculate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matrix_a: this.matrices.A, matrix_b: this.matrices.B, operation: document.getElementById("operation-select").value }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Calculation failed."); this.displayResult(data);
    } catch (error) { this.showError(error.message); }
    finally { this.busy = false; button.disabled = false; button.textContent = "Calculate"; }
  }

  displayResult(data) {
    const operation = document.getElementById("operation-select").value, result = document.getElementById("result-container");
    document.getElementById("error-container").hidden = true; document.getElementById("result-meta").hidden = false;
    document.getElementById("operation-badge").textContent = this.operations[operation]; document.getElementById("meta-operation").textContent = this.operations[operation];
    document.getElementById("meta-shape-a").textContent = this.shape(this.matrices.A); document.getElementById("meta-shape-b").textContent = this.shape(this.matrices.B); document.getElementById("meta-shape-result").textContent = data.type === "svd" ? "SVD" : (data.shape ? data.shape.join("×") : "1×1");
    result.replaceChildren(this.renderValue(data.result, data.type));
  }

  renderValue(value, type) {
    if (type === "scalar") return this.element("div", "result-scalar", this.format(value));
    if (type === "vector") { const element = this.element("div", "result-vector"); value.forEach((item) => element.append(this.element("span", "result-vector-item", this.format(item)))); return element; }
    if (type === "svd") { const element = this.element("div", "svd-result"); Object.entries(value).forEach(([name, item]) => { element.append(this.element("h4", "", name)); element.append(this.renderValue(item, Array.isArray(item[0]) ? "matrix" : "vector")); }); return element; }
    const element = this.element("div", "result-matrix-grid"); element.style.gridTemplateColumns = `repeat(${value[0].length}, 1fr)`; value.flat().forEach((item) => element.append(this.element("div", "result-matrix-cell", this.format(item)))); return element;
  }

  element(tag, className, text) { const element = document.createElement(tag); element.className = className; element.textContent = text; return element; }
  format(value) { if (typeof value === "object") return `${value.real}${value.imaginary < 0 ? " − " : " + "}${Math.abs(value.imaginary)}i`; return Number.isInteger(value) ? String(value) : Number(value).toFixed(6).replace(/0+$/, "").replace(/\.$/, ""); }
  shape(matrix) { return `${matrix.length}×${matrix[0].length}`; }
  showError(message) { document.getElementById("error-message").textContent = message; document.getElementById("error-container").hidden = false; document.getElementById("operation-badge").textContent = "Error"; }
  clearResult() { document.getElementById("result-container").textContent = "Enter values, choose an operation, then calculate."; document.getElementById("result-meta").hidden = true; document.getElementById("error-container").hidden = true; document.getElementById("operation-badge").textContent = "Ready"; }
}
document.addEventListener("DOMContentLoaded", () => new MatrixLab());
