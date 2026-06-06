export const mathClass12Quizzes = [
  {
    exercise: "Functions and Graphs",
    questions: [
      { q: "If a function satisfies f(x+1) = f(x) + 2x + 1, and f(0) = 0, find f(2).", options: ["2", "4", "6", "8"], correct: 1 },
      { q: "Which function is one-to-one?", options: ["f(x) = x^2", "f(x) = |x|", "f(x) = x^3", "f(x) = sin x"], correct: 2 },
      { q: "Domain of f(x) = 1 / sqrt(2x - 3) is:", options: ["x > 3/2", "x >= 3/2", "x < 3/2", "All real numbers"], correct: 0 },
      { q: "Range of f(x) = 1 / (x^2 + 1):", options: ["(0,1]", "(0,1)", "[0,1)", "[0,1]"], correct: 0 },
      { q: "If f(g(x)) = x, then:", options: ["f = g", "f = inverse of g", "g = f", "None"], correct: 1 },
      { q: "Which function is even?", options: ["x^3", "x^2", "x^3 + x", "e^x"], correct: 1 },
      { q: "Horizontal asymptote of f(x) = (2x+1)/(x-1):", options: ["y = 2", "y = 1", "y = 0", "None"], correct: 0 },
      { q: "If f(x) = sqrt(x-1), domain is:", options: ["x >= 0", "x >= 1", "x > 1", "All real"], correct: 1 },
      { q: "Which is NOT a function?", options: ["x^2", "sqrt(x)", "± sqrt(x)", "x^3"], correct: 2 },
      { q: "Graph of |x| is:", options: ["Parabola", "V-shape", "Line", "Hyperbola"], correct: 1 }
    ]
  },
  {
    exercise: "Limit, Continuity and Derivative",
    questions: [
      { q: "If limit of f(x) as x → a exists, then:", options: ["f(a) must exist", "Left and right limits are equal", "f(x) is differentiable at a", "f(x) must be continuous"], correct: 1 },
      { q: "A function is continuous at x = a if:", options: ["limit exists only", "f(a) exists only", "limit exists and equals f(a)", "derivative exists"], correct: 2 },
      { q: "If left-hand limit ≠ right-hand limit at x = a, then function is:", options: ["Continuous", "Differentiable", "Discontinuous", "Increasing"], correct: 2 },
      { q: "If a function has a sharp corner, then:", options: ["derivative exists", "derivative does not exist", "function is constant", "limit does not exist"], correct: 1 },
      { q: "Differentiability implies:", options: ["continuity", "discontinuity", "periodicity", "symmetry"], correct: 0 },
      { q: "lim x→0 (sin x / x) =", options: ["0", "1", "∞", "does not exist"], correct: 1 },
      { q: "lim x→∞ (1/x) =", options: ["1", "0", "∞", "-1"], correct: 1 },
      { q: "A jump discontinuity occurs when:", options: ["function undefined", "left ≠ right limit", "derivative exists", "function is smooth"], correct: 1 },
      { q: "Derivative represents:", options: ["area under curve", "slope of tangent", "volume", "intercept"], correct: 1 },
      { q: "If f(x) is constant, derivative is:", options: ["1", "0", "x", "infinity"], correct: 1 }
    ]
  },
  {
    exercise: "Integration",
    questions: [
      { q: "Integration is the reverse process of:", options: ["Differentiation", "Multiplication", "Division", "Limits"], correct: 0 },
      { q: "∫ x^n dx equals:", options: ["nx^(n-1)", "x^(n+1)/(n+1) + C", "x^n+1", "n/x"], correct: 1 },
      { q: "The derivative of an integral gives:", options: ["0", "original function", "constant", "limit"], correct: 1 },
      { q: "∫ 1/x dx equals:", options: ["x", "ln|x| + C", "1/x^2", "e^x"], correct: 1 },
      { q: "∫ 0 dx equals:", options: ["0", "1", "x", "C"], correct: 3 },
      { q: "Definite integral gives:", options: ["constant", "number", "function", "slope"], correct: 1 },
      { q: "Indefinite integral gives:", options: ["number", "function + C", "slope", "matrix"], correct: 1 },
      { q: "∫ e^x dx equals:", options: ["e^x + C", "x e^x", "ln x", "1/e^x"], correct: 0 },
      { q: "∫ sin x dx equals:", options: ["cos x", "-cos x + C", "sin x", "tan x"], correct: 1 },
      { q: "∫ cos x dx equals:", options: ["sin x + C", "-sin x + C", "cos x", "tan x"], correct: 0 }
    ]
  }
];
