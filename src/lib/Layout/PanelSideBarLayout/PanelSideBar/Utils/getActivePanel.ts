import { PanelItem } from "../Definitions/PanelItem";

const getActivePanelInternal = <TPanelItemId extends string, TPanelItem>(
  items: PanelItem<TPanelItemId, TPanelItem>[],
): PanelItem<TPanelItemId, TPanelItem> | undefined => items.find((x) => (x.children ? getActivePanelInternal(x.children) : x.active));

export const getActivePanel = <TPanelItemId extends string, TPanelItem>(
  items: PanelItem<TPanelItemId, TPanelItem>[],
  defaultActivePanelId?: TPanelItemId,
) => getActivePanelInternal(items) ?? items.find((x) => (defaultActivePanelId ? x.id === defaultActivePanelId : x.id));

export const hasActiveChildren = <TPanelItemId extends string, TPanelItem>(items: PanelItem<TPanelItemId, TPanelItem>[]) =>
  !!getActivePanelInternal(items);