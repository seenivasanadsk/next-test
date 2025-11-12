"use server";
import { getUsersForDataTable } from "@/services/userService";

export async function getDataTableAction(payload) {
    try {
        payload = unserializeDoc(payload);
        let result = {}
        switch (payload.entityType) {
            case 'users':
                result = await getUsersForDataTable(payload)
                break;
            default:
                return commonError(new Error("Wrong Entity Type"));
        }
        return commonSuccess(result, { message: "Settings Updated" });
    } catch (error) {
        return commonError(error);
    }
}