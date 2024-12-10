import React, { useState } from "react";
import { Select } from "antd";
import { buildSearchParams } from "./buildQueryParams";

const { Option } = Select;

interface FilterConfig {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  multiple?: boolean;
}

interface SearchFilterProps {
  filters: FilterConfig[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalParams?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange: (params: Record<string, any>) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  filters,
  additionalParams = {},
  onFilterChange,
}) => {
  const [searchTerms, setSearchTerms] = useState<
    { Name: string; Value: string | string[] }[]
  >([]);

  const handleChange = (value: string | string[], name: string) => {
    const updatedTerms = [...searchTerms];
    const existingIndex = updatedTerms.findIndex((term) => term.Name === name);

    if (existingIndex > -1) {
      updatedTerms[existingIndex].Value = value;
    } else {
      updatedTerms.push({ Name: name, Value: value });
    }

    setSearchTerms(updatedTerms);

    const formattedTerms = updatedTerms.map((term) => ({
      Name: term.Name,
      Value: Array.isArray(term.Value) ? term.Value.join(",") : term.Value,
    }));

    const params = buildSearchParams(formattedTerms, additionalParams);
    onFilterChange(params);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      {filters.map((filter) => (
        <Select
          key={filter.name}
          style={{ width: 200, marginRight: 10 }}
          placeholder={filter.label}
          mode={filter.multiple ? "multiple" : undefined}
          onChange={(value) => handleChange(value, filter.name)}
        >
          {filter.options.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      ))}
    </div>
  );
};

export default SearchFilter;
