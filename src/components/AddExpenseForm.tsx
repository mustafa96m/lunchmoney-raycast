import { useCallback, useState, useEffect } from "react";
import { Form, Action, ActionPanel, useNavigation } from "@raycast/api";
import { Transaction, Preferences, Category } from "../types";
import { fetchCategories } from "../api";
import { getPreferenceValues } from "@raycast/api";

const VALID_CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "IQD", name: "Iraqi Dinar" },
];

interface AddExpenseFormProps {
  defaultTitle?: string;
  onCreate: (transaction: Omit<Transaction, "id" | "status">) => void;
  defaultCurrency: string;
}

export default function AddExpenseForm(props: AddExpenseFormProps) {
  const preferences = getPreferenceValues<Preferences>();
  const { pop } = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    loadCategories();
  }, []);

  const handleSubmit = useCallback(
    (values: { payee: string; amount: string; category_id: string; date: string; notes?: string; currency: string; to_base: number }) => {
      const newTransaction: Omit<Transaction, "id" | "status"> = {
        payee: values.payee,
        amount: parseFloat(values.amount),
        to_base: values.to_base,
        category_id: parseInt(values.category_id),
        date: values.date,
        notes: values.notes,
        currency: (values.currency || props.defaultCurrency).toLowerCase(), // Ensure uppercase
      };

      props.onCreate(newTransaction);
      pop();
    },
    [props]
  );

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Expense" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="payee"
        title="Payee"
        placeholder="Enter payee name"
        defaultValue={props.defaultTitle}
      />
      <Form.TextField id="amount" title="Amount" placeholder="Enter amount"/>
      <Form.Dropdown id="category_id" title="Category" storeValue>
        <Form.Dropdown.Item title="Select Category" value="" />
        {categories.map((category) => (
          <Form.Dropdown.Item key={category.id} title={category.name} value={`${category.id}`} />
        ))}
      </Form.Dropdown>
      <Form.DatePicker id="date" title="Date" defaultValue={new Date()} />
      <Form.TextArea id="notes" title="Notes" placeholder="Optional notes" />
      <Form.Dropdown id="currency" title="Currency" defaultValue={props.defaultCurrency.toUpperCase()}>
        {VALID_CURRENCIES.map((currency) => (
          <Form.Dropdown.Item key={currency.code} title={currency.name} value={currency.code} />
        ))}
      </Form.Dropdown>
    </Form>
  );
}