import { Category } from "../models/category";
import { load, save } from "../storage/storage";

const CATEGORY_KEY = "categories";

export function getCategories(): Category[] {
    return load<Category[]>(CATEGORY_KEY, []);
}

export function addCategory(name: string, limit: number): void {
    const categories = getCategories();

    categories.push({id: crypto.randomUUID(), name, limit});

    save(CATEGORY_KEY, categories);
}

export function deleteCategory(id: string): void {
    const categories = getCategories();

    save(CATEGORY_KEY, categories.filter(c => c.id !== id));
}

export function updateCategory(id: string, name: string, limit: number): void {
    const categories = getCategories();

    const category = categories.find(c => c.id === id);

    if (!category) return;

    category.name = name;
    category.limit = limit;

    save(CATEGORY_KEY, categories);
}