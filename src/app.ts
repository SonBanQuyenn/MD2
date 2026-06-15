import {
    renderCategories,
    setupCategoryForm,
    populateCategoryDropdown,
    renderTransactions,
    setupTransactionForm,
    renderDashboard,
    renderMonthlySummary
} from "./ui/ui";

import { Category } from "./models/category";

function initSampleData(): void {
    let categories = JSON.parse(localStorage.getItem("categories") || "[]");
    
    if (categories.length === 0) {
        const sampleCategories = [
            { id: crypto.randomUUID(), name: "Thu nhập", limit: 0 },
            { id: crypto.randomUUID(), name: "Ăn uống", limit: 3000000 },
            { id: crypto.randomUUID(), name: "Di chuyển", limit: 1000000 },
            { id: crypto.randomUUID(), name: "Mua sắm", limit: 2000000 },
            { id: crypto.randomUUID(), name: "Giải trí", limit: 1000000 },
            { id: crypto.randomUUID(), name: "Hóa đơn", limit: 1500000 }
        ];
        localStorage.setItem("categories", JSON.stringify(sampleCategories));
        categories = sampleCategories;
    }

    const currentMonth = new Date().toISOString().substring(0, 7);
    const transactionKey = `transactions_${currentMonth}`;
    const existingTransactions = JSON.parse(localStorage.getItem(transactionKey) || "[]");
    
    if (existingTransactions.length === 0) {
        const today = new Date().toISOString().split("T")[0];
        
        const incomeCategory = categories.find((cat: Category) => cat.name === "Thu nhập");
        const eatCategory = categories.find((cat: Category) => cat.name === "Ăn uống");
        const transportCategory = categories.find((cat: Category) => cat.name === "Di chuyển");
        const shoppingCategory = categories.find((cat: Category) => cat.name === "Mua sắm");
        const entertainmentCategory = categories.find((cat: Category) => cat.name === "Giải trí");
        const billCategory = categories.find((cat: Category) => cat.name === "Hóa đơn");
        
        const sampleTransactions = [];
        if (incomeCategory) {
            sampleTransactions.push({
                id: crypto.randomUUID(),
                amount: 10000000,
                categoryId: incomeCategory.id,
                note: "Lương tháng",
                date: today
            });
        }
        
        if (eatCategory) {
            sampleTransactions.push({
                id: crypto.randomUUID(),
                amount: -200000,
                categoryId: eatCategory.id,
                note: "Ăn tối cùng bạn",
                date: today
            });
            sampleTransactions.push({
                id: crypto.randomUUID(),
                amount: -50000,
                categoryId: eatCategory.id,
                note: "Cà phê sáng",
                date: today
            });
        }
        
        if (transportCategory) {
            sampleTransactions.push({
                id: crypto.randomUUID(),
                amount: -100000,
                categoryId: transportCategory.id,
                note: "Đổ xăng",
                date: today
            });
        }
        
        if (shoppingCategory) {
            sampleTransactions.push({
                id: crypto.randomUUID(),
                amount: -500000,
                categoryId: shoppingCategory.id,
                note: "Mua quần áo",
                date: today
            });
        }
        
        if (entertainmentCategory) {
            sampleTransactions.push({
                id: crypto.randomUUID(),
                amount: -150000,
                categoryId: entertainmentCategory.id,
                note: "Xem phim",
                date: today
            });
        }
        
        if (billCategory) {
            sampleTransactions.push({
                id: crypto.randomUUID(),
                amount: -300000,
                categoryId: billCategory.id,
                note: "Tiền điện",
                date: today
            });
        }
        
        localStorage.setItem(transactionKey, JSON.stringify(sampleTransactions));
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const monthPicker = document.getElementById("month-picker") as HTMLInputElement;
    if (monthPicker) {
        monthPicker.value = new Date().toISOString().substring(0, 7);
    }
    initSampleData();
    
    renderCategories();
    populateCategoryDropdown();
    setupCategoryForm();
    renderTransactions();
    setupTransactionForm();
    renderDashboard();
    renderMonthlySummary();

    if (monthPicker) {
        monthPicker.addEventListener("change", () => {
            renderTransactions();
            renderDashboard();
            renderCategories();
            renderMonthlySummary();
        });
    }
});