import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Trả về đường dẫn tuyệt đối tới thư mục gốc của project,
 * kết hợp thêm các phần đường dẫn được truyền vào.
 *
 * Hàm này dùng để xây dựng các đường dẫn chính xác và an toàn,
 * bất kể đang chạy từ đâu trong project.
 *
 * @param {...string} args - Các phần đường dẫn cần nối tiếp sau thư mục gốc.
 * @returns {string} Đường dẫn tuyệt đối tính từ thư mục gốc dự án.
 *
 * Bắt đầu từ thư mục src
 *
 */
export const rootPath = (...args) => path.join(__dirname, "..", ...args);
