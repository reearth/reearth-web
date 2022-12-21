import localforage from "localforage";
import { useRef, useMemo, useCallback } from "react";

export default () => {
  const clientStores = useRef<Map<string, LocalForage>>(new Map());

  const getStore = useCallback((pluginId: string) => {
    if (!pluginId) return false;
    const storeName =
      pluginId === "reearth-plugineditor"
        ? pluginId
        : pluginId.includes("~")
        ? `reearth-plugin-${pluginId.substring(0, pluginId.lastIndexOf("~"))}`
        : `reearth-plugin-${pluginId}`;
    let store = clientStores.current.get(storeName);
    if (!store) {
      store = localforage.createInstance({
        name: storeName,
      });
      clientStores.current.set(storeName, store);
    }
    return store;
  }, []);

  const clientStorage = useMemo(() => {
    return {
      getAsync: (pluginId: string, key: string) => {
        return new Promise<any>((resolve, reject) => {
          const store = getStore(pluginId);
          if (!store) {
            reject();
          } else {
            store
              .getItem(key)
              .then((value: any) => {
                resolve(value);
              })
              .catch((err: any) => {
                console.log(`err get client storage value for ${pluginId} ${key}: ${err}`);
                reject();
              });
          }
        });
      },
      setAsync: (pluginId: string, key: string, value: any) => {
        return new Promise<void>((resolve, reject) => {
          const store = getStore(pluginId);
          if (!store) {
            reject();
          } else {
            store
              .setItem(key, value)
              .then(() => {
                resolve();
              })
              .catch((err: any) => {
                console.log(`err set client storage value for ${pluginId} ${key} ${value}: ${err}`);
                reject();
              });
          }
        });
      },
      deleteAsync: (pluginId: string, key: string) => {
        return new Promise<void>((resolve, reject) => {
          const store = getStore(pluginId);
          if (!store) {
            reject();
          } else {
            store
              .removeItem(key)
              .then(() => {
                resolve();
              })
              .catch((err: any) => {
                console.log(`err delete client storage value for ${pluginId} ${key}: ${err}`);
                reject();
              });
          }
        });
      },
      keysAsync: (pluginId: string) => {
        return new Promise<string[]>((resolve, reject) => {
          const store = getStore(pluginId);
          if (!store) {
            reject();
          } else {
            store
              .keys()
              .then((value: string[]) => {
                resolve(value);
              })
              .catch((err: any) => {
                console.log(`err get client storage keys for ${pluginId}: ${err}`);
                reject();
              });
          }
        });
      },
      // Currently not in use.
      dropStore: (pluginId: string) => {
        return new Promise<void>((resolve, reject) => {
          const store = getStore(pluginId);
          if (!store) {
            reject();
          } else {
            store
              .dropInstance()
              .then(() => resolve())
              .catch((err: any) => {
                console.log(`err drop client storage for ${pluginId}: ${err}`);
                reject();
              })
              .finally(() => {
                clientStores.current.delete(pluginId);
              });
          }
        });
      },
    };
  }, [getStore]);

  return clientStorage;
};
