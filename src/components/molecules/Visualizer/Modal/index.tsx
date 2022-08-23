import { useTransition, TransitionStatus } from "@rot1024/use-transition";

import { styled } from "@reearth/theme";

import Plugin from "../Plugin";

export type Props<PP = any, SP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  modal?: string;
  sceneProperty?: SP;
  pluginProperty?: PP;
  pluginBaseUrl?: string;
  editing?: boolean;
  // onExtend?: (id: string, extended: boolean | undefined) => void;
};

function PluginModal<PP = any, SP = any>({
  modal,
  // sourceCode,
  pluginBaseUrl,
  // onExtend,
  // editing,
  ...props
}: Props<PP, SP>) {
  // const modalType = "modal";
  // const { pluginModal, changePluginModal } = useContext() ?? {};

  // const handleChangePluginModal = useCallback(
  //   (html?: string | undefined) => {
  //     console.log("change?");
  //     if (id && html) {
  //       console.log(id, "change from parent?");
  //       // console.log(html, "change from parent?");
  //       changePluginModal?.({ parentId: id, html });
  //     } else if (id === pluginModal?.parentId || isModal) {
  //       console.log("close?");
  //       changePluginModal?.({});
  //     }
  //   },
  //   [id, isModal, pluginModal?.parentId, changePluginModal],
  // );

  const transition = useTransition(!!modal, 200, {
    mountOnEnter: true,
    unmountOnExit: true,
  });

  return modal ? (
    <Wrapper transition={transition}>
      <Plugin
        autoResize={"both"} // MAYBE/PROBABLY REMOVE
        extensionType="modal"
        sourceCode={modal}
        visible
        pluginBaseUrl={pluginBaseUrl}
        property={props.pluginProperty}
        iFrameProps={{ style: { pointerEvents: "auto" } }}
        // onRender={handleRender}
        // onResize={handleResize}
      />
    </Wrapper>
  ) : null;
}

export default PluginModal;

const Wrapper = styled.div<{ transition?: TransitionStatus }>`
  position: absolute;
  top: 15%;
  z-index: ${({ theme }) => theme.zIndexes.pluginModal};
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  transition: all 0.6s;
  position: absolute;
  opacity: ${({ transition }) =>
    transition === "entering" || transition === "entered" ? "1" : "0"};

  display: flex;
  justify-content: center;
  pointer-events: none;
`;
