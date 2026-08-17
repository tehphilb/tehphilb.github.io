import * as React from "react";

/**
 * Animated ASCII character field — the brand's background texture.
 * @startingPoint section="Brand" subtitle="Animated ASCII background field" viewport="700x260"
 */
export interface AsciiFieldProps {
  cols?: number;
  rows?: number;
  /** Frame interval in ms; 110 is the house tempo. */
  interval?: number;
  running?: boolean;
  style?: React.CSSProperties;
}
export declare function AsciiField(props: AsciiFieldProps): JSX.Element;
