import Accordion from "@reearth/components/atoms/Accordion";
import { useTheme } from "@reearth/theme";
import React from "react";
import PluginAccordionItemBody from "./PluginAccordionItem/itemBody";
import PluginAccordionItemHeader from "./PluginAccordionItem/itemHeader";

export type PluginItem = {
  thumbnailUrl?: string;
  title: string;
  isInstalled: boolean;
  bodyMarkdown?: string;
  author: string;
};

export type PluginAccordionProps = {
  className?: string;
  items?: PluginItem[];
};

const PluginAccordion: React.FC<PluginAccordionProps> = ({ className, items }) => {
  const theme = useTheme();
  return items ? (
    <Accordion
      className={className}
      allowMultipleExpanded
      itemBgColor={theme.colors.bg[3]}
      items={items?.map(i => {
        return {
          id: i.title,
          heading: (
            <PluginAccordionItemHeader
              thumbnail={i.thumbnailUrl}
              title={i.title}
              isInstalled={i.isInstalled}
            />
          ),
          content: <PluginAccordionItemBody>{i.bodyMarkdown}</PluginAccordionItemBody>,
        };
      })}
    />
  ) : null;
};

export default PluginAccordion;
