// Financial Simulator Module
class FinancialSimulator {
    constructor() {
        this.initializeState();
        this.initializeElements();
        this.initializeCharts();
        this.setupEventListeners();
    }

    initializeState() {
        this.state = {
            income: 30000,
            expenses: {
                housing: 10000,
                food: 5000,
                transportation: 3000,
                utilities: 2000,
                other: 2000
            },
            investments: {
                type: 'moderate',
                returns: {
                    conservative: 0.06,
                    moderate: 0.10,
                    aggressive: 0.14
                }
            }
        };
    }

    initializeElements() {
        // Input elements
        this.incomeSlider = document.getElementById('incomeSlider');
        this.incomeDisplay = document.getElementById('incomeDisplay');
        this.expenseInputs = {
            housing: document.getElementById('housingExpense'),
            food: document.getElementById('foodExpense'),
            transportation: document.getElementById('transportationExpense'),
            utilities: document.getElementById('utilitiesExpense'),
            other: document.getElementById('otherExpense')
        };
        this.investmentSelect = document.getElementById('investmentType');
        
        // Output elements
        this.summaryMonthlySavings = document.getElementById('summaryMonthlySavings');
        this.summaryYearEnd = document.getElementById('summaryYearEnd');
        this.aiTips = document.getElementById('aiTips');

        // Initialize displays
        this.updateDisplays();
    }

    initializeCharts() {
        // Expense Chart
        const expenseCtx = document.getElementById('expenseChart');
        if (expenseCtx) {
            this.expenseChart = new Chart(expenseCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Housing', 'Food', 'Transportation', 'Utilities', 'Other'],
                    datasets: [{
                        data: Object.values(this.state.expenses),
                        backgroundColor: [
                            '#4DB6AC',
                            '#81C784',
                            '#64B5F6',
                            '#9575CD',
                            '#F06292'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });
        }

        // Savings Chart
        const savingsCtx = document.getElementById('savingsChart');
        if (savingsCtx) {
            this.savingsChart = new Chart(savingsCtx, {
                type: 'line',
                data: {
                    labels: Array.from({length: 12}, (_, i) => `Month ${i + 1}`),
                    datasets: [{
                        label: 'Projected Savings',
                        data: this.calculateSavingsProjection(),
                        borderColor: '#26A69A',
                        backgroundColor: 'rgba(38, 166, 154, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: value => '₹' + value.toLocaleString('en-IN')
                            }
                        }
                    }
                }
            });
        }
    }

    setupEventListeners() {
        // Income slider
        this.incomeSlider.addEventListener('input', (e) => {
            this.state.income = parseInt(e.target.value);
            this.updateSimulation();
        });

        // Expense inputs
        Object.entries(this.expenseInputs).forEach(([category, input]) => {
            input.addEventListener('input', (e) => {
                const value = parseInt(e.target.value) || 0;
                this.state.expenses[category] = value;
                this.updateSimulation();
            });
        });

        // Investment type
        this.investmentSelect.addEventListener('change', (e) => {
            this.state.investments.type = e.target.value;
            this.updateSimulation();
        });

        // Reset button
        const resetBtn = document.getElementById('resetSimulator');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSimulation());
        }
    }

    updateSimulation() {
        this.updateCharts();
        this.updateDisplays();
        this.generateTips();
    }

    updateCharts() {
        // Update expense chart
        if (this.expenseChart) {
            this.expenseChart.data.datasets[0].data = Object.values(this.state.expenses);
            this.expenseChart.update();
        }

        // Update savings chart
        if (this.savingsChart) {
            this.savingsChart.data.datasets[0].data = this.calculateSavingsProjection();
            this.savingsChart.update();
        }
    }

    updateDisplays() {
        // Update income display
        if (this.incomeDisplay) {
            this.incomeDisplay.textContent = this.formatCurrency(this.state.income);
        }

        // Calculate totals
        const totalExpenses = Object.values(this.state.expenses).reduce((a, b) => a + b, 0);
        const monthlySavings = this.state.income - totalExpenses;
        const yearEndSavings = this.calculateSavingsProjection()[11];

        // Update summary displays
        this.summaryMonthlySavings.textContent = this.formatCurrency(monthlySavings);
        this.summaryYearEnd.textContent = this.formatCurrency(yearEndSavings);
    }

    calculateSavingsProjection() {
        const monthlyIncome = this.state.income;
        const monthlyExpenses = Object.values(this.state.expenses).reduce((a, b) => a + b, 0);
        const monthlySavings = monthlyIncome - monthlyExpenses;
        const annualReturn = this.state.investments.returns[this.state.investments.type];
        const monthlyReturn = annualReturn / 12;

        let projection = [];
        let balance = 0;

        for (let i = 0; i < 12; i++) {
            balance = balance * (1 + monthlyReturn) + monthlySavings;
            projection.push(Math.round(balance));
        }

        return projection;
    }

    generateTips() {
        const totalExpenses = Object.values(this.state.expenses).reduce((a, b) => a + b, 0);
        const monthlySavings = this.state.income - totalExpenses;
        const savingsRate = monthlySavings / this.state.income;

        let tips = [];

        // Savings rate tips
        if (savingsRate < 0) {
            tips.push("⚠️ Your expenses exceed your income. Consider reducing non-essential expenses.");
        } else if (savingsRate < 0.2) {
            tips.push("Try to save at least 20% of your income. Look for areas to reduce expenses.");
        } else if (savingsRate >= 0.2) {
            tips.push("Great job! You're saving more than 20% of your income. Consider investing for long-term growth.");
        }

        // Expense-specific tips
        const housingRatio = this.state.expenses.housing / this.state.income;
        if (housingRatio > 0.3) {
            tips.push("Your housing costs are above 30% of income. Consider more affordable options if possible.");
        }

        // Investment tips
        if (monthlySavings > 10000 && this.state.investments.type === 'conservative') {
            tips.push("With your good savings, you might consider a more growth-oriented investment strategy.");
        }

        this.aiTips.innerHTML = tips.join('<br><br>');
    }

    resetSimulation() {
        this.initializeState();
        
        // Reset input values
        this.incomeSlider.value = this.state.income;
        Object.entries(this.expenseInputs).forEach(([category, input]) => {
            input.value = this.state.expenses[category];
        });
        this.investmentSelect.value = this.state.investments.type;

        this.updateSimulation();
    }

    formatCurrency(amount) {
        return amount.toLocaleString('en-IN');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FinancialSimulator();
});
