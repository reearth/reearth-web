import { useTransition, TransitionStatus } from "@rot1024/use-transition";

import { styled } from "@reearth/theme";

import Plugin from "../Plugin";

export type Props<PP = any, SP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  modal?: string;
  sourceCode?: string;
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
  // const id = "modal";

  // const handleRender = useCallback<NonNullable<PluginProps["onRender"]>>(
  //   options => {
  //     onExtend?.(id, options?.extended);
  //   },
  //   [id, onExtend],
  // );
  // const handleResize = useCallback<NonNullable<PluginProps["onResize"]>>(
  //   (_width, _height, extended) => {
  //     onExtend?.(id, extended);
  //   },
  //   [id, onExtend],
  // );

  const transition = useTransition(!!modal, 200, {
    mountOnEnter: true,
    unmountOnExit: true,
  });

  return (
    <Wrapper transition={transition}>
      <Plugin
        autoResize={"both"} // MAYBE/PROBABLY REMOVE
        sourceCode={modal}
        extensionType="modal" //Set to Modal??
        visible
        pluginBaseUrl={pluginBaseUrl}
        property={props.pluginProperty}
        iFrameProps={{ style: { pointerEvents: modal ? "auto" : "none" } }}
        // onRender={handleRender}
        // onResize={handleResize}
      />
    </Wrapper>
  );
}

export default PluginModal;

const Wrapper = styled.div<{ transition?: TransitionStatus }>`
  position: absolute;
  top: 15%;
  z-index: ${({ theme }) => theme.zIndexes.fullScreenModal};
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
