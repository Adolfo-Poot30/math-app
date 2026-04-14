export interface Step {
  i: number;
  x: number;
  fx: number;
  error: number | null;
}

export interface MethodResult {
  steps: Step[];
  root: number;
  iterations: number;
  error: number;
}

// Evaluar función
const evaluate = (fn: (x: number) => number, x: number) => {
  const result = fn(x);
  if (!isFinite(result)) {
    throw new Error("La función devolvió un valor inválido.");
  }
  return result;
};

// Derivada numérica (fallback)
const derivative = (fn: (x: number) => number, x: number) => {
  const h = 1e-6;
  return (fn(x + h) - fn(x - h)) / (2 * h);
};

// =======================
// NEWTON-RAPHSON
// =======================
export const newtonRaphson = (
  fn: (x: number) => number,
  x0: number,
  tol = 1e-6,
  maxIter = 50,
  dfn?: (x: number) => number
): MethodResult => {
  let x = x0;
  const steps: Step[] = [];

  for (let i = 0; i < maxIter; i++) {
    const fx = evaluate(fn, x);
    const dfx = dfn ? dfn(x) : derivative(fn, x);

    if (!isFinite(dfx) || Math.abs(dfx) < 1e-12) {
      throw new Error("Derivada cercana a cero. Newton-Raphson falla.");
    }

    const xNew = x - fx / dfx;
    const error = Math.abs(xNew - x);

    const fxNew = evaluate(fn, xNew);

    steps.push({
      i,
      x: xNew,
      fx: fxNew,
      error: i === 0 ? null : error
    });

    // Criterios de parada
    if (error < tol || Math.abs(fxNew) < tol) {
      return {
        steps,
        root: xNew,
        iterations: i + 1,
        error
      };
    }

    if (!isFinite(xNew)) {
      throw new Error("El método diverge.");
    }

    x = xNew;
  }

  return {
    steps,
    root: x,
    iterations: maxIter,
    error: steps[steps.length - 1]?.error || 0
  };
};

// =======================
// BISECCIÓN
// =======================
export const biseccion = (
  fn: (x: number) => number,
  a: number,
  b: number,
  tol = 1e-6,
  maxIter = 50
): MethodResult => {
  let fa = evaluate(fn, a);
  let fb = evaluate(fn, b);

  if (fa * fb >= 0) {
    throw new Error("El intervalo no encierra una raíz (f(a)*f(b) >= 0).");
  }

  const steps: Step[] = [];
  let mid = a;

  for (let i = 0; i < maxIter; i++) {
    mid = (a + b) / 2;
    const fmid = evaluate(fn, mid);
    const error = Math.abs(b - a) / 2;

    steps.push({
      i,
      x: mid,
      fx: fmid,
      error: i === 0 ? null : error
    });

    // Criterios de parada
    if (error < tol || Math.abs(fmid) < tol) {
      break;
    }

    if (fa * fmid < 0) {
      b = mid;
      fb = fmid;
    } else {
      a = mid;
      fa = fmid;
    }
  }

  return {
    steps,
    root: mid,
    iterations: steps.length,
    error: steps[steps.length - 1]?.error || 0
  };
};

// =======================
// SECANTE
// =======================
export const secante = (
  fn: (x: number) => number,
  x0: number,
  x1: number,
  tol = 1e-6,
  maxIter = 50
): MethodResult => {
  const steps: Step[] = [];

  for (let i = 0; i < maxIter; i++) {
    const fx0 = evaluate(fn, x0);
    const fx1 = evaluate(fn, x1);

    const denom = fx1 - fx0;

    if (Math.abs(denom) < 1e-12) {
      throw new Error("División por cero en método de la secante.");
    }

    const x2 = x1 - (fx1 * (x1 - x0)) / denom;
    const error = Math.abs(x2 - x1);
    const fx2 = evaluate(fn, x2);

    steps.push({
      i,
      x: x2,
      fx: fx2,
      error: i === 0 ? null : error
    });

    // Criterios de parada
    if (error < tol || Math.abs(fx2) < tol) {
      return {
        steps,
        root: x2,
        iterations: i + 1,
        error
      };
    }

    if (!isFinite(x2)) {
      throw new Error("El método diverge.");
    }

    x0 = x1;
    x1 = x2;
  }

  return {
    steps,
    root: x1,
    iterations: maxIter,
    error: steps[steps.length - 1]?.error || 0
  };
};