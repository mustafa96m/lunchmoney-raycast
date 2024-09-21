export function getCurrencySymbol(currency = "USD"): string {
  const symbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
    CHF: "CHF",
    CNY: "¥",
    SEK: "kr",
    NZD: "NZ$",
    IQD: "ع.د", // Iraqi Dinar
    // Add more currencies as needed
  };

  return symbols[currency.toUpperCase()] || currency;
}
