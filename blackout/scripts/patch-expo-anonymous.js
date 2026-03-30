#!/usr/bin/env node
/**
 * Patches @expo/cli so that EXPO_ANONYMOUS=1 makes tryGetUserAsync() return null
 * (proceed anonymously) without prompting. Used by npm run start:go.
 */
const path = require('path');
const fs = require('fs');

const actionsPath = path.join(
  __dirname,
  '../node_modules/expo/node_modules/@expo/cli/build/src/api/user/actions.js'
);

const expoConstantsPodspecPath = path.join(
  __dirname,
  '../node_modules/expo-constants/ios/EXConstants.podspec'
);

const SEARCH = `async function tryGetUserAsync() {
    const user = await (0, _user.getUserAsync)().catch(()=>null);`;

const REPLACEMENT = `async function tryGetUserAsync() {
    if (process.env.EXPO_ANONYMOUS === '1' || process.env.EXPO_ANONYMOUS === 'true') {
        return null;
    }
    const user = await (0, _user.getUserAsync)().catch(()=>null);`;

try {
  let content = fs.readFileSync(actionsPath, 'utf8');
  if (!content.includes('EXPO_ANONYMOUS')) {
    if (!content.includes(SEARCH)) {
      console.warn('patch-expo-anonymous: pattern not found, skipping (expo version may have changed)');
    } else {
      content = content.replace(SEARCH, REPLACEMENT);
      fs.writeFileSync(actionsPath, content);
    }
  }
} catch (e) {
  if (e.code === 'ENOENT') {
    // expo not installed yet
  } else {
    throw e;
  }
}

const PODSPEC_SEARCH = ':script => "bash -l -c \\"#{env_vars}$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"",';
const PODSPEC_REPLACEMENT = ':script => "#{env_vars}bash -l \\"$PODS_TARGET_SRCROOT/../scripts/get-app-config-ios.sh\\"",';

try {
  let podspec = fs.readFileSync(expoConstantsPodspecPath, 'utf8');
  if (!podspec.includes(PODSPEC_REPLACEMENT)) {
    if (!podspec.includes(PODSPEC_SEARCH)) {
      console.warn('patch-expo-anonymous: expo-constants podspec pattern not found, skipping');
    } else {
      podspec = podspec.replace(PODSPEC_SEARCH, PODSPEC_REPLACEMENT);
      fs.writeFileSync(expoConstantsPodspecPath, podspec);
    }
  }
} catch (e) {
  if (e.code !== 'ENOENT') {
    throw e;
  }
}
