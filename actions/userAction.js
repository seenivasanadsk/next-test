// actions\userAction.js
"use server";
import { commonSuccess } from '@/utils/response';
import { commonError } from '@/utils/error';
import { getUserOptions, updateUser } from '@/services/userService';
import { unserializeDoc } from '@/utils/serialize';

export async function getUserOptionsAction() {
    try {
        const users = await getUserOptions();
        return commonSuccess(users, "Users fetched")
    } catch (error) {
        return commonError(error)
    }
}

export async function updateUserAction(payload) {
    try {
        payload = unserializeDoc(payload)
        const { id, data } = payload
        const result = await updateUser(data, id)
        return commonSuccess(result, "Users Updated")
    } catch (error) {
        return commonError(error)
    }
}