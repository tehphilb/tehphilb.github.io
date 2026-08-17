import * as React from "react";

/** Labelled form field — uppercase cyan label above a translucent input. */
export interface FieldProps {
  label: string;
  id: string;
  type?: string;
  /** Pass rows to render a textarea instead of an input. */
  rows?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
}
export declare function Field(props: FieldProps): JSX.Element;
