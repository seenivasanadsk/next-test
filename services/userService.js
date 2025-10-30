// services/userService.js
import { AppError } from '@/utils/error';
import { fetchUserOptions, findUserById } from '../dal/userDal';

export async function getUserOptions() {
    return await fetchUserOptions();
}

export async function getUserById(userId) {
    return await findUserById(userId)
}