"use client";

import { useEffect, useRef } from "react";

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
  onReady?: (formInstance: any) => void;
};

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
      if (typeof (window as any).createWebForm !== "function") return;

      // Clear container and initialize form
      container.innerHTML = "";
      const createWebForm = (window as any).createWebForm as (
        containerEl: HTMLElement,
        formId: string,
        opts?: SalesysFormOptions
      ) => any;

      const formInstance = createWebForm(container, formId, options);
      (window as any).myForm = formInstance;

      if (defaultFields && typeof formInstance?.setFields === "function") {
        try {
          formInstance.setFields(defaultFields);
        } catch (e) {
          // noop
        }
      }

      if (typeof onReady === "function") {
        try {
          onReady(formInstance);
        } catch (_) {
          // noop
        }
      }

      initializedRef.current = true;
      // eslint-disable-next-line no-console
      console.log("Salesys form initialized", formInstance);
    };

    webFormScript.addEventListener("load", onLoad);
    return () => {
      webFormScript.removeEventListener("load", onLoad);
    };
  }, [containerId, formId, options, defaultFields]);

  return <div id={containerId} className={wrapperClassName} />;
}


