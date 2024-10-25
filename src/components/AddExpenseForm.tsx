import { useCallback, useState, useEffect } from "react";
import { Form, Action, ActionPanel } from "@raycast/api";
import { Transaction, Preferences, Category, Asset } from "../types";
import { fetchCategories, fetchAssets } from "../api";
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
  isLoading: boolean;
  initialPayee?: string;
  initialAmount?: string;
  initialDate?: string;
}

export default function AddExpenseForm(props: AddExpenseFormProps) {
  const preferences = getPreferenceValues<Preferences>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedCategories, fetchedAssets] = await Promise.all([
          fetchCategories(),
          fetchAssets(),
        ]);
        setCategories(fetchedCategories);
        setAssets(fetchedAssets);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    loadData();
  }, []);

  const handleSubmit = useCallback(
    (values: {
      payee: string;
      amount: string;
      category_id: string;
      date: string;
      notes?: string;
      currency: string;
      asset_id: string;
    }) => {
      const newTransaction: Omit<Transaction, "id" | "status"> = {
        payee: values.payee,
        amount: parseFloat(values.amount),
        to_base: 1, // You might want to calculate this based on the selected currency
        category_id: parseInt(values.category_id),
        date: values.date,
        notes: values.notes,
        currency: (values.currency || props.defaultCurrency).toLowerCase(),
        asset_id: parseInt(values.asset_id),
        is_income: false, // Set this for expense
        debit_as_negative: false, // Ensure this is false for expenses
      };

      props.onCreate(newTransaction);
    },
    [props.onCreate, props.defaultCurrency],
  );

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add Expense" onSubmit={handleSubmit} />
        </ActionPanel>
      }
      isLoading={props.isLoading}
    >
      <Form.TextField
        id="payee"
        title="Payee"
        placeholder="Enter payee name"
        defaultValue={props.initialPayee || props.defaultTitle}
      />
      <Form.TextField
        id="amount"
        title="Amount"
        placeholder="Enter amount"
        defaultValue={props.initialAmount}
      />
      <Form.Dropdown id="category_id" title="Category" storeValue>
        <Form.Dropdown.Item title="Select Category" value="" />
        {categories.map((category) => (
          <Form.Dropdown.Item
            key={category.id}
            title={category.name}
            value={`${category.id}`}
          />
        ))}
      </Form.Dropdown>
      <Form.DatePicker
        id="date"
        title="Date"
        defaultValue={props.initialDate ? new Date(props.initialDate) : new Date()}
      />
      <Form.TextArea id="notes" title="Notes" placeholder="Optional notes" />
      <Form.Dropdown id="asset_id" title="Asset" storeValue>
        <Form.Dropdown.Item title="Select Asset" value="" />
        {assets.map((asset) => (
          <Form.Dropdown.Item
            key={asset.id}
            title={`${asset.name} (${asset.currency})`}
            value={`${asset.id}`}
          />
        ))}
      </Form.Dropdown>
      <Form.Dropdown
        id="currency"
        title="Currency"
        defaultValue={props.defaultCurrency.toUpperCase()}
      >
        {VALID_CURRENCIES.map((currency) => (
          <Form.Dropdown.Item
            key={currency.code}
            title={currency.name}
            value={currency.code}
          />
        ))}
      </Form.Dropdown>
    </Form>
  );
}
