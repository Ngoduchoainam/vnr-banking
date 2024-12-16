import React, { useState } from "react";
import { Select } from "antd";

interface CustomSelectProps {
    mode?: "multiple" | "tags"; // Hỗ trợ các chế độ như multiple hoặc tags
    [key: string]: any; // Cho phép nhận các props khác của Select
}

const CustomSelect: React.FC<CustomSelectProps> = ({ mode, ...props }) => {
    const [values, setValues] = useState<any[]>([]);

    const handleChange = (value: any[]) => {
        setValues(value);
        if (props.onChange) {
            props.onChange(value); // Gọi callback nếu được truyền vào
        }
    };

    return (
        <Select
            {...props}
            mode={mode}
            style={{
                ...props.style,
                height: mode === "multiple" && values.length === 0 ? "40px" : "auto", // Chiều cao động
            }}
            onChange={handleChange}
        />
    );
};

export default CustomSelect;
