import { GAME_ID } from '../../src/common';
import { createVortexExtensionManager, types as vetypes } from '@butr/vortexextensionnative';
import { uiExtenderEx } from './data';
import { ILoadOrder } from 'vortex-api/lib/extensions/mod_load_order/types/types';
import { IProfile } from 'vortex-api/lib/types/IState';

const manager = createVortexExtensionManager();
let loadOrder: ILoadOrder = { };

const getActiveProfile = (): IProfile => {
  return { gameId: 'mountandblade2bannerlord' } as any;
};
const getProfileById = (_id: string): IProfile => {
  return { gameId: 'mountandblade2bannerlord' } as any;
};
const getActiveGameId = (): string => {
    return "";
};
const setGameParameters = (_gameId: string, _executable: string, _gameParameters: string[]): void => {
  ;
};
const getLoadOrder = (): ILoadOrder => {
  return loadOrder;
};
const setLoadOrder = (loadOrder2: ILoadOrder): void => {
  loadOrder = loadOrder2;
};
const translateString = (text: string, _ns: string): string => {
    return text;
};
const sendNotification = (_id: string, _type: any, _message: string, _delayMS: number): void => {
};
const getInstallPath = (): string => {
    return "D:\\SteamLibrary\\steamapps\\common\\Mount & Blade II Bannerlord";
};
const readFileContent = (_filePath: string): string => {
  return uiExtenderEx;
  //const result = fs.readFileSync(filePath, { encoding: `utf8` });;
  //return fs.readFileSync(filePath).toString();
};
const readDirectoryFileList = (directoryPath: string): string[] | null => {
  return [];
};
manager.registerCallbacks(
  getActiveProfile,
  getProfileById,
  getActiveGameId,
  setGameParameters,
  getLoadOrder,
  setLoadOrder,
  translateString,
  sendNotification,
  getInstallPath,
  readFileContent,
  readDirectoryFileList);

describe(`moduleinstaller`, () => {
  test(`no instructions when wrong game id`, async () => {

    var t0 = manager.getGameVersion();
    var t1 = manager.isSorting();
    var t2 = manager.getLoadOrder();
    manager.setLoadOrder(t2);
    manager.sort();
    



    const expected = { instructions: [] };
    const result = manager.installModule([``], ``);
    expect(expected).toEqual(result);
  });

  test(`no instructions when wrong Modules folder`, async () => {
    const expected = { instructions: [] };
    const result = manager.installModule([`sdfw/Module/SomeFile.txt`], GAME_ID);
    expect(expected).toEqual(result);
  });

  test(`no instructions when correct without SubModule.xml`, async () => {
    const expected = { instructions: [] };
    const result = manager.installModule([`Modules/Module/SomeFile.txt`], GAME_ID);
    expect(expected).toEqual(result);
  });

  test(`instructions when correct with SubModule.xml`, async () => {
    const expected = { instructions: [] };
    const result = manager.installModule([`Modules/Module/SubModule.xml`], GAME_ID);
    expect(expected).toEqual(result);
  });
});