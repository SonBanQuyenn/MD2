import {
    addCategory,
    getCategories,
    deleteCategory,
    updateCategory
} from "../services/CategoryService";

import {
    addTransaction,
    getTransactions,
    deleteTransaction
} from "../services/TransactionService";

export function renderCategories(): void {
    const container = document.getElementById("category-list");
    if (!container) return;

    container.innerHTML = "";

    const categories = getCategories();
    const currentMonth = getSelectedMonth();
    const transactions = getTransactions(currentMonth);

    categories.forEach(category => {
        const row = document.createElement("div");
        row.className = "category-row";

        const spent = transactions
            .filter(transaction => transaction.categoryId === category.id && transaction.amount < 0)
            .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);

        const exceeded = spent > category.limit;

        const spentClass = spent > 0 ? "expense" : "";
        row.innerHTML = `
            <div>
                <strong>${category.name}</strong>
                <br>
                Limit: ${category.limit.toLocaleString()}đ
                <br>
                Spent: <span class="${spentClass}">${spent.toLocaleString()}đ</span>
                ${exceeded ? `<div class="alert"> Exceeded!</div>` : ""}
            </div>
            <div>
                <button class="edit-btn" data-id="${category.id}">Edit</button>
                <button class="delete-btn" data-id="${category.id}">Delete</button>
            </div>
        `;

        container.appendChild(row);
    });

    setupDeleteButtons();
    setupEditButtons();
}

export function setupCategoryForm(): void {
    const button = document.getElementById("add-category-btn");
    if (!button) return;

    button.addEventListener("click", () => {
        const nameInput = document.getElementById("category-name") as HTMLInputElement;
        const limitInput = document.getElementById("category-limit") as HTMLInputElement;

        const name = nameInput.value.trim();
        const limit = Number(limitInput.value);

        if (!name) {
            alert("Vui lòng nhập tên danh mục");
            return;
        }

        const existingCategories = getCategories();
        const isDuplicate = existingCategories.some(c => c.name.toLowerCase() === name.toLowerCase());
        if (isDuplicate) {
            alert("Danh mục này đã tồn tại!");
            return;
        }

        if (isNaN(limit) || limit <= 0) {
            alert("Vui lòng nhập hạn mức hợp lệ (số dương)");
            return;
        }

        addCategory(name, limit);
        renderCategories();
        populateCategoryDropdown();
        renderBudgetProgress();

        nameInput.value = "";
        limitInput.value = "";
    });
}

function setupDeleteButtons(): void {
        const buttons = document.querySelectorAll(".delete-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id");
            if (!id) return;

            const currentMonth = getSelectedMonth();
            const transactions = getTransactions(currentMonth);
            const hasTransactions = transactions.some(t => t.categoryId === id);

            if (hasTransactions) {
                alert("Không thể xóa danh mục đang có giao dịch!");
                return;
            }

            deleteCategory(id);
            renderCategories();
            populateCategoryDropdown();
            renderBudgetProgress();
        });
    });
}

function setupEditButtons(): void {
    const buttons = document.querySelectorAll(".edit-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id");
            if (!id) return;

            const categories = getCategories();
            const category = categories.find(c => c.id === id);
            if (!category) return;

            const newName = prompt("Category Name", category.name);
            if (!newName) return;

            const newLimit = prompt("Limit", category.limit.toString());
            if (!newLimit) return;

            updateCategory(id, newName, Number(newLimit));
            renderCategories();
            populateCategoryDropdown();
            renderBudgetProgress();
        });
    });
}

export function populateCategoryDropdown(): void {
    const select = document.getElementById("category-select") as HTMLSelectElement;
    if (!select) return;

    select.innerHTML = '<option value="">Select Category</option>';

    const categories = getCategories();
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

export function renderTransactions(): void {
    const container = document.getElementById("transaction-list");
    if (!container) return;

    container.innerHTML = "";

    const transactions = getTransactions(getSelectedMonth());

    const sortedTransactions = [...transactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const categories = getCategories();

    sortedTransactions.forEach(transaction => {
        const row = document.createElement("div");
        row.className = "transaction-row";

        const category = categories.find(c => c.id === transaction.categoryId);
        const categoryName = category ? category.name : "Unknown";
        const amountClass = transaction.amount > 0 ? "income" : "expense";
        const displayAmount = `${Math.abs(transaction.amount).toLocaleString()}đ`;

        row.innerHTML = `
            <div>
                <strong class="${amountClass}">${displayAmount}</strong>
                <br>
                Category: ${categoryName}
                <br>
                Note: ${transaction.note || "-"}
                <br>
                Date: ${transaction.date}
            </div>
            <div>
                <button class="delete-transaction-btn" data-id="${transaction.id}">Delete</button>
            </div>
        `;

        container.appendChild(row);
    });

    if (sortedTransactions.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 20px;">No transactions yet</div>';
    }

    setupDeleteTransactionButtons();
}

export function setupTransactionForm(): void {
    const button = document.getElementById("add-transaction-btn");
    if (!button) return;

    button.addEventListener("click", () => {
        const amountInput = document.getElementById("amount") as HTMLInputElement;
        const categorySelect = document.getElementById("category-select") as HTMLSelectElement;
        const noteInput = document.getElementById("note") as HTMLInputElement;
        const dateInput = document.getElementById("date") as HTMLInputElement;

        const typeRadio = document.querySelector('input[name="transaction-type"]:checked') as HTMLInputElement;
        const isIncome = typeRadio?.value === "income";
        let amount = Number(amountInput.value);
        const categoryId = categorySelect.value;
        const note = noteInput.value.trim();
        const date = dateInput.value;

        if (!isIncome && amount > 0) {
            amount = -amount;
        }

        if (isNaN(amount) || amount === 0) {
            alert("Please enter a valid amount (non-zero)");
            return;
        }

        if (!categoryId) {
            alert("Please select a category");
            return;
        }

        if (!date) {
            alert("Please select a date");
            return;
        }

        addTransaction(amount, categoryId, note, date);

        amountInput.value = "";
        noteInput.value = "";
        dateInput.value = "";

        renderTransactions();
        renderDashboard();
        renderCategories();
    });
}

function setupDeleteTransactionButtons(): void {
    const buttons = document.querySelectorAll(".delete-transaction-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const id = button.getAttribute("data-id");
            if (!id) return;

            const currentMonth = getSelectedMonth();
            deleteTransaction(id, currentMonth);

            renderTransactions();
            renderDashboard();
            renderCategories();
        });
    });
}

export function renderDashboard(): void {
    const transactions = getTransactions(getSelectedMonth());

    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {
        if (transaction.amount > 0) {
            income += transaction.amount;
        } else {
            expense += Math.abs(transaction.amount);
        }
    });

    const balance = income - expense;

    const incomeElement = document.getElementById("income");
    const expenseElement = document.getElementById("expense");
    const balanceElement = document.getElementById("balance");

    if (incomeElement) incomeElement.textContent = income.toLocaleString() + "đ";
    if (expenseElement) expenseElement.textContent = expense.toLocaleString() + "đ";
    if (balanceElement) {
        balanceElement.textContent = balance.toLocaleString() + "đ";
        balanceElement.className = balance >= 0 ? "income" : "expense";
    }

    renderBudgetProgress();
}

export function renderBudgetProgress(): void {
    const categories = getCategories();
    const transactions = getTransactions(getSelectedMonth());

    const totalBudget = categories.reduce((sum, cat) => sum + cat.limit, 0);
    const totalSpent = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const percent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const progressFill = document.getElementById("progress-bar-fill");
    const spentAmountEl = document.getElementById("spent-amount");
    const totalBudgetEl = document.getElementById("total-budget");
    const budgetPercentEl = document.getElementById("budget-percent");
    const budgetMessageEl = document.getElementById("budget-message");

    if (progressFill) {
        const width = Math.min(percent, 100);
        progressFill.style.width = `${width}%`;

        if (percent >= 100) {
            progressFill.classList.add("exceeded");
        } else {
            progressFill.classList.remove("exceeded");
        }
    }

    if (spentAmountEl) spentAmountEl.textContent = totalSpent.toLocaleString() + "đ";
    if (totalBudgetEl) totalBudgetEl.textContent = totalBudget.toLocaleString() + "đ";
    if (budgetPercentEl) budgetPercentEl.textContent = percent.toFixed(1);

    if (budgetMessageEl) {
        if (percent >= 100) {
            budgetMessageEl.innerHTML = '<span class="expense"> Bạn đã vượt tổng ngân sách!</span>';
        } else if (percent >= 80) {
            budgetMessageEl.innerHTML = '<span style="color: orange;"> Bạn đã dùng gần hết ngân sách!</span>';
        } else {
            budgetMessageEl.innerHTML = '<span class="income"> Ngân sách vẫn ổn</span>';
        }
    }
}

export function renderMonthlySummary(): void {
    const tbody = document.getElementById("summary-table-body");
    if (!tbody) return;

    const months = getAllMonthsWithData();
    months.sort().reverse();

    tbody.innerHTML = "";

    for (const month of months) {
        const transactions = getTransactions(month);

        let income = 0;
        let expense = 0;

        transactions.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            } else {
                expense += Math.abs(transaction.amount);
            }
        });

        const balance = income - expense;
        const [year, monthNum] = month.split("-");
        const displayMonth = `Tháng ${parseInt(monthNum)}/${year}`;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${displayMonth}</td>
            <td class="income">${income.toLocaleString()}đ</td>
            <td class="expense">${expense.toLocaleString()}đ</td>
            <td>${balance.toLocaleString()}đ</td>
        `;
        tbody.appendChild(row);
    }

    if (months.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="4" style="text-align: center;">Chưa có dữ liệu</td>`;
        tbody.appendChild(row);
    }
}

function getAllMonthsWithData(): string[] {
    const months: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("transactions_")) {
            const month = key.replace("transactions_", "");
            months.push(month);
        }
    }

    return months;
}

export function getSelectedMonth(): string {
    const picker = document.getElementById("month-picker") as HTMLInputElement;
    return picker ? picker.value : "";
}