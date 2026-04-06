import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import type { FluidOption } from "../types";

type Props = {
  title: string;
  options: FluidOption[];
  selectedFluid: FluidOption | null;
  onSelect: (item: FluidOption) => void;
};

export function FluidSelector({
  title,
  options,
  selectedFluid,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    if (!q) return options;

    return options.filter((item) =>
      item.label.toLowerCase().includes(q)
    );
  }, [options, searchText]);

  return (
    <div className="fluid-selector" ref={wrapperRef}>
      <div className="fluid-card">
        <div className="fluid-title">{title}</div>

        <div className="fluid-bottom-row">
          <span className="fluid-selected-text">
            {selectedFluid ? selectedFluid.label : ""}
          </span>

          <button
            type="button"
            className="fluid-arrow-btn"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fluid-dropdown">
          <div className="fluid-search-row">
            <input
              className="fluid-search-input"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder=""
            />
            <Search size={22} className="fluid-search-icon" />
          </div>

          <div className="fluid-options">
            {filteredOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                className="fluid-option"
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                  setSearchText("");
                }}
              >
                <span className="fluid-option-box" />
                <span>{item.label}</span>
              </button>
            ))}

            {filteredOptions.length === 0 && (
              <div className="fluid-empty">Sonuç bulunamadı</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}