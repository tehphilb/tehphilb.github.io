import * as React from "react";

/**
 * Numbered project row that expands to a short description.
 * @startingPoint section="Core" subtitle="Expandable numbered project row" viewport="700x200"
 */
export interface ProjectRowProps {
  /** 1-based; rendered zero-padded as 01, 02, … */
  index: number;
  name: string;
  /** Stack and year, middot separated: "go · docker · 2024" */
  tags: string;
  description?: React.ReactNode;
  href?: string;
  open?: boolean;
  onToggle?: () => void;
}
export declare function ProjectRow(props: ProjectRowProps): JSX.Element;
