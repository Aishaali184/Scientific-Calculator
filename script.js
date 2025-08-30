let display = '0';
        let expression = '';
        let lastResult = null;
        let isRadians = true;

        const displayElement = document.getElementById('display');
        const expressionElement = document.getElementById('expression');
        const modeBadge = document.getElementById('mode-badge');

        function updateDisplay() {
            displayElement.textContent = display;
            expressionElement.textContent = expression;
        }

        function safeEvaluate(expr) {
            try {
                // Replace mathematical functions for evaluation
                let evalExpr = expr
                    .replace(/sin\(/g, 'Math.sin(')
                    .replace(/cos\(/g, 'Math.cos(')
                    .replace(/tan\(/g, 'Math.tan(')
                    .replace(/asin\(/g, 'Math.asin(')
                    .replace(/acos\(/g, 'Math.acos(')
                    .replace(/atan\(/g, 'Math.atan(')
                    .replace(/log\(/g, 'Math.log10(')
                    .replace(/ln\(/g, 'Math.log(')
                    .replace(/sqrt\(/g, 'Math.sqrt(')
                    .replace(/exp\(/g, 'Math.exp(')
                    .replace(/π/g, 'Math.PI')
                    .replace(/e/g, 'Math.E')
                    .replace(/\^/g, '**')
                    .replace(/!/g, '') // Handle factorial separately
                    .replace(/%/g, '/100');

                // Convert degrees to radians if needed
                if (!isRadians) {
                    evalExpr = evalExpr
                        .replace(/Math\.sin\(([^)]+)\)/g, 'Math.sin(($1) * Math.PI / 180)')
                        .replace(/Math\.cos\(([^)]+)\)/g, 'Math.cos(($1) * Math.PI / 180)')
                        .replace(/Math\.tan\(([^)]+)\)/g, 'Math.tan(($1) * Math.PI / 180)');
                }

                const result = Function('"use strict"; return (' + evalExpr + ')')();
                return isNaN(result) ? 'Error' : result.toString();
            } catch (error) {
                return 'Error';
            }
        }

        function calculateResult(newExpression) {
            if (newExpression === '') {
                display = '0';
                return;
            }
            
            const result = safeEvaluate(newExpression);
            if (result !== 'Error') {
                display = result;
            }
        }

        function handleClick(value) {
            if (value === 'C') {
                expression = '';
                display = '0';
                lastResult = null;
            } else if (value === '=') {
                const result = safeEvaluate(expression);
                display = result;
                lastResult = result;
                expression = result === 'Error' ? '' : result;
            } else if (value === 'DEL') {
                expression = expression.slice(0, -1);
                calculateResult(expression);
            } else if (value === 'ANS') {
                if (lastResult !== null) {
                    expression += lastResult;
                    calculateResult(expression);
                }
            } else if (value === '±') {
                if (expression && !isNaN(expression[expression.length - 1])) {
                    // Find the last number and toggle its sign
                    const match = expression.match(/([\d.]+)$/);
                    if (match) {
                        const lastNum = match[1];
                        const newNum = (-parseFloat(lastNum)).toString();
                        expression = expression.slice(0, -lastNum.length) + newNum;
                        calculateResult(expression);
                    }
                }
            } else {
                expression += value;
                calculateResult(expression);
            }
            
            updateDisplay();
        }

        function toggleMode() {
            isRadians = !isRadians;
            modeBadge.textContent = isRadians ? 'RAD' : 'DEG';
            modeBadge.className = isRadians ? 'mode-badge mode-rad' : 'mode-badge mode-deg';
            
            // Recalculate if there's an expression
            if (expression) {
                calculateResult(expression);
                updateDisplay();
            }
        }

        // Keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            
            if (key >= '0' && key <= '9') {
                handleClick(key);
            } else if (key === '.') {
                handleClick('.');
            } else if (key === '+') {
                handleClick('+');
            } else if (key === '-') {
                handleClick('-');
            } else if (key === '*') {
                handleClick('*');
            } else if (key === '/') {
                event.preventDefault();
                handleClick('/');
            } else if (key === 'Enter' || key === '=') {
                event.preventDefault();
                handleClick('=');
            } else if (key === 'Escape') {
                handleClick('C');
            } else if (key === 'Backspace') {
                event.preventDefault();
                handleClick('DEL');
            } else if (key === '(') {
                handleClick('(');
            } else if (key === ')') {
                handleClick(')');
            }
        });

        // Initialize display
        updateDisplay();