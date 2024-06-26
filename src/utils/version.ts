import { types as vetypes } from '@butr/vortexextensionnative';

const versionTypeToChar: Record<vetypes.ApplicationVersionType, string> = {
  [vetypes.ApplicationVersionType.Alpha]: 'a',
  [vetypes.ApplicationVersionType.Beta]: 'b',
  [vetypes.ApplicationVersionType.Development]: 'd',
  [vetypes.ApplicationVersionType.EarlyAccess]: 'e',
  [vetypes.ApplicationVersionType.Release]: 'v',
  [vetypes.ApplicationVersionType.Invalid]: '',
};

const toChar = (avt: vetypes.ApplicationVersionType): string => {
  return versionTypeToChar[avt] || avt.toString();
};

export const versionToString = (av: vetypes.ApplicationVersion): string =>
  `${toChar(av.applicationVersionType)}${av.major}.${av.minor}.${av.revision}.${av.changeSet}`;

export const getVersion = (metadata: vetypes.DependentModuleMetadata): string => {
  if (!isVersionEmpty(metadata.version)) {
    return ` >= ${versionToString(metadata.version)}`;
  }
  if (!isVersionRangeEmpty(metadata.versionRange)) {
    return ` >= ${versionToString(metadata.versionRange.min)} <= ${versionToString(metadata.versionRange.max)}`;
  }
  return '';
};

export const isVersionEmpty = (av: vetypes.ApplicationVersion): boolean =>
  av.applicationVersionType === vetypes.ApplicationVersionType.Alpha &&
  av.major === 0 &&
  av.minor === 0 &&
  av.revision === 0 &&
  av.changeSet === 0;

export const isVersionRangeEmpty = (avr: vetypes.ApplicationVersionRange): boolean =>
  isVersionEmpty(avr.min) && isVersionEmpty(avr.max);

export const getVersionString = (av?: vetypes.ApplicationVersion): string =>
  av && !isVersionEmpty(av) ? ` ${versionToString(av)}` : '';

export const getVersionRangeString = (avr?: vetypes.ApplicationVersionRange): string =>
  avr && !isVersionRangeEmpty(avr) ? ` ${versionToString(avr.min)} - ${versionToString(avr.max)}` : '';
