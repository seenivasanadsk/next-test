"use client";

import Switch from "@/components/Switch";
import { useSettings } from "@/context/SettingsProvider";
import { navigatableSettings, switchableSettings } from "@/utils/settingsItem";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings();
  const router = useRouter();
  return (
    <div className="p-5 flex h-full justify-center">
      <div className="shadow-2xl flex-1 h-full rounded-lg bg-white dark:bg-gray-800 p-6 max-w-2xl border-2 border-gray-300 dark:border-gray-600">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ArrowLeft onClick={() => router.back()} className="cursor-pointer" />
          Settings
        </h1>

        {/* Settings list with dividers */}
        <div className="divide-y divide-gray-300">
          {switchableSettings.map((setItem) => (
            <div
              className="flex items-center justify-between py-4"
              key={setItem.key}
            >
              <div className="flex items-start space-x-3">
                {/* <Wifi className="w-5 h-5 mt-1 text-green-500" /> */}
                <div>
                  <h2 className="font-semibold">{setItem.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {setItem.description}
                  </p>
                </div>
              </div>
              <Switch
                enabled={settings[setItem.key]}
                onChange={(val) => updateSetting(setItem.key, val)}
              />
            </div>
          ))}

          {/* divided */}
          {/* <div className="text-center mt-6 mb-2 border-none text-gray-600">
            Others
          </div> */}

          {navigatableSettings.map((other, index) => (
            <Link
              href={other.link}
              key={index}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-black/5"
            >
              <div className="flex items-start space-x-3">
                {/* <Wifi className="w-5 h-5 mt-1 text-green-500" /> */}
                <div>
                  <h2 className="font-semibold">{other.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {other.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
