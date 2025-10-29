// actions\userAction.js
"use server";
import { commonSuccess } from '@/utils/response';
import { commonError } from '@/utils/error';
import { getUserOptions } from '@/services/userService';

export async function getUserOptionsAction() {
    try {
        const users = await getUserOptions();
        return commonSuccess(users, "Users fetched")
    } catch (error) {
        return commonError(error)
    }
}