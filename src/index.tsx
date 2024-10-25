import { useEffect, useState } from "react";
import {
  ActionPanel,
  Icon,
  List,
  showToast,
  Toast,
  Color,
  Action,
  getPreferenceValues,
} from "@raycast/api";
import {
  Filter,
  Transaction,
  RecurringTransaction,
  Preferences,
} from "./types";
import AddExpenseAction from "./components/AddExpenseAction";
import AddIncomeAction from "./components/AddIncomeAction";
import { fetchTransactions, fetchRecurrings, createTransaction } from "./api";
import { getCurrencySymbol } from "./utils/currency";
import SMSMessages from "./components/SMSMessages"; // Import the new component

type State = {
  filter: Filter;
  isLoading: boolean;
  searchText: string;
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  todaysSpending: number;
  totalSpending: number;
  defaultCurrency: string;
};

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();

  const [state, setState] = useState<State>({
    filter: Filter.All,
    isLoading: true,
    searchText: "",
    transactions: [],
    recurringTransactions: [],
    todaysSpending: 0,
    totalSpending: 0,
    defaultCurrency: preferences.DEFAULT_CURRENCY?.toUpperCase() || "USD",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const [allTransactions, recurrings] = await Promise.all([
          fetchTransactions(state.defaultCurrency),
          fetchRecurrings(state.defaultCurrency),
        ]);

        const todaysSpending = allTransactions
          .filter((txn) => txn.date === today)
          .reduce((sum, txn) => sum + txn.to_base, 0);

        const totalSpending = allTransactions.reduce((sum, txn) => {
          const amount = txn.debit_as_negative ? -txn.to_base : txn.to_base;
          return sum + amount;
        }, 0);

        const latestTransactions = allTransactions
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .slice(0, 10);

        const sortedRecurrings = recurrings.sort((a, b) =>
          a.start_date < b.start_date ? -1 : 1,
        );

        setState((prev) => ({
          ...prev,
          isLoading: false,
          transactions: latestTransactions,
          recurringTransactions: sortedRecurrings,
          todaysSpending,
          totalSpending,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast({
          style: Toast.Style.Failure,
          title: "Error fetching data",
          message: (error as Error).message,
        });
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }

    fetchData();
  }, [state.defaultCurrency]);

  const handleCreate = async (
    transaction: Omit<Transaction, "id" | "status">,
  ) => {
    try {
      const newTransaction = await createTransaction(transaction);
      setState((prev) => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions],
        totalSpending: prev.totalSpending + newTransaction.to_base,
        isLoading: false,
      }));
      showToast({
        style: Toast.Style.Success,
        title: "Transaction Added",
        message: `Added ${newTransaction.payee} for ${newTransaction.to_base.toFixed(
          2,
        )} ${getCurrencySymbol(newTransaction.currency)}`,
      });
    } catch (error) {
      console.error("API Error:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Error Adding Transaction",
        message: (error as Error).message,
      });
    }
  };

  const filterTransactions = () => {
    if (state.filter === Filter.All) {
      return state.transactions;
    } else if (state.filter === Filter.Pending) {
      return state.transactions.filter((txn) => txn.status === "uncleared");
    } else if (state.filter === Filter.Cleared) {
      return state.transactions.filter((txn) => txn.status === "cleared");
    }
    return state.transactions;
  };

  return (
    <List
      isLoading={state.isLoading}
      searchBarPlaceholder="Search transactions..."
      onSearchTextChange={(text) =>
        setState((prev) => ({ ...prev, searchText: text }))
      }
      throttle
    >
      {/* Section: Total Spending */}
      <List.Section title="Total Spending">
        <List.Item
          title={`Total: ${state.totalSpending.toFixed(2)} ${getCurrencySymbol(state.defaultCurrency)}`}
          icon={{ source: Icon.Document, tintColor: Color.Blue }}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <AddExpenseAction onCreate={handleCreate} />
                <AddIncomeAction onCreate={handleCreate} />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      </List.Section>

      {/* Section: Today's Spending */}
      <List.Section title="Today's Spending">
        <List.Item
          title={`Today Spent: ${state.todaysSpending.toFixed(2)} ${getCurrencySymbol(state.defaultCurrency)}`}
          icon={{ source: Icon.Calendar, tintColor: Color.Blue }}
        />
      </List.Section>

      {/* Section: Latest Transactions */}
      <List.Section title="Latest Transactions">
        {filterTransactions().length > 0 ? (
          filterTransactions().map((transaction) => (
            <List.Item
              key={transaction.id}
              icon={
                transaction.is_income
                  ? { source: Icon.ChevronUp, tintColor: Color.Green }
                  : { source: Icon.ChevronDown, tintColor: Color.Red }
              }
              title={transaction.payee}
              subtitle={`${transaction.to_base.toFixed(2)} ${getCurrencySymbol(transaction.currency)}`}
              accessories={[{ text: formatDate(transaction.date) }]}
              actions={
                <ActionPanel>
                  <ActionPanel.Section>
                    <AddExpenseAction onCreate={handleCreate} />
                    <AddIncomeAction onCreate={handleCreate} />
                    {/* Open in Browser Action */}
                    <Action.OpenInBrowser
                      title="Open in Browser"
                      url={`https://my.lunchmoney.app/#/transactions/${transaction.id}`}
                      shortcut={{ modifiers: ["cmd"], key: "o" }}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          ))
        ) : (
          <List.Item
            title="No Latest Transactions"
            icon={{ source: Icon.Document, tintColor: Color.SecondaryText }}
          />
        )}
      </List.Section>

      {/* Section: Upcoming Recurring Transactions */}
      <List.Section title="Upcoming Recurring Transactions">
        {state.recurringTransactions.length > 0 ? (
          state.recurringTransactions.map((recurring) => (
            <List.Item
              key={recurring.id}
              icon={Icon.ArrowClockwise}
              title={recurring.payee || "Unnamed"}
              subtitle={`${recurring.amount.toFixed(2)} ${getCurrencySymbol(recurring.currency)}`}
              accessories={[
                { text: `Next: ${formatDate(recurring.start_date)}` },
              ]}
            />
          ))
        ) : (
          <List.Item
            title="No Upcoming Recurring Items"
            icon={{ source: Icon.Calendar, tintColor: Color.SecondaryText }}
          />
        )}
      </List.Section>

      {/* New Section: SMS Messages */}
      <List.Section title="SMS Messages">
        <List.Item
          title="View SMS Messages"
          icon={{ source: Icon.Message, tintColor: Color.Blue }}
          actions={
            <ActionPanel>
              <Action.Push
                title="Browse SMS Messages"
                target={<SMSMessages />}
              />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}

// Helper function to format dates
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return date.toLocaleDateString(); // Customize as needed
}
