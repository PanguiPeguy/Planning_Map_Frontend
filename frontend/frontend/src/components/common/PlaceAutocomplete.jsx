"use client";

import { useState, useEffect, useRef } from "react";
import { placesService } from "@/src/services/placesService";
import { MapPin } from "lucide-react";

export default function PlaceAutocomplete({ label, value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await placesService.searchPlaces(query);
        setSuggestions(response.data || []);
        setIsOpen(true);
      } catch (error) {
        console.error("Erreur autocomplete:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 500); // Debounce 500ms
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (place) => {
    setQuery(place.name);
    setIsOpen(false);
    if (onSelect) {
      onSelect(place);
    }
    if (onChange) {
      onChange(place.name);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          placeholder="Rechercher un lieu..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
        />
        <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
        {loading && (
          <div className="absolute right-3 top-3.5 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((place) => (
            <li
              key={place.id}
              onClick={() => handleSelect(place)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 flex items-start gap-3 transition-colors"
            >
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="block font-medium text-gray-800 text-sm">
                  {place.name.split(",")[0]}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {place.address?.city || place.address?.town || place.address?.village}, {place.address?.country}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
