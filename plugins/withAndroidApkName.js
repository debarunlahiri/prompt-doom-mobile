const { withAppBuildGradle } = require("@expo/config-plugins");

const START_MARKER = "// @generated prompt-doom-apk-name";
const END_MARKER = "// @end prompt-doom-apk-name";

const APK_NAME_BLOCK = `
${START_MARKER}
def promptDoomBuildTimestamp = new Date().format("ddMMyyHHmmss")
android.applicationVariants.all { variant ->
    variant.outputs.all { output ->
        output.outputFileName = "prompt_doom_\${promptDoomBuildTimestamp}_\${variant.buildType.name}.apk"
    }
}
${END_MARKER}
`;

module.exports = function withAndroidApkName(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    if (
      gradleConfig.modResults.language === "groovy" &&
      !gradleConfig.modResults.contents.includes(START_MARKER)
    ) {
      gradleConfig.modResults.contents += APK_NAME_BLOCK;
    }
    return gradleConfig;
  });
};
