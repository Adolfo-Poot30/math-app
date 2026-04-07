// methods.tsx

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

// Evaluar función (simple)
const evaluate = (fn: (x: number) => number, x: number) => fn(x);

// Derivada numérica
const derivative = (fn: (x: number) => number, x: number) => {
  const h = 1e-6;
  return (fn(x + h) - fn(x - h)) / (2 * h);
};

// --- NEWTON RAPHSON ---
export const newtonRaphson = (
  fn: (x: number) => number,
  x0: number,
  tol = 1e-6,
  maxIter = 50
): MethodResult => {
  let x = x0;
  const steps: Step[] = [];

  for (let i = 0; i < maxIter; i++) {
    const fx = evaluate(fn, x);
    const dfx = derivative(fn, x);

    const xNew = x - fx / dfx;
    const error = Math.abs(xNew - x);

    steps.push({
      i,
      x: xNew,
      fx: evaluate(fn, xNew),
      error: i === 0 ? null : error
    });

    if (error < tol) {
      return {
        steps,
        root: xNew,
        iterations: i + 1,
        error
      };
    }

    x = xNew;
  }

  return {
    steps,
    root: x,
    iterations: maxIter,
    error: steps[steps.length - 1].error || 0
  };
};

// --- BISECCIÓN ---
export const biseccion = (
  fn: (x: number) => number,
  a: number,
  b: number,
  tol = 1e-6,
  maxIter = 50
): MethodResult => {
  const steps: Step[] = [];
  let mid = 0;

  for (let i = 0; i < maxIter; i++) {
    mid = (a + b) / 2;
    const fmid = fn(mid);
    const error = Math.abs(b - a) / 2;

    steps.push({
      i,
      x: mid,
      fx: fmid,
      error: i === 0 ? null : error
    });

    if (error < tol) break;

    if (fn(a) * fmid < 0) {
      b = mid;
    } else {
      a = mid;
    }
  }

  return {
    steps,
    root: mid,
    iterations: steps.length,
    error: steps[steps.length - 1].error || 0
  };
};

// --- SECANTE ---
export const secante = (
  fn: (x: number) => number,
  x0: number,
  x1: number,
  tol = 1e-6,
  maxIter = 50
): MethodResult => {
  const steps: Step[] = [];

  for (let i = 0; i < maxIter; i++) {
    const fx0 = fn(x0);
    const fx1 = fn(x1);

    const x2 = x1 - fx1 * (x1 - x0) / (fx1 - fx0);
    const error = Math.abs(x2 - x1);

    steps.push({
      i,
      x: x2,
      fx: fn(x2),
      error: i === 0 ? null : error
    });

    if (error < tol) {
      return {
        steps,
        root: x2,
        iterations: i + 1,
        error
      };
    }

    x0 = x1;
    x1 = x2;
  }

  return {
    steps,
    root: x1,
    iterations: maxIter,
    error: steps[steps.length - 1].error || 0
  };
};