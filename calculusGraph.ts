import { Concept, Question } from '@/types';

export const CALCULUS_CONCEPTS: Concept[] = [
  {
    id: 'limits-foundations',
    name: 'Limits & Intuition',
    subject: 'Calculus',
    difficulty: 1,
    category: 'foundations',
    prerequisites: [],
    description: 'Behavior of functions as inputs approach a value, one-sided limits, and indeterminate forms (0/0).',
    importance: 4,
    estimatedLearningMinutes: 25,
    coreFormulas: ['\\lim_{x \\to c} f(x) = L', '\\lim_{x \\to c} \\frac{f(x)}{g(x)}'],
    commonMisconceptions: [
      {
        tag: 'limit_equals_function_value',
        description: 'Assuming lim_{x->c} f(x) must always equal f(c) even if f(c) is undefined or has a hole.',
        remedy: 'Emphasize that limits describe neighboring behavior near c, not the exact evaluation at c.'
      },
      {
        tag: 'indeterminate_means_undefined',
        description: 'Assuming 0/0 means undefined or no limit exists, without algebraic cancellation.',
        remedy: 'Factor polynomials or use conjugates to reveal the removable discontinuity.'
      }
    ]
  },
  {
    id: 'continuity',
    name: 'Continuity & IVT',
    subject: 'Calculus',
    difficulty: 2,
    category: 'foundations',
    prerequisites: ['limits-foundations'],
    description: 'Three-condition definition of continuity at a point, jump/removable discontinuities, and the Intermediate Value Theorem.',
    importance: 3,
    estimatedLearningMinutes: 20,
    coreFormulas: ['\\lim_{x \\to c} f(x) = f(c)', 'f(a) \\le u \\le f(b) \\implies \\exists c \\in [a,b] : f(c) = u'],
    commonMisconceptions: [
      {
        tag: 'continuity_without_limit_check',
        description: 'Assuming a function is continuous just because both one-sided limits exist, without verifying they equal f(c).',
        remedy: 'Check all 3 conditions: f(c) exists, lim f(x) exists, and lim f(x) == f(c).'
      }
    ]
  },
  {
    id: 'derivatives-def',
    name: 'Definition of Derivative',
    subject: 'Calculus',
    difficulty: 2,
    category: 'foundations',
    prerequisites: ['continuity'],
    description: 'Instantaneous rate of change as the limit of difference quotients, tangent lines, and differentiability vs continuity.',
    importance: 5,
    estimatedLearningMinutes: 30,
    coreFormulas: ["f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}"],
    commonMisconceptions: [
      {
        tag: 'differentiable_confused_with_continuous',
        description: 'Believing every continuous function is differentiable (e.g. at sharp corners like |x|).',
        remedy: 'Visual example of |x| at x=0 where slope from left is -1 and right is +1.'
      }
    ]
  },
  {
    id: 'power-rule',
    name: 'Power & Polynomial Rules',
    subject: 'Calculus',
    difficulty: 1,
    category: 'differential',
    prerequisites: ['derivatives-def'],
    description: 'Derivative of powers x^n, linearity, constant factor, and sum/difference rules.',
    importance: 4,
    estimatedLearningMinutes: 20,
    coreFormulas: ['\\frac{d}{dx}[x^n] = n x^{n-1}', '\\frac{d}{dx}[c f(x)] = c f\'(x)'],
    commonMisconceptions: [
      {
        tag: 'negative_fractional_power_slip',
        description: 'Incorrectly decrementing negative or fractional exponents (e.g., d/dx[x^(-2)] as -2x^(-1) instead of -2x^(-3)).',
        remedy: 'Explicitly write out n - 1 subtraction: -2 - 1 = -3.'
      }
    ]
  },
  {
    id: 'product-rule',
    name: 'Product Rule',
    subject: 'Calculus',
    difficulty: 2,
    category: 'differential',
    prerequisites: ['power-rule'],
    description: 'Differentiating products of functions f(x)g(x) using the Leibniz rule.',
    importance: 4,
    estimatedLearningMinutes: 25,
    coreFormulas: ['(uv)\' = u\'v + uv\''],
    commonMisconceptions: [
      {
        tag: 'naive_product_differentiation',
        description: 'Differentiating f(x)g(x) by just multiplying their individual derivatives f\'(x)g\'(x).',
        remedy: 'Geometric area intuition: delta(u*v) = u*delta(v) + v*delta(u).'
      }
    ]
  },
  {
    id: 'quotient-rule',
    name: 'Quotient Rule',
    subject: 'Calculus',
    difficulty: 2,
    category: 'differential',
    prerequisites: ['power-rule'],
    description: 'Differentiating ratios of functions f(x)/g(x) with the low-d-high minus high-d-low formula.',
    importance: 4,
    estimatedLearningMinutes: 25,
    coreFormulas: ['\\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}'],
    commonMisconceptions: [
      {
        tag: 'quotient_subtraction_order_reversed',
        description: 'Reversing the numerator subtraction order: writing uv\' - u\'v instead of u\'v - uv\'.',
        remedy: 'Use the mnemonic "Low d-High minus High d-Low over Low squared".'
      }
    ]
  },
  {
    id: 'chain-rule',
    name: 'Chain Rule Composition',
    subject: 'Calculus',
    difficulty: 3,
    category: 'differential',
    prerequisites: ['product-rule', 'quotient-rule'],
    description: 'Differentiating composite functions f(g(x)) by multiplying outer and inner derivatives.',
    importance: 5,
    estimatedLearningMinutes: 35,
    coreFormulas: ['\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)'],
    commonMisconceptions: [
      {
        tag: 'forgetting_inner_derivative',
        description: 'Differentiating outer function without multiplying by the inner function derivative g\'(x) (e.g. d/dx[(3x+1)^4] = 4(3x+1)^3).',
        remedy: 'Decompose composite functions explicitly into outer u = g(x) and inner y = f(u).'
      },
      {
        tag: 'premature_inner_evaluation',
        description: 'Differentiating the inside function inside the outer function simultaneously (e.g. f\'(g\'(x))).',
        remedy: 'Keep the inner input untouched during outer derivative evaluation: f\'(g(x)).'
      }
    ]
  },
  {
    id: 'implicit-diff',
    name: 'Implicit Differentiation',
    subject: 'Calculus',
    difficulty: 3,
    category: 'differential',
    prerequisites: ['chain-rule'],
    description: 'Finding dy/dx for relations like x^2 + y^2 = 25 where y is not isolated, treating y as an implicit function of x.',
    importance: 4,
    estimatedLearningMinutes: 30,
    coreFormulas: ['\\frac{d}{dx}[y^n] = n y^{n-1} \\frac{dy}{dx}', 'x^2 + y^2 = r^2 \\implies 2x + 2y y\' = 0'],
    commonMisconceptions: [
      {
        tag: 'omitting_dydx_on_y_terms',
        description: 'Treating y as a constant or regular x variable without attaching the dy/dx factor.',
        remedy: 'Highlight every y with a color to remind student it requires chain rule d/dx.'
      }
    ]
  },
  {
    id: 'related-rates',
    name: 'Related Rates',
    subject: 'Calculus',
    difficulty: 4,
    category: 'applications',
    prerequisites: ['implicit-diff'],
    description: 'Solving real-world problems where variables change with respect to time t (e.g., expanding spheres, sliding ladders).',
    importance: 4,
    estimatedLearningMinutes: 40,
    coreFormulas: ['\\frac{dV}{dt} = 4\\pi r^2 \\frac{dr}{dt}', 'x^2 + y^2 = L^2 \\implies 2x \\frac{dx}{dt} + 2y \\frac{dy}{dt} = 0'],
    commonMisconceptions: [
      {
        tag: 'substituting_instantaneous_values_too_early',
        description: 'Plugging in specific snapshot numbers (like r=5) before taking the derivative with respect to time.',
        remedy: 'Strict two-phase rule: 1) Differentiate geometrically first, 2) Substitute instantaneous numbers last.'
      }
    ]
  },
  {
    id: 'mvt',
    name: 'Mean Value & Extrema',
    subject: 'Calculus',
    difficulty: 3,
    category: 'applications',
    prerequisites: ['derivatives-def'],
    description: 'Critical points, Fermat theorem for extrema, Rolle theorem, and the Mean Value Theorem.',
    importance: 3,
    estimatedLearningMinutes: 25,
    coreFormulas: ['f\'(c) = \\frac{f(b) - f(a)}{b - a}'],
    commonMisconceptions: [
      {
        tag: 'mvt_hypothesis_unverified',
        description: 'Applying MVT on intervals where the function has a discontinuity or non-differentiable cusp.',
        remedy: 'Always check: Continuous on [a,b] AND differentiable on (a,b).'
      }
    ]
  },
  {
    id: 'optimization',
    name: 'Applied Optimization',
    subject: 'Calculus',
    difficulty: 4,
    category: 'applications',
    prerequisites: ['chain-rule', 'mvt'],
    description: 'Maximizing or minimizing an objective function subject to constraints (e.g., max volume box, min cost fence).',
    importance: 4,
    estimatedLearningMinutes: 40,
    coreFormulas: ['f\'(x) = 0 \\quad \\text{and} \\quad f\'\'(x) < 0 \\implies \\text{Local Max}'],
    commonMisconceptions: [
      {
        tag: 'neglecting_endpoint_extrema',
        description: 'Finding critical points inside the interval but forgetting to test domain endpoints for absolute extrema.',
        remedy: 'Make a table comparing f(endpoints) with f(critical points).'
      }
    ]
  },
  {
    id: 'riemann-sums',
    name: 'Riemann Sums & Area',
    subject: 'Calculus',
    difficulty: 2,
    category: 'integral',
    prerequisites: ['derivatives-def'],
    description: 'Approximating area under curves using Left, Right, Midpoint, and Trapezoid rectangles, and limit as n -> infinity.',
    importance: 3,
    estimatedLearningMinutes: 25,
    coreFormulas: ['A \\approx \\sum_{i=1}^n f(x_i^*) \\Delta x', '\\Delta x = \\frac{b-a}{n}'],
    commonMisconceptions: [
      {
        tag: 'delta_x_miscalculation',
        description: 'Incorrectly computing delta x or missing the width factor when summing rectangle heights.',
        remedy: 'Always calculate delta x = (b - a)/n first and factor it outside the sum.'
      }
    ]
  },
  {
    id: 'definite-integrals',
    name: 'Definite Integrals & Properties',
    subject: 'Calculus',
    difficulty: 2,
    category: 'integral',
    prerequisites: ['riemann-sums'],
    description: 'The net signed area integral, linearity properties, splitting intervals, and symmetry for even/odd functions.',
    importance: 4,
    estimatedLearningMinutes: 25,
    coreFormulas: ['\\int_a^b f(x) dx = -\\int_b^a f(x) dx', '\\int_a^c = \\int_a^b + \\int_b^c'],
    commonMisconceptions: [
      {
        tag: 'net_signed_area_sign_confusion',
        description: 'Treating area below the x-axis as positive instead of negative in definite integrals.',
        remedy: 'Integral is net signed area: (Area Above) - (Area Below).'
      }
    ]
  },
  {
    id: 'ftc',
    name: 'Fundamental Theorem (FTC)',
    subject: 'Calculus',
    difficulty: 3,
    category: 'integral',
    prerequisites: ['definite-integrals', 'chain-rule'],
    description: 'FTC Part 1: derivative of an accumulation function; FTC Part 2: evaluation of integrals via antiderivatives F(b) - F(a).',
    importance: 5,
    estimatedLearningMinutes: 35,
    coreFormulas: [
      '\\frac{d}{dx} \\left[ \\int_a^x f(t) dt \\right] = f(x)',
      '\\int_a^b f(x) dx = F(b) - F(a)'
    ],
    commonMisconceptions: [
      {
        tag: 'ftc1_variable_upper_bound_chain_rule_miss',
        description: 'Differentiating int_0^{x^2} f(t) dt as just f(x^2) without multiplying by 2x.',
        remedy: 'Apply chain rule: d/dx[int_a^{u(x)} f(t) dt] = f(u(x)) * u\'(x).'
      }
    ]
  },
  {
    id: 'u-substitution',
    name: 'U-Substitution',
    subject: 'Calculus',
    difficulty: 3,
    category: 'integral',
    prerequisites: ['ftc'],
    description: 'Reverse chain rule for integration: substituting u = g(x) and du = g\'(x) dx to simplify integrands.',
    importance: 4,
    estimatedLearningMinutes: 35,
    coreFormulas: ['\\int f(g(x)) g\'(x) dx = \\int f(u) du'],
    commonMisconceptions: [
      {
        tag: 'forgetting_to_change_integral_bounds',
        description: 'Substituting u in a definite integral but leaving the original x-bounds unchanged.',
        remedy: 'Transform bounds immediately: u_a = g(a) and u_b = g(b).'
      },
      {
        tag: 'missing_constant_multiplier_in_du',
        description: 'Forgetting to balance constants (e.g., if du = 2x dx, writing dx = du without the 1/2 factor).',
        remedy: 'Solve explicitly for x dx = (1/2) du before rewriting the integrand.'
      }
    ]
  },
  {
    id: 'integration-by-parts',
    name: 'Integration by Parts',
    subject: 'Calculus',
    difficulty: 4,
    category: 'integral',
    prerequisites: ['ftc'],
    description: 'Reverse product rule for integrals of product forms: int u dv = u v - int v du with LIATE priority.',
    importance: 4,
    estimatedLearningMinutes: 40,
    coreFormulas: ['\\int u \\, dv = u v - \\int v \\, du'],
    commonMisconceptions: [
      {
        tag: 'suboptimal_u_choice_liate',
        description: 'Choosing u and dv incorrectly, making the resulting integral int v du more complex than the original.',
        remedy: 'Use the LIATE mnemonic: Logarithmic, Inverse trig, Algebraic, Trig, Exponential.'
      }
    ]
  },
  {
    id: 'diff-equations',
    name: 'Separable Diff Equations',
    subject: 'Calculus',
    difficulty: 4,
    category: 'advanced',
    prerequisites: ['u-substitution', 'chain-rule'],
    description: 'First-order separable differential equations dy/dx = g(x)h(y), exponential growth/decay models, and initial value problems.',
    importance: 4,
    estimatedLearningMinutes: 40,
    coreFormulas: ['\\frac{1}{h(y)} dy = g(x) dx', 'y(t) = y_0 e^{kt}'],
    commonMisconceptions: [
      {
        tag: 'algebraic_separation_slip',
        description: 'Adding or subtracting terms across differentials instead of strictly multiplying/dividing to isolate variables.',
        remedy: 'Only use multiplication and division to group all y terms on dy side and x terms on dx side.'
      },
      {
        tag: 'premature_c_omission',
        description: 'Adding the constant +C only at the very end after exponentiation instead of right after integration.',
        remedy: 'Always write + C immediately upon removing the integral sign: ln|y| = kx + C -> y = A e^{kx}.'
      }
    ]
  }
];

export const QUESTION_BANK: Question[] = [
  {
    id: 'q_lim_1',
    conceptId: 'limits-foundations',
    difficulty: 1,
    text: 'What is \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2}?',
    options: [
      { id: 'a', text: '4', isCorrect: true },
      { id: 'b', text: '0', isCorrect: false, misconceptionTag: 'indeterminate_means_undefined', misconceptionExplanation: 'Calculated 0/0 and assumed the limit equals 0.' },
      { id: 'c', text: 'Undefined / Does Not Exist', isCorrect: false, misconceptionTag: 'limit_equals_function_value', misconceptionExplanation: 'Assumed that because the denominator is 0 at x=2, the limit cannot exist.' },
      { id: 'd', text: '2', isCorrect: false, misconceptionExplanation: 'Substituted x=2 into numerator only.' }
    ],
    explanation: 'Factor the numerator: (x-2)(x+2)/(x-2) = x+2 for x != 2. As x -> 2, x+2 -> 4.'
  },
  {
    id: 'q_cont_1',
    conceptId: 'continuity',
    difficulty: 2,
    text: 'Let f(x) = (x^2 - 1)/(x - 1) for x != 1, and f(1) = 3. Is f continuous at x = 1?',
    options: [
      { id: 'a', text: 'No, because \\lim_{x \\to 1} f(x) = 2 \\neq f(1) = 3', isCorrect: true },
      { id: 'b', text: 'Yes, because both \\lim_{x \\to 1} f(x) and f(1) exist', isCorrect: false, misconceptionTag: 'continuity_without_limit_check', misconceptionExplanation: 'Forgot that the limit value MUST equal the defined function value f(c).' },
      { id: 'c', text: 'Yes, all rational functions are continuous everywhere', isCorrect: false, misconceptionExplanation: 'Rational functions are only continuous on their domain.' },
      { id: 'd', text: 'No, because limits cannot exist at removable discontinuities', isCorrect: false, misconceptionExplanation: 'Removable discontinuities have well-defined two-sided limits.' }
    ],
    explanation: 'For continuity at x=1, we must have lim_{x->1} f(x) = f(1). Here lim = 2, but f(1) = 3.'
  },
  {
    id: 'q_diff_def_1',
    conceptId: 'derivatives-def',
    difficulty: 2,
    text: 'Why is f(x) = |x| NOT differentiable at x = 0, even though it is continuous everywhere?',
    options: [
      { id: 'a', text: 'The left-hand derivative is -1 while the right-hand derivative is +1', isCorrect: true },
      { id: 'b', text: 'Because f(0) = 0 is a critical zero point', isCorrect: false, misconceptionExplanation: 'Functions can easily be differentiable where f(x)=0.' },
      { id: 'c', text: 'Because continuous functions are never differentiable at origin', isCorrect: false, misconceptionTag: 'differentiable_confused_with_continuous', misconceptionExplanation: 'Confused continuity conditions with differentiability.' },
      { id: 'd', text: 'Because absolute value functions do not have limits', isCorrect: false, misconceptionExplanation: 'The limit of |x| as x->0 is 0.' }
    ],
    explanation: 'Differentiability requires the two-sided limit of the difference quotient to agree. At x=0, lim_{h->0^-} (f(h)-0)/h = -1, but lim_{h->0^+} = +1.'
  },
  {
    id: 'q_pow_1',
    conceptId: 'power-rule',
    difficulty: 1,
    text: 'Find \\frac{d}{dx} \\left[ \\frac{1}{x^3} \\right].',
    options: [
      { id: 'a', text: '-\\frac{3}{x^4}', isCorrect: true },
      { id: 'b', text: '-\\frac{3}{x^2}', isCorrect: false, misconceptionTag: 'negative_fractional_power_slip', misconceptionExplanation: 'Subtracted 1 from -3 incorrectly: thought -3 + 1 = -2.' },
      { id: 'c', text: '\\frac{1}{3x^2}', isCorrect: false, misconceptionExplanation: 'Differentiated denominator in place without power rule.' },
      { id: 'd', text: '-\\frac{1}{x^4}', isCorrect: false, misconceptionExplanation: 'Forgot power coefficient multiplier -3.' }
    ],
    explanation: 'Rewrite 1/x^3 as x^(-3). Then d/dx[x^(-3)] = -3 * x^(-4) = -3 / x^4.'
  },
  {
    id: 'q_prod_1',
    conceptId: 'product-rule',
    difficulty: 2,
    text: 'Find \\frac{d}{dx}[x^3 \\sin(x)].',
    options: [
      { id: 'a', text: '3x^2 \\sin(x) + x^3 \\cos(x)', isCorrect: true },
      { id: 'b', text: '3x^2 \\cos(x)', isCorrect: false, misconceptionTag: 'naive_product_differentiation', misconceptionExplanation: 'Multiplied the individual derivatives d/dx[x^3] * d/dx[sin x].' },
      { id: 'c', text: '3x^2 \\sin(x) - x^3 \\cos(x)', isCorrect: false, misconceptionExplanation: 'Used subtraction instead of addition for product rule.' },
      { id: 'd', text: 'x^3 \\sin(x) + 3x^2 \\cos(x)', isCorrect: false, misconceptionExplanation: 'Swapped derivative assignments.' }
    ],
    explanation: 'By product rule: (u v)\' = u\' v + u v\' = (3x^2)(sin x) + (x^3)(cos x).'
  },
  {
    id: 'q_quot_1',
    conceptId: 'quotient-rule',
    difficulty: 2,
    text: 'Find \\frac{d}{dx} \\left[ \\frac{\\sin(x)}{x} \\right].',
    options: [
      { id: 'a', text: '\\frac{x\\cos(x) - \\sin(x)}{x^2}', isCorrect: true },
      { id: 'b', text: '\\frac{\\sin(x) - x\\cos(x)}{x^2}', isCorrect: false, misconceptionTag: 'quotient_subtraction_order_reversed', misconceptionExplanation: 'Reversed the numerator terms (High d-Low minus Low d-High).' },
      { id: 'c', text: '\\frac{\\cos(x)}{1}', isCorrect: false, misconceptionExplanation: 'Differentiated top and bottom independently without quotient rule.' },
      { id: 'd', text: '\\frac{x\\cos(x) + \\sin(x)}{x^2}', isCorrect: false, misconceptionExplanation: 'Used plus instead of minus in numerator.' }
    ],
    explanation: 'Quotient rule: (u\'v - uv\') / v^2 = (cos(x)*x - sin(x)*1) / x^2.'
  },
  {
    id: 'q_chain_1',
    conceptId: 'chain-rule',
    difficulty: 3,
    text: 'What is \\frac{d}{dx} \\left[ (5x^3 - 2)^4 \\right]?',
    options: [
      { id: 'a', text: '60x^2 (5x^3 - 2)^3', isCorrect: true },
      { id: 'b', text: '4 (5x^3 - 2)^3', isCorrect: false, misconceptionTag: 'forgetting_inner_derivative', misconceptionExplanation: 'Differentiated outer power 4(u)^3 but forgot to multiply by inner derivative g\'(x) = 15x^2.' },
      { id: 'c', text: '4 (15x^2)^3', isCorrect: false, misconceptionTag: 'premature_inner_evaluation', misconceptionExplanation: 'Differentiated the inside while evaluating the outer power.' },
      { id: 'd', text: '20x^2 (5x^3 - 2)^3', isCorrect: false, misconceptionExplanation: 'Multiplied 4 by 5 instead of inner derivative 15x^2.' }
    ],
    explanation: 'Let u = 5x^3 - 2. Outer derivative is 4u^3. Inner derivative is 15x^2. Product = 4(5x^3 - 2)^3 * (15x^2) = 60x^2(5x^3 - 2)^3.'
  },
  {
    id: 'q_chain_2',
    conceptId: 'chain-rule',
    difficulty: 3,
    text: 'Find \\frac{d}{dx}[\\sin(x^2 + 3x)].',
    options: [
      { id: 'a', text: '(2x + 3) \\cos(x^2 + 3x)', isCorrect: true },
      { id: 'b', text: '\\cos(x^2 + 3x)', isCorrect: false, misconceptionTag: 'forgetting_inner_derivative', misconceptionExplanation: 'Forgot inner derivative d/dx[x^2 + 3x] = (2x+3).' },
      { id: 'c', text: '\\cos(2x + 3)', isCorrect: false, misconceptionTag: 'premature_inner_evaluation', misconceptionExplanation: 'Replaced inner term with its derivative inside the cosine.' },
      { id: 'd', text: '-(2x + 3) \\cos(x^2 + 3x)', isCorrect: false, misconceptionExplanation: 'Incorrect sign for derivative of sine.' }
    ],
    explanation: 'Outer derivative: cos(x^2+3x). Inner derivative: 2x+3. Multiply: (2x+3)cos(x^2+3x).'
  },
  {
    id: 'q_imp_1',
    conceptId: 'implicit-diff',
    difficulty: 3,
    text: 'For the circle x^2 + y^2 = 25, find \\frac{dy}{dx} in terms of x and y.',
    options: [
      { id: 'a', text: '-\\frac{x}{y}', isCorrect: true },
      { id: 'b', text: '-2x', isCorrect: false, misconceptionTag: 'omitting_dydx_on_y_terms', misconceptionExplanation: 'Treated y^2 as constant 0 or omitted the dy/dx chain factor.' },
      { id: 'c', text: '\\frac{x}{y}', isCorrect: false, misconceptionExplanation: 'Sign error when subtracting 2x to the other side.' },
      { id: 'd', text: '-\\frac{y}{x}', isCorrect: false, misconceptionExplanation: 'Inverted the fraction dy/dx.' }
    ],
    explanation: 'Differentiate with respect to x: 2x + 2y(dy/dx) = 0 => 2y(dy/dx) = -2x => dy/dx = -x/y.'
  },
  {
    id: 'q_rr_1',
    conceptId: 'related-rates',
    difficulty: 4,
    text: 'A spherical balloon is inflating such that \\frac{dr}{dt} = 2 \\text{ cm/s}. When r = 3 \\text{ cm}, what is \\frac{dV}{dt}? (Given V = \\frac{4}{3}\\pi r^3)',
    options: [
      { id: 'a', text: '72\\pi \\text{ cm}^3/\\text{s}', isCorrect: true },
      { id: 'b', text: '36\\pi \\text{ cm}^3/\\text{s}', isCorrect: false, misconceptionTag: 'substituting_instantaneous_values_too_early', misconceptionExplanation: 'Forgot the dr/dt chain multiplier 2, only calculated 4*pi*r^2.' },
      { id: 'c', text: '18\\pi \\text{ cm}^3/\\text{s}', isCorrect: false, misconceptionExplanation: 'Arithmetic error in evaluating 4*pi*(3^2)*2.' },
      { id: 'd', text: '108\\pi \\text{ cm}^3/\\text{s}', isCorrect: false, misconceptionExplanation: 'Did not cancel the 3 in (4/3)*pi*3*r^2.' }
    ],
    explanation: 'dV/dt = 4*pi*r^2 * (dr/dt). At r=3 and dr/dt=2: dV/dt = 4*pi*(9)*(2) = 72*pi cm^3/s.'
  },
  {
    id: 'q_mvt_1',
    conceptId: 'mvt',
    difficulty: 3,
    text: 'Does Rolle\'s Theorem apply to f(x) = 1 - x^{2/3} on [-1, 1] where f(-1) = f(1) = 0?',
    options: [
      { id: 'a', text: 'No, because f(x) is not differentiable at x = 0 (has a sharp cusp)', isCorrect: true },
      { id: 'b', text: 'Yes, because f(-1) = f(1) and f is continuous on [-1, 1]', isCorrect: false, misconceptionTag: 'mvt_hypothesis_unverified', misconceptionExplanation: 'Checked continuity and endpoint equality but failed to check differentiability on (-1, 1).' },
      { id: 'c', text: 'Yes, the derivative is zero at x = 0', isCorrect: false, misconceptionExplanation: 'f\'(0) does not exist (slope approaches infinity).' },
      { id: 'd', text: 'No, because f(x) is not continuous at x = 0', isCorrect: false, misconceptionExplanation: 'f(0)=1 is defined and continuous.' }
    ],
    explanation: 'f\'(x) = -2/(3*x^(1/3)), which is undefined at x=0. Because differentiability fails on (-1, 1), Rolle theorem hypothesis is not met.'
  },
  {
    id: 'q_opt_1',
    conceptId: 'optimization',
    difficulty: 4,
    text: 'Find the maximum value of f(x) = 2x^3 - 3x^2 - 12x + 1 on the closed interval [-2, 3].',
    options: [
      { id: 'a', text: '8 (at x = -1)', isCorrect: true },
      { id: 'b', text: '-19 (at x = 2)', isCorrect: false, misconceptionTag: 'neglecting_endpoint_extrema', misconceptionExplanation: 'Identified local minimum instead of global maximum.' },
      { id: 'c', text: '-8 (at x = 3)', isCorrect: false, misconceptionExplanation: 'Looked only at endpoint without comparing critical values.' },
      { id: 'd', text: '1 (at x = 0)', isCorrect: false, misconceptionExplanation: 'Evaluated y-intercept instead of critical points.' }
    ],
    explanation: 'f\'(x) = 6x^2 - 6x - 12 = 6(x-2)(x+1) = 0 => x = -1, 2. Compare f(-2)=-3, f(-1)=8, f(2)=-19, f(3)=-8. Global max is 8 at x = -1.'
  },
  {
    id: 'q_riemann_1',
    conceptId: 'riemann-sums',
    difficulty: 2,
    text: 'Approximate \\int_0^4 2x \\, dx using a Left Riemann Sum with n = 4 equal subintervals.',
    options: [
      { id: 'a', text: '12', isCorrect: true },
      { id: 'b', text: '20', isCorrect: false, misconceptionExplanation: 'Calculated Right Riemann Sum (2+4+6+8) instead of Left (0+2+4+6).' },
      { id: 'c', text: '16', isCorrect: false, misconceptionExplanation: 'Calculated exact integral instead of Riemann approximation.' },
      { id: 'd', text: '6', isCorrect: false, misconceptionTag: 'delta_x_miscalculation', misconceptionExplanation: 'Forgot interval width delta x = (4-0)/4 = 1.' }
    ],
    explanation: 'delta x = (4-0)/4 = 1. Left endpoints are x = 0, 1, 2, 3. Heights = 2(0)=0, 2(1)=2, 2(2)=4, 2(3)=6. Sum = (0+2+4+6)*1 = 12.'
  },
  {
    id: 'q_def_int_1',
    conceptId: 'definite-integrals',
    difficulty: 2,
    text: 'If \\int_1^5 f(x) dx = 10 and \\int_3^5 f(x) dx = 4, what is \\int_1^3 f(x) dx?',
    options: [
      { id: 'a', text: '6', isCorrect: true },
      { id: 'b', text: '14', isCorrect: false, misconceptionExplanation: 'Added the integrals instead of subtracting.' },
      { id: 'c', text: '-6', isCorrect: false, misconceptionTag: 'net_signed_area_sign_confusion', misconceptionExplanation: 'Subtracted in reverse order 4 - 10.' },
      { id: 'd', text: '2.5', isCorrect: false, misconceptionExplanation: 'Divided 10 by 4.' }
    ],
    explanation: 'By interval addition: int_1^5 = int_1^3 + int_3^5 => 10 = int_1^3 + 4 => int_1^3 = 6.'
  },
  {
    id: 'q_ftc_1',
    conceptId: 'ftc',
    difficulty: 3,
    text: 'Find \\frac{d}{dx} \\left[ \\int_2^{x^3} \\sqrt{1 + t^2} \\, dt \\right].',
    options: [
      { id: 'a', text: '3x^2 \\sqrt{1 + x^6}', isCorrect: true },
      { id: 'b', text: '\\sqrt{1 + x^6}', isCorrect: false, misconceptionTag: 'ftc1_variable_upper_bound_chain_rule_miss', misconceptionExplanation: 'Evaluated f(x^3) but forgot to multiply by the chain rule factor d/dx[x^3] = 3x^2.' },
      { id: 'c', text: '\\sqrt{1 + x^2}', isCorrect: false, misconceptionExplanation: 'Did not substitute upper bound x^3 into t.' },
      { id: 'd', text: '3x^2 \\sqrt{1 + x^3}', isCorrect: false, misconceptionExplanation: 'Failed to square x^3 in t^2.' }
    ],
    explanation: 'By FTC 1 and Chain Rule: d/dx[int_a^{u(x)} f(t)dt] = f(u(x)) * u\'(x) = sqrt(1 + (x^3)^2) * (3x^2) = 3x^2 * sqrt(1 + x^6).'
  },
  {
    id: 'q_usub_1',
    conceptId: 'u-substitution',
    difficulty: 3,
    text: 'Evaluate \\int 2x e^{x^2} \\, dx.',
    options: [
      { id: 'a', text: 'e^{x^2} + C', isCorrect: true },
      { id: 'b', text: '2 e^{x^2} + C', isCorrect: false, misconceptionTag: 'missing_constant_multiplier_in_du', misconceptionExplanation: 'Did not recognize that 2x dx is exactly du.' },
      { id: 'c', text: 'x^2 e^{x^2} + C', isCorrect: false, misconceptionExplanation: 'Integrated x separately from exponential.' },
      { id: 'd', text: '\\frac{1}{2} e^{x^2} + C', isCorrect: false, misconceptionExplanation: 'Unnecessarily multiplied by 1/2.' }
    ],
    explanation: 'Let u = x^2, then du = 2x dx. The integral becomes int e^u du = e^u + C = e^{x^2} + C.'
  },
  {
    id: 'q_ibp_1',
    conceptId: 'integration-by-parts',
    difficulty: 4,
    text: 'Evaluate \\int x \\cos(x) \\, dx.',
    options: [
      { id: 'a', text: 'x \\sin(x) + \\cos(x) + C', isCorrect: true },
      { id: 'b', text: 'x \\sin(x) - \\cos(x) + C', isCorrect: false, misconceptionExplanation: 'Sign error on -int v du = -int sin(x) dx = -(-cos(x)) = +cos(x).' },
      { id: 'c', text: '\\frac{x^2}{2} \\sin(x) + C', isCorrect: false, misconceptionTag: 'suboptimal_u_choice_liate', misconceptionExplanation: 'Integrated both factors separately without integration by parts.' },
      { id: 'd', text: '-x \\sin(x) + \\cos(x) + C', isCorrect: false, misconceptionExplanation: 'Incorrect antiderivative of cos(x).' }
    ],
    explanation: 'Let u = x -> du = dx; dv = cos(x)dx -> v = sin(x). int u dv = x sin(x) - int sin(x) dx = x sin(x) - (-cos(x)) + C = x sin(x) + cos(x) + C.'
  },
  {
    id: 'q_diffeq_1',
    conceptId: 'diff-equations',
    difficulty: 4,
    text: 'Solve the differential equation \\frac{dy}{dx} = 3x^2 y with initial condition y(0) = 5.',
    options: [
      { id: 'a', text: 'y = 5 e^{x^3}', isCorrect: true },
      { id: 'b', text: 'y = e^{x^3} + 5', isCorrect: false, misconceptionTag: 'premature_c_omission', misconceptionExplanation: 'Added constant +5 at the end outside the exponent instead of y = C e^{x^3}.' },
      { id: 'c', text: 'y = 5 e^{3x^3}', isCorrect: false, misconceptionExplanation: 'Failed to divide by 3 when integrating 3x^2.' },
      { id: 'd', text: 'y = x^3 + 5', isCorrect: false, misconceptionTag: 'algebraic_separation_slip', misconceptionExplanation: 'Integrated dy/dx as if y were not present.' }
    ],
    explanation: 'Separate variables: (1/y) dy = 3x^2 dx. Integrate both sides: ln|y| = x^3 + C => y = A e^{x^3}. Using y(0)=5 gives A=5, so y = 5 e^{x^3}.'
  }
];
