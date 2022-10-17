import { ReactNode } from "react";
import { GridSection } from "react-align";

import type { PluginModalInfo } from "../Plugin/ModalContainer";
import type { PluginPopupInfo } from "../Plugin/PopupContainer";

import Area from "./Area";
import type { WidgetZone, WidgetLayoutConstraint } from "./hooks";

export type Props = {
  children?: ReactNode;
  zone?: WidgetZone;
  zoneName: "inner" | "outer";
  layoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  isEditable?: boolean;
  isBuilt?: boolean;
  sceneProperty?: any;
  pluginProperty?: { [key: string]: any };
  pluginModalContainer?: HTMLElement | DocumentFragment;
  shownPluginModalInfo?: PluginModalInfo;
  showPluginModal?: (modalInfo?: PluginModalInfo) => void;
  pluginPopupContainer?: HTMLElement | DocumentFragment;
  shownPluginPopupInfo?: PluginPopupInfo;
  showPluginPopup?: (popupInfo?: PluginPopupInfo) => void;
  pluginBaseUrl?: string;
  overrideSceneProperty?: (pluginId: string, property: any) => void;
};

const sections = ["left", "center", "right"] as const;
const areas = ["top", "middle", "bottom"] as const;

export default function Zone({
  zone,
  zoneName,
  layoutConstraint,
  sceneProperty,
  pluginProperty,
  pluginModalContainer,
  shownPluginModalInfo,
  showPluginModal,
  pluginPopupContainer,
  shownPluginPopupInfo,
  showPluginPopup,
  pluginBaseUrl,
  isEditable,
  isBuilt,
  children,
}: Props) {
  return (
    <>
      {sections.map(s => (
        <GridSection key={s} stretch={s === "center"}>
          {areas.map(a =>
            s === "center" && children && a === "middle" ? (
              <div key={a} style={{ display: "flex", flex: "1 0 auto" }}>
                {children}
              </div>
            ) : (
              <Area
                key={a}
                zone={zoneName}
                section={s}
                area={a}
                widgets={zone?.[s]?.[a]?.widgets}
                align={zone?.[s]?.[a]?.align ?? "start"}
                layoutConstraint={layoutConstraint}
                sceneProperty={sceneProperty}
                pluginProperty={pluginProperty}
                pluginModalContainer={pluginModalContainer}
                shownPluginModalInfo={shownPluginModalInfo}
                showPluginModal={showPluginModal}
                pluginPopupContainer={pluginPopupContainer}
                shownPluginPopupInfo={shownPluginPopupInfo}
                showPluginPopup={showPluginPopup}
                pluginBaseUrl={pluginBaseUrl}
                isEditable={isEditable}
                isBuilt={isBuilt}
              />
            ),
          )}
        </GridSection>
      ))}
    </>
  );
}
