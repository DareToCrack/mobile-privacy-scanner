export interface NativeAppPermission {
  /** Full Android permission id, e.g. "android.permission.RECORD_AUDIO". */
  name: string;
  /** Whether the permission is currently granted to the app. */
  granted: boolean;
}

export interface NativeAppInfo {
  packageName: string;
  label: string;
  /** Mapped app category: games, social, news, navigation, productivity, media, tools. */
  category: string;
  isSystemApp: boolean;
  permissions: NativeAppPermission[];
}

/** List installed apps with their declared permissions (Android only). */
export function getInstalledApps(): Promise<NativeAppInfo[]>;
