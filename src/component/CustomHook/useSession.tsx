import Cookies from 'js-cookie';

import { auth } from "@/src/app/api/auth/[...nextauth]/config";

const CACHE_KEY_SESSION = "sessionCache";
const CACHE_DURATION = 10 * 60 * 1000;

export const SetSession = async () => {
    let session = null;

    let cachedSession = null;

    // Chỉ truy cập localStorage nếu chạy trong môi trường client
    if (typeof window !== "undefined") {
        const cache = Cookies.get(CACHE_KEY_SESSION);
        if (cache) {
            const parsedCache = JSON.parse(cache);
            if (Date.now() < parsedCache.expiresAt) {
                cachedSession = parsedCache.data;
            }
        }
    }

    // Nếu không có cache hoặc cache hết hạn, gọi lại auth()
    if (!cachedSession) {
        await auth().then((result) => {
            if (!result?.user?.access_token) {
                return; // Không hợp lệ, để xử lý redirect tại nơi sử dụng
            }

            cachedSession = result;

            // Lưu cache
            if (typeof window !== "undefined") {
                Cookies.set(
                    CACHE_KEY_SESSION,
                    JSON.stringify({
                        data: result,
                        expiresAt: Date.now() + CACHE_DURATION,
                    }),
                    { expires: CACHE_DURATION / 1000 / 60 / 60 / 24 } // Thời gian sống của cookie tính bằng ngày
                );
            }

            session = cachedSession;

        });

    }

    return session;
};
