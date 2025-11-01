// services/userService.js
import { AppError } from '@/utils/error';
import { fetchUserOptions, findUserById, updateUserById } from '../dal/userDal';
import bcrypt from 'bcrypt'

export async function getUserOptions() {
    return await fetchUserOptions();
}

export async function getUserById(userId) {
    return await findUserById(userId)
}

export async function updateUser(updates, _id) {
    let { newPassword, confirmPassword, oldPassword, ...data } = updates

    // Update Password if only any of these field has value
    if (newPassword !== "", confirmPassword !== "", oldPassword !== "") {
        // check both passwords are same
        if (newPassword !== confirmPassword) throw new AppError("Password does not Match", 400)

        // check a user exist or not for checking old password
        const user = await findUserById(_id)
        if (!user) throw new AppError("User not found", 404)

        // check old password are correct
        const isValid = await bcrypt.compare(oldPassword, user.hashed_password);
        if (!isValid) throw new AppError('Invalid password', 401);

        // Hash new password
        const hashed_password = await bcrypt.hash(newPassword, 10)
        data.hashed_password = hashed_password
    }

    return await updateUserById(data, _id)
}