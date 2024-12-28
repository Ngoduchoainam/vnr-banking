"use client";

import React, { createContext, useState, useContext } from "react";

interface Transaction {
    name: string;
    age: number;
    role: string;
}

interface TransactionContextType {
    transaction: Transaction | null;
    setTransaction: React.Dispatch<React.SetStateAction<Transaction | null>>;
}

const defaultValue: TransactionContextType = {
    transaction: null,
    setTransaction: () => { },
};

const TransactionContext = createContext<TransactionContextType>(defaultValue);

export const TransactionProvider = ({ children }) => {
    const [transaction, setTransaction] = useState(null);

    return (
        <TransactionContext.Provider value={{ transaction, setTransaction }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useUser = () => useContext(TransactionContext);
