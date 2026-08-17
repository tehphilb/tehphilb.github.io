import * as React from "react";

/**
 * Bracket button — the only button style in the system.
 * @startingPoint section="Core" subtitle="Bracket buttons in three weights" viewport="700x140"
 */
export interface ButtonProps {
  /** Label, brackets included: "[ senden ]" */
  children: React.ReactNode;
  /** action = outlined pink (default) · solid = filled pink · quiet = muted outline */
  variant?: "action" | "solid" | "quiet";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
