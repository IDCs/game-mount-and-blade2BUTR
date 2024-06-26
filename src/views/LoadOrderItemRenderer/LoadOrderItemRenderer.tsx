/* eslint-disable */
import * as React from 'react';
import { Checkbox, ListGroupItem } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { actions, Icon, selectors, tooltip, types, util } from 'vortex-api';
import { IModuleCompatibilityInfo, IVortexViewModelData } from '../../types';
import { versionToString, VortexLauncherManager } from '../../utils';
import { MODULE_LOGO, STEAM_LOGO, TW_LOGO } from '../../common';
import { types as vetypes, Utils } from '@butr/vortexextensionnative';
import { TooltipImage } from '../Controls';

interface IBaseProps {
  api: types.IExtensionApi;
  manager: VortexLauncherManager;
  className?: string;
  item: types.IFBLOItemRendererProps;
  availableProviders: vetypes.ModuleProviderType[];
  compatibilityInfo: IModuleCompatibilityInfo | undefined;
}

interface IConnectedProps {
  loadOrder: types.FBLOLoadOrder;
  profile: types.IProfile;
  modState: any;
}

export function BannerlordItemRenderer(props: IBaseProps): JSX.Element {
  const { api, className, item } = props;
  const { loadOrder, profile } = useSelector(mapStateToProps);

  const name = item.loEntry.name ? `${item.loEntry.name}` : `${item.loEntry.id}`;
  const version = versionToString(item.loEntry.data?.moduleInfoExtended.version);

  const position = loadOrder.findIndex((entry: types.IFBLOLoadOrderEntry<IVortexViewModelData>) => entry.id === item.loEntry.id) + 1;

  let classes = ['load-order-entry'];
  if (className !== undefined) {
    classes = classes.concat(className.split(' '));
  }

  if (isExternal(item.loEntry)) {
    classes = classes.concat('external');
  }

  const onStatusChange = React.useCallback(
    (evt: any) => {
      const entry = {
        ...item.loEntry,
        enabled: evt.target.checked,
      };
      api.store?.dispatch(actions.setFBLoadOrderEntry(profile.id, entry));
    },
    [api, item, profile]
  );

  const checkBox = () =>
    item.displayCheckboxes ? (
      <Checkbox
        className="entry-checkbox"
        checked={item.loEntry.enabled}
        disabled={isLocked(item.loEntry)}
        onChange={onStatusChange}
      />
    ) : null;

  const lock = () => (isLocked(item.loEntry) ? <Icon className="locked-entry-logo" name="locked" /> : null);

  return (
    <ListGroupItem key={name} className={classes.join(' ')} ref={props.item.setRef}>
      <Icon className="drag-handle-icon" name="drag-handle" />
      <p className="load-order-index">{position}</p>
      {renderValidationError(props)}
      {renderModuleIcon(item.loEntry)}
      <p className="load-order-name">{name} ({version})</p>
      {renderExternalBanner(item.loEntry)}
      {renderCompatibilityInfo(props)}
      {renderModuleDuplicates(props, item.loEntry)}
      {renderModuleProviderIcon(item.loEntry)}
      {checkBox()}
      {lock()}
    </ListGroupItem>
  );
}

function renderModuleIcon(item: types.IFBLOLoadOrderEntry<IVortexViewModelData>): JSX.Element {
  const isOfficial = item.data !== undefined && item.data.moduleInfoExtended.isOfficial;
  const isCommunity = item.data !== undefined && !item.data.moduleInfoExtended.isOfficial;
  const dependencies = item.data !== undefined ? Utils.getDependencyHint(item.data.moduleInfoExtended) : '';

  if (isOfficial) {
    return (
      <TooltipImage
        src={TW_LOGO}
        className="official-module-logo"
        style={{ width: `1.5em`, height: `1.5em`, }}
        tooltip={dependencies} >
      </TooltipImage>
    );
  }

  if (isCommunity) {
    return (
      <TooltipImage
        src={MODULE_LOGO}
        className="community-module-logo"
        style={{ width: `1.5em`, height: `1.5em`, color: `#D69846` }}
        tooltip={dependencies} >
      </TooltipImage>
    );
  }

  return (
    <TooltipImage
      src={""}
      style={{ width: `1.5em`, height: `1.5em`, }}
      tooltip={dependencies} >
    </TooltipImage>
  );
}

function renderValidationError(props: IBaseProps): JSX.Element | null {
  const { invalidEntries, loEntry } = props.item;
  const invalidEntryList =
    invalidEntries !== undefined
      ? invalidEntries.filter((inv) => inv.id.toLowerCase() === loEntry.id.toLowerCase()).map(x => x.reason).join('\n')
      : undefined;
  return invalidEntryList !== undefined && invalidEntryList !== '' ? (
    <tooltip.Icon
      className="fblo-invalid-entry"
      name="feedback-error"
      style={{ width: `1.5em`, height: `1.5em`, }}
      tooltip={invalidEntryList}>
    </tooltip.Icon>
  ) : null;
}

function renderExternalBanner(item: types.IFBLOLoadOrderEntry<IVortexViewModelData>): JSX.Element | null {
  const [t] = useTranslation(['common']);
  return isExternal(item) ? (
    <div className="load-order-unmanaged-banner">
      <Icon className="external-caution-logo" name="feedback-warning" />
      <span className="external-text-area">{t('Not managed by Vortex')}</span>
    </div>
  ) : null;
}

function renderModuleProviderIcon(item: types.IFBLOLoadOrderEntry<IVortexViewModelData>): JSX.Element {
  const [t] = useTranslation(['common']);
  
  if (isSteamWorksop(item)) {
    return (
      <TooltipImage
        src={STEAM_LOGO}
        style={{ width: `1.5em`, height: `1.5em`, }}
        tooltip={t('Managed by Steam')} >
      </TooltipImage>
    );
  }

  return (
    <div style={{ width: `1.5em`, height: `1.5em`, }} />
  );
}

function renderModuleDuplicates(props: IBaseProps, item: types.IFBLOLoadOrderEntry<IVortexViewModelData>): JSX.Element | null {
  const { availableProviders } = props;
  
  if (availableProviders.length <= 1) {
    return <div style={{ width: `1.5em`, height: `1.5em`, }} />;
  }

  if (item.data?.moduleInfoExtended.moduleProviderType) {
    const redundantProviders = availableProviders.filter((provider) => provider !== item.data?.moduleInfoExtended.moduleProviderType);
    return (
      <tooltip.Icon
        className="nexus-id-invalid"
        name="feedback-warning"
        style={{ width: `1.5em`, height: `1.5em`, }}
        tooltip={`The mod is also installed via ${redundantProviders.join(', ')}!`}>
      </tooltip.Icon>
    );
  }

  return <div style={{ width: `1.5em`, height: `1.5em`, }} />;
}

function renderCompatibilityInfo(props: IBaseProps): JSX.Element {
  const { compatibilityInfo: compatibilityScore, item, manager } = props;

  if (compatibilityScore === undefined) {
    return <div style={{ width: `1.5em`, height: `1.5em`, }} />;
  }

  const hasRecommendation = compatibilityScore.recommendedVersion !== undefined && compatibilityScore.recommendedVersion !== null;

  // TODO: Take from BLSE translation
  const NL = '\n';
  const SCORE = compatibilityScore.score;
  const CURRENTVERSION = versionToString(item.loEntry.data?.moduleInfoExtended.version);
  const RECOMMENDEDSCORE = compatibilityScore.recommendedScore ?? 0;
  const RECOMMENDEDVERSION = compatibilityScore.recommendedVersion ?? '';
  const GAMEVERSION = manager.getGameVersionVortex();
  const hint = hasRecommendation
    ? `Based on BUTR analytics:${NL}${NL}Compatibility Score ${SCORE}%${NL}${NL}Suggesting to update to ${RECOMMENDEDVERSION}.${NL}Compatibility Score ${RECOMMENDEDSCORE}%${NL}${NL}${RECOMMENDEDVERSION} has a better compatibility for game ${GAMEVERSION} rather than ${CURRENTVERSION}!`
    : `Based on BUTR analytics:${NL}${NL}Update is not required.${NL}Compatibility Score ${SCORE}%${NL}${NL}${CURRENTVERSION} is one of the best version for game ${GAMEVERSION}`;

  const color = compatibilityScore.score >= 75
    ? 'green' : compatibilityScore.score >= 50
    ? 'yellow' : 'red';

  return (
    <tooltip.Icon
      style={{color: color, width: `1.5em`, height: `1.5em`}}
      name="feedback-error"
      tooltip={hint}>
    </tooltip.Icon>
  );
}

function isLocked(item: types.IFBLOLoadOrderEntry<IVortexViewModelData>): boolean {
  return [true, 'true', 'always'].includes(item.locked as types.FBLOLockState);
}

function isExternal(item: types.IFBLOLoadOrderEntry<IVortexViewModelData>): boolean {
  return item.modId !== undefined ? false : true;
}

function isSteamWorksop(item: types.IFBLOLoadOrderEntry<IVortexViewModelData>): boolean {
  return item.data?.moduleInfoExtended.moduleProviderType === 'Steam';
}

const empty = {};
function mapStateToProps(state: types.IState): IConnectedProps {
  const profile: types.IProfile = selectors.activeProfile(state);
  return {
    profile,
    loadOrder: util.getSafe(state, ['persistent', 'loadOrder', profile.id], []),
    modState: util.getSafe(profile, ['modState'], empty),
  };
}

