import { useCallback, useEffect, useState, useRef, useMemo } from "react";

import type { Block } from "./Block";
import type { PluginExtensionInstance } from "./Plugin/types";
import type { Widget, WidgetAlignSystem, WidgetSection, WidgetZone } from "./WidgetAlignSystem";

export type Props = {
  alignSystem?: WidgetAlignSystem;
  floatingWidgets?: Widget[];
  blocks?: Block[];
};

export type PluginInstances = {
  meta: PluginExtensionInstance[];
  postMessage: (id: string, msg: any, sender: string) => void;
  addPluginMessageSender: (id: string, msgSender: (msg: string) => void) => void;
  removePluginMessageSender: (id: string) => void;
};

export default ({ alignSystem, floatingWidgets, blocks }: Props) => {
  const [pluginInstancesMeta, setPluginInstancesMeta] = useState<PluginExtensionInstance[]>([]);

  useEffect(() => {
    const instances: PluginExtensionInstance[] = [];

    if (alignSystem) {
      Object.keys(alignSystem).forEach(zoneName => {
        const zone = alignSystem[zoneName as keyof WidgetAlignSystem];
        if (zone) {
          Object.keys(zone).forEach(sectionName => {
            const section = zone[sectionName as keyof WidgetZone];
            if (section) {
              Object.keys(section).forEach(areaName => {
                const area = section[areaName as keyof WidgetSection];
                if (area?.widgets) {
                  area?.widgets.forEach(widget => {
                    instances.push({
                      id: widget.id,
                      pluginId: widget.pluginId ?? "",
                      name: getExtensionInstanceName(widget.pluginId ?? ""),
                      extensionId: widget.extensionId ?? "",
                      extensionType: "widget",
                    });
                  });
                }
              });
            }
          });
        }
      });
    }

    if (floatingWidgets) {
      floatingWidgets.forEach(widget => {
        instances.push({
          id: widget.id,
          pluginId: widget.pluginId ?? "",
          name: getExtensionInstanceName(widget.pluginId ?? ""),
          extensionId: widget.extensionId ?? "",
          extensionType: "widget",
        });
      });
    }

    if (blocks) {
      blocks.forEach(block => {
        instances.push({
          id: block.id,
          pluginId: block.pluginId ?? "",
          name: getExtensionInstanceName(block.pluginId ?? ""),
          extensionId: block.extensionId ?? "",
          extensionType: "block",
        });
      });
    }

    setPluginInstancesMeta(instances);
  }, [alignSystem, floatingWidgets, blocks]);

  const pluginMessageSenders = useRef<Map<string, (msg: any) => void>>(new Map());

  const addPluginMessageSender = useCallback((id: string, msgSender: (msg: string) => void) => {
    pluginMessageSenders.current?.set(id, msgSender);
  }, []);

  const removePluginMessageSender = useCallback((id: string) => {
    pluginMessageSenders.current?.delete(id);
  }, []);

  const pluginPostMessage = useCallback((id: string, msg: any, sender: string) => {
    const msgSender = pluginMessageSenders.current?.get(id);
    if (!msgSender) return;
    msgSender({ data: msg, sender });
  }, []);

  const pluginInstances = useMemo(() => {
    return {
      meta: pluginInstancesMeta,
      postMessage: pluginPostMessage,
      addPluginMessageSender,
      removePluginMessageSender,
    };
  }, [pluginInstancesMeta, pluginPostMessage, addPluginMessageSender, removePluginMessageSender]);

  return {
    pluginInstances,
  };
};

function getExtensionInstanceName(pluginId: string) {
  const segments = pluginId.split("~");
  if (segments.length === 3) {
    return segments[1];
  } else if (segments.length === 2) {
    return segments[0];
  }
  return pluginId;
}
