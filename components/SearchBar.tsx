"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
};

export function SearchBar({
  placeholder = "Search products across all vendors...",
  className = ""
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/products?search=${encodeURIComponent(value)}` : "/products");
  }

  return (
    <form className={`search-bar ${className}`} role="search" onSubmit={submit}>
      <span className="sr-only">Search products</span>
      <Search aria-hidden="true" size={30} strokeWidth={2.6} />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
      />
      <button className="sr-only" type="submit">Search</button>
    </form>
  );
}
