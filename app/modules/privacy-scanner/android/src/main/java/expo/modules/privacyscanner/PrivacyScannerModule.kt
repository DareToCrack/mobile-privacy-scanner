package expo.modules.privacyscanner

import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.os.Build
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * PrivacyScanner native module (Android only).
 *
 * Lists installed apps and their declared permissions via PackageManager.
 * Read-only: it never modifies anything on the device.
 *
 * Grant state comes from PackageInfo.requestedPermissionsFlags, which runs
 * parallel to requestedPermissions — no special privilege is needed to read
 * another app's grant state, only to enumerate the apps (QUERY_ALL_PACKAGES,
 * declared in this module's AndroidManifest.xml).
 *
 * NOTE — verification status: this code was written against the Expo Modules
 * API (SDK 58) and the Android PackageManager API, but it has NOT been
 * compiled in this environment (no Android SDK here) and has NOT been run on
 * a device. Build it with `npx expo run:android` on a machine with Android
 * Studio / the Android SDK installed.
 */
class PrivacyScannerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PrivacyScanner")

    AsyncFunction("getInstalledApps") { promise: Promise ->
      try {
        val context = requireNotNull(appContext.reactContext) {
          "React context is not available"
        }
        val pm = context.packageManager
        val installed = pm.getInstalledApplications(PackageManager.GET_META_DATA)
        val result = installed.mapNotNull { app -> toAppMap(pm, app) }
        promise.resolve(result)
      } catch (e: Exception) {
        promise.reject("SCAN_FAILED", "Failed to list installed apps: ${e.message}", e)
      }
    }
  }

  // getPackageInfo(String, Int) is deprecated in API 33 in favour of the
  // PackageInfoFlags overload, but the int overload remains the only one
  // available on every supported API level, so we keep it.
  @Suppress("DEPRECATION")
  private fun toAppMap(pm: PackageManager, app: ApplicationInfo): Map<String, Any?>? {
    return try {
      val pkg: PackageInfo =
        pm.getPackageInfo(app.packageName, PackageManager.GET_PERMISSIONS)
      val requested: Array<out String> = pkg.requestedPermissions ?: emptyArray()
      val flags: IntArray = pkg.requestedPermissionsFlags
      val permissions = requested.mapIndexed { index, name ->
        val granted = index < flags.size &&
          (flags[index] and PackageInfo.REQUESTED_PERMISSION_GRANTED) != 0
        mapOf("name" to name, "granted" to granted)
      }
      // ApplicationInfo.category only exists on API 26+; older devices get
      // the neutral "tools" category (no over-privilege judgement is made
      // from the category alone).
      val category = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        mapCategory(app.category)
      } else {
        "tools"
      }
      mapOf(
        "packageName" to app.packageName,
        "label" to (pm.getApplicationLabel(app)?.toString() ?: app.packageName),
        "category" to category,
        "isSystemApp" to ((app.flags and ApplicationInfo.FLAG_SYSTEM) != 0),
        "permissions" to permissions
      )
    } catch (e: PackageManager.NameNotFoundException) {
      // App was uninstalled between the list call and this lookup; skip it.
      null
    }
  }

  private fun mapCategory(category: Int): String = when (category) {
    ApplicationInfo.CATEGORY_GAME -> "games"
    ApplicationInfo.CATEGORY_SOCIAL -> "social"
    ApplicationInfo.CATEGORY_NEWS -> "news"
    ApplicationInfo.CATEGORY_MAPS -> "navigation"
    ApplicationInfo.CATEGORY_PRODUCTIVITY -> "productivity"
    ApplicationInfo.CATEGORY_AUDIO,
    ApplicationInfo.CATEGORY_VIDEO,
    ApplicationInfo.CATEGORY_IMAGE -> "media"
    else -> "tools"
  }
}
