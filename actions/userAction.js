// actions\userAction.js
"use server";
import { commonSuccess } from "@/utils/response";
import { commonError } from "@/utils/error";
import {
  deleteUserById,
  getUserOptions,
  updateUser,
} from "@/services/userService";
import { unserializeDoc, unserializeId } from "@/utils/serialize";
import getCurrentSession from "@/lib/session";

export async function getUserOptionsAction() {
  try {
    const users = await getUserOptions();
    return commonSuccess(users, "Users fetched");
  } catch (error) {
    return commonError(error);
  }
}

export async function updateUserAction(payload) {
  try {
    payload = unserializeDoc(payload);
    const { id, data } = payload;
    const result = await updateUser(data, id);
    return commonSuccess(result, "Users Updated");
  } catch (error) {
    return commonError(error);
  }
}

export async function deleteUserAction(payload) {
  try {
    const userId = unserializeId(payload);
    const data = deleteUserById(userId);
    return commonSuccess(data, { message: "User Deleted" });
  } catch (error) {
    return commonError(error);
  }
}

export async function setUserSettingsAction(payload) {
  try {
    const settings = unserializeDoc(payload);
    const { userId } = await getCurrentSession()
    const result = await updateUser({ settings }, unserializeId(userId));
    return commonSuccess(result, { message: "Settings Updated" });
  } catch (error) {
    return commonError(error);
  }
}