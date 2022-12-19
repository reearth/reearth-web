import localforage from "localforage";
import { useRef, useMemo, useCallback } from "react";

export default () => {
  const clientStores = useRef<Map<string, LocalForage>>(new Map());

  const getStore = useCallback((pluginId: string) => {
    let store = clientStores.current.get(pluginId);
    if (!store) {
      store = localforage.createInstance({
        name: pluginId,
      });
      clientStores.current.set(pluginId, store);
    }
    return store;
  }, []);

  const clientStorage = useMemo(() => {
    return {
      getAsync: (pluginId: string, key: string) => {
        return new Promise<any>((resolve, reject) => {
          getStore(pluginId)
            .getItem(key)
            .then((value: any) => {
              resolve(value);
            })
            .catch((err: any) => {
              console.log(`err get client storage value for ${pluginId} ${key}: ${err}`);
              reject();
            });
        });
      },
      setAsync: (pluginId: string, key: string, value: any) => {
        return new Promise<void>((resolve, reject) => {
          getStore(pluginId)
            .setItem(key, value)
            .then(() => {
              resolve();
            })
            .catch((err: any) => {
              console.log(`err set client storage value for ${pluginId} ${key} ${value}: ${err}`);
              reject();
            });
        });
      },
      deleteAsync: (pluginId: string, key: string) => {
        return new Promise<void>((resolve, reject) => {
          getStore(pluginId)
            .removeItem(key)
            .then(() => {
              resolve();
            })
            .catch((err: any) => {
              console.log(`err delete client storage value for ${pluginId} ${key}: ${err}`);
              reject();
            });
        });
      },
      keysAsync: (pluginId: string) => {
        return new Promise<string[]>((resolve, reject) => {
          getStore(pluginId)
            .keys()
            .then((value: string[]) => {
              resolve(value);
            })
            .catch((err: any) => {
              console.log(`err get client storage keys for ${pluginId}: ${err}`);
              reject();
            });
        });
      },
      dropStore: (pluginId: string) => {
        return new Promise<void>((resolve, reject) => {
          getStore(pluginId)
            .dropInstance()
            .then(() => resolve())
            .catch((err: any) => {
              console.log(`err drop client storage for ${pluginId}: ${err}`);
              reject();
            })
            .finally(() => {
              clientStores.current.delete(pluginId);
            });
        });
      },
    };
  }, [getStore]);

  return clientStorage;
};
