"use client";

import { useEffect, useRef } from "react";

export type SalesysFormField = {
  name?: string;
  label?: string;
  value?: string;
};

export type SalesysFormInstance = {
  setFields?: (fields: Array<{ fieldId: string; value: string }>) => void;
  getFields?: () => SalesysFormField[];
};

type SalesysFormOptions = {
  width?: string;
  test?: boolean;
};

type SalesysFormProps = {
  containerId?: string;
  formId: string;
  options?: SalesysFormOptions;
  defaultFields?: Array<{ fieldId: string; value: string }>; 
  wrapperClassName?: string;
  onReady?: (formInstance: SalesysFormInstance) => void;
};

declare global {
  interface Window {
    createWebForm?: (
      containerEl: HTMLElement,
      formId: string,
      opts?: SalesysFormOptions
    ) => SalesysFormInstance;
    myForm?: SalesysFormInstance;
  }
}

/**
 * Loads the Salesys web form script and initializes the form in a provided container.
 */
export default function SalesysForm({
  containerId = "form-container",
  formId,
  options,
  defaultFields,
  wrapperClassName,
  onReady,
}: SalesysFormProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    const webFormScript = document.createElement("script");
    webFormScript.src = "https://salesys.se/scripts/web_form1.js";
    webFormScript.async = true;
    document.body.appendChild(webFormScript);

    const onLoad = () => {
      if (typeof window.createWebForm !== "function") return;

      // Clear container and initialize form
      container.innerHTML = "";
      const createWebForm = window.createWebForm;
      const formInstance = createWebForm(container, formId, options);
      window.myForm = formInstance;

      if (defaultFields && typeof formInstance?.setFields === "function") {
        try {
          formInstance.setFields(defaultFields);
        } catch {
          /* noop */
        }
      }

      if (typeof onReady === "function") {
        try {
          onReady(formInstance);
        } catch {
          /* noop */
        }
      }

      initializedRef.current = true;
      console.log("Salesys form initialized", formInstance);
    };

    webFormScript.addEventListener("load", onLoad);
    return () => {
      webFormScript.removeEventListener("load", onLoad);
    };
  }, [containerId, formId, options, defaultFields, onReady]);

  return <div id={containerId} className={wrapperClassName} />;
}


