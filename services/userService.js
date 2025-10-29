// services/userService.js
import { AppError } from '@/utils/error';
import { fetchUserOptions } from '../dal/userDal';

export async function getUserOptions() {
    return await fetchUserOptions();
}