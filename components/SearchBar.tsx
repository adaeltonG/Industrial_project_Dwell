import { Search } from "lucide-react";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
};

export function SearchBar({
  placeholder = "Search products across all vendors...",
  className = ""
}: SearchBarProps) {
  return (
    <label className={`search-bar ${className}`}>
      <span className="sr-only">Search products</span>
      <Search aria-hidden="true" size={30} strokeWidth={2.6} />
      <input type="search" placeholder={placeholder} />
    </label>
  );
}
