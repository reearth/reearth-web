import React, { useState } from "react";

import { Meta, Story } from "@storybook/react";
import ConfirmationModal, { Props } from ".";

export default {
  title: "atoms/Modal/ConfirmationModal",
  component: ConfirmationModal,
} as Meta;

export const Default: Story<Props> = args => {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <ConfirmationModal {...args} isOpen={isOpen} onClose={() => setOpen(false)} />
      <button onClick={() => setOpen(true)}>click</button>
    </>
  );
};

Default.args = {
  body: <div>Are you sure to delete this</div>,
  title: "Delete Sample",
  onCancel: () => console.log("Cancel"),
  onProceed: () => console.log("Proceed"),
};
