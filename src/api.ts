import axios from "axios";
import { getPreferenceValues } from "@raycast/api";
import { Transaction, Category, RecurringTransaction, Preferences } from "./types"; // Ensure Preferences is imported

const preferences = getPreferenceValues<Preferences>();

const BASE_URL = "https://dev.lunchmoney.app/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${preferences.LUNCH_MONEY_API_KEY}`,
  },
});

export async function fetchTransactions(defaultCurrency: string = "USD"): Promise<Transaction[]> {
  try {
    const response = await api.get("/transactions", {
      params: {
        currency: defaultCurrency.toLowerCase(), // Pass uppercase currency if API supports
      },
    });
    // Parse amount as number and ensure currency is uppercase
    const transactions: Transaction[] = response.data.transactions.map((txn: any) => ({
      ...txn,
      amount: Number(txn.amount),
      to_base: Number(txn.to_base),
      currency: txn.currency.toLowerCase(), // Ensure uppercase
    }));
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}

export async function fetchRecurrings(defaultCurrency: string = "USD"): Promise<RecurringTransaction[]> {
  try {
    const response = await api.get("/recurring_expenses", {
      params: {
        currency: defaultCurrency.toUpperCase(), // Pass uppercase currency if API supports
      },
    });
    if (response.data && Array.isArray(response.data.recurring_expenses)) {
      // Parse amount as number and ensure currency is uppercase
      const recurrings: RecurringTransaction[] = response.data.recurring_expenses.map((rec: any) => ({
        ...rec,
        amount: Number(rec.amount),
        currency: rec.currency.toUpperCase(), // Ensure uppercase
      }));
      return recurrings;
    } else {
      throw new Error("Invalid response from API");
    }
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
    throw error;
  }
}

export async function createTransaction(
  transaction: Omit<Transaction, "id" | "status">,
  defaultCurrency: string = "USD"
): Promise<Transaction> {
  try {
    const payload = {
      transactions: [
        {
          date: transaction.date,
          amount: transaction.amount,
          category_id: transaction.category_id,
          payee: transaction.payee,
          currency: transaction.currency, // Ensure uppercase
          notes: transaction.notes,
        },
      ],
    };

    const response = await api.post("/transactions", payload);
    console.log("Full API Response:", JSON.stringify(response.data, null, 2));

    if (response.data.error) {
      throw new Error(JSON.stringify(response.data.error));
    }

    if (!response.data || !Array.isArray(response.data.ids) || response.data.ids.length === 0) {
      throw new Error("Invalid response from API");
    }

    const createdId = response.data.ids[0];
    return {
      ...transaction,
      id: createdId,
      status: "uncleared",
      to_base: transaction.amount, // safe assumtion
      currency: transaction.currency.toUpperCase(), // Ensure uppercase
    } as Transaction;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
export async function updateTransaction(id: number, updates: Partial<Omit<Transaction, 'id' | 'status'>>): Promise<Transaction> {
  try {
    const response = await api.put(`/transactions/${id}`, updates);
    if (response.data && response.data.transaction) {
      return response.data.transaction;
    } else {
      throw new Error('Invalid response from API');
    }
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await api.get("/categories");
    if (response.data && Array.isArray(response.data.categories)) {
      return response.data.categories;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    throw new Error('Invalid response from API');
  }
}

