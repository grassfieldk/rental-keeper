"use client";

import { useState } from "react";

export default function Home() {
  const [result, setResult] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("Enter a URL to scrape.");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatusMessage("Fetching data...");

    const formData = new FormData(e.currentTarget);
    const url = formData.get("url");
    try {
      const response = await fetch(`/api/scrape?url=${url}`);
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      setStatusMessage("Data fetched successfully.");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to fetch. Please check the URL and try again.");
      setResult("Failed to fetch. Please check the URL and try again.");
    }
  };

  return (
    <div>
      <div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="url"
            name="url"
            placeholder="Enter URL to scrape"
            required
            className="w-full"
          />
          <button type="submit" className="w-[8em]">
            Scrape
          </button>
        </form>
      </div>
      <pre className="text-sky-600">{statusMessage}</pre>
      <pre>{result}</pre>
    </div>
  );
}
