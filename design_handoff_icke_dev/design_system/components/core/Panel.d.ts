import * as React from "react";

/** Translucent bordered panel; square corners, 1px cyan border, no shadow. */
export interface PanelProps {
  children: React.ReactNode;
  /** Selected/expanded state: brighter border and fill. */
  active?: boolean;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}
export declare function Panel(props: PanelProps): JSX.Element;
