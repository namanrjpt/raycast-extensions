import { environment, LaunchType, showToast, Toast, updateCommandMetadata } from "@raycast/api";
import quotes from "./quotes.json";

interface Quote {
  text: string;
  author: string;
}

interface QuotesJSON {
  quotes: Quote[];
}

export default async function Command() {
  const quotesData: QuotesJSON = quotes;

  const randomIndex = Math.floor(Math.random() * quotesData.quotes.length);
  const randomQuote = quotesData.quotes[randomIndex];

  updateCommandMetadata({
    subtitle: `${randomQuote.text} - ${randomQuote.author}`,
  });

  if (environment.launchType === LaunchType.UserInitiated) {
    await showToast({
      style: Toast.Style.Success,
      title: "Refreshed Quote",
      message: `"${randomQuote.text}" - ${randomQuote.author}`,
    });
  }
}
