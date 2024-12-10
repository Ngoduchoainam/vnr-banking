// pages/api/bank-account-api/find.js

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Parse query parameters
    const searchTerms = parseSearchTerms(req.query.searchTerms);
    const pageIndex = parseInt(req.query.pageIndex, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 20;

    // Cấu hình điều kiện tìm kiếm
    const searchConditions = {};
    searchTerms.forEach(term => {
        searchConditions[term.Name] = term.Value;
    });

    // Sử dụng `searchConditions`, `pageIndex`, và `pageSize` để xử lý dữ liệu

    // Demo response
    res.json({
        message: 'Search executed successfully',
        searchConditions,
        pageIndex,
        pageSize,
        data: [] // Kết quả tìm kiếm sẽ được lấy từ cơ sở dữ liệu
    });
}

// Helper function để parse `searchTerms`
function parseSearchTerms(searchTerms) {
    if (!searchTerms) return [];
    return Array.isArray(searchTerms) ? searchTerms.map(parseSingleTerm) : [parseSingleTerm(searchTerms)];
}

function parseSingleTerm(term) {
    const [Name, Value] = term.split('=');
    return { Name, Value };
}
