import { Transaction } from "../models/transaction";
import { load, save } from "../storage/storage";


export function getTransactions(month: string): Transaction[] {
    return load<Transaction[]>(getTransactionKey(month), []);
}

export function addTransaction(amount: number, categoryId: string, note: string, date: string): void {
    const month = date.substring(0, 7);
    const transactions = getTransactions(month);

    const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        amount,
        categoryId,
        note,
        date
    };

    transactions.push(newTransaction);

    save(getTransactionKey(month),transactions);
}

export function deleteTransaction(id: string, month: string): void {
    const transactions = getTransactions(month);

    const updated = transactions.filter(transaction => transaction.id !== id);

    save(getTransactionKey(month), updated);
}

function getTransactionKey(month: string): string {
    return `transactions_${month}`;
}