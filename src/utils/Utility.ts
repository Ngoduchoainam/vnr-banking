import dayjs from "dayjs";

export class Utility {

    //Hàm trả về giá trị đầu cuối khi người dùng pick ngày
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
}