import dayjs from "dayjs";

export class Utility {
    //Trả về giá trị đầu cuối khi người dùng pick ngày
    static ConvertDateTimeSameDay = (selectedDate?: string) => {
        if (!selectedDate) return { startOfDay: null, endOfDay: null };

        const date = dayjs(selectedDate);

        const startOfDay = date.startOf('day');
        const endOfDay = date.endOf('day');

        return {
            startOfDay: startOfDay.format('YYYY-MM-DD HH:mm:ss'),
            endOfDay: endOfDay.format('YYYY-MM-DD HH:mm:ss')
        };
    }

    //Tính toán bước nhảy biểu đồ
    static calculateStepSize = (maxValue) => {
        const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));

        if (maxValue < 10) {
            return 1; // Nếu maxValue quá nhỏ, đặt bước nhảy là 1
        }

        // Điều chỉnh tỷ lệ bước nhảy dựa trên giá trị maxValue
        if (maxValue < 100_000_000) {
            return magnitude / 2;
        } else if (maxValue < 500_000_000) {
            return magnitude / 1.5;
        } else {
            return magnitude;
        }
    };

    //Trả về giá trị lớn nhất của biểu đồ
    static calculateMax = (maxValue) => {
        const stepSize = Utility.calculateStepSize(maxValue);

        return Math.ceil((maxValue + maxValue / 10) / stepSize) * stepSize;
    };

    // Lấy giá trị lớn nhất từ các trường trong 1 mảng
    static GetMaxValueOfFields = (arr, listField) => {
        const maxValue = arr.reduce((max, item) => {
            const values = listField.map(field => Math.abs(item[field]) || 0);
            const maxInItem = Math.max(...values);

            return Math.max(max, maxInItem);
        }, 0);

        return maxValue;
    }
}