// utils\response.js
import { serializeDoc } from "./serialize";

export const commonSuccess = (data = null, message = "OK", status = 200) => ({
    success: true,
    data: serializeDoc(data),
    message,
    status,
});
