import * as React from "react";

/**
 * The icke.dev ASCII block wordmark.
 * @startingPoint section="Brand" subtitle="ASCII block wordmark" viewport="700x140"
 */
export interface WordmarkProps {
  /** Any CSS length; 10px is the desktop default, ~6.4px on mobile. */
  size?: string;
  glow?: boolean;
  color?: string;
  style?: React.CSSProperties;
}
export declare function Wordmark(props: WordmarkProps): JSX.Element;
export declare const WORDMARK: string;
