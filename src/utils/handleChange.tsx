import { useState } from "react";
import { getTransaction } from "@/src/services/transaction";

export const useFilter = () => {
  const [searchTerms, setSearchTerms] = useState<
    { Name: string; Value: string | string[] }[]
  >([]);

  const handleChange = async (value: string | string[], name: string) => {
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

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const data = await getTransaction(1, 10, undefined, formattedTerms);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };

  return { searchTerms, handleChange };
};
