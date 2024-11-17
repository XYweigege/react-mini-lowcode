import React, { useRef } from "react";
import { useComponentConfigStore } from "../../stores/component-config";
import { Component, useComponetsStore } from "../../stores/components";
import { message } from "antd";
import { GoToLinkConfig } from "../Setting/actions/GoToLink";
import { ShowMessageConfig } from "../Setting/actions/ShowMessage";

export function Preview() {
  const { components } = useComponetsStore();
  const { componentConfig } = useComponentConfigStore();
  const componentRefs = useRef<Record<string, any>>({});

  function handleEvent(component: Component) {
    const props: Record<string, any> = {};

    componentConfig[component.name].events?.forEach((event) => {
      const eventConfig = component.props[event.name];

      if (eventConfig) {
        props[event.name] = (...args: any[]) => {
          eventConfig?.actions?.forEach(
            (action: GoToLinkConfig | ShowMessageConfig) => {
              if (action.type === "goToLink") {
                window.location.href = action.url;
              } else if (action.type === "showMessage") {
                if (action.config.type === "success") {
                  message.success(action.config.text);
                } else if (action.config.type === "error") {
                  message.error(action.config.text);
                }
              } else if (action.type === "customJS") {
                const func = new Function("context", "args", action.code);
                func(
                  {
                    name: component.name,
                    props: component.props,
                    showMessage(content: string) {
                      message.success(content);
                    },
                  },
                  ...args
                );
              } else if (action.type === "componentMethod") {
                const component =
                  componentRefs.current[action.config.componentId];

                if (component) {
                  component[action.config.method]?.(...args);
                }
              }
            }
          );
        };
      }
    });
    return props;
  }

  function renderComponents(components: Component[]): React.ReactNode {
    return components.map((component: Component) => {
      const config = componentConfig?.[component.name];

      if (!config?.prod) {
        return null;
      }

      return React.createElement(
        config.prod,
        {
          key: component.id,
          id: component.id,
          name: component.name,
          styles: component.styles,
          ref: (ref: Record<string, any>) => {
            componentRefs.current[component.id] = ref;
          },
          ...config.defaultProps,
          ...component.props,
          ...handleEvent(component),
        },
        renderComponents(component.children || [])
      );
    });
  }
  /*
[
  {
    "id": 1,
    "name": "Page",
    "props": {},
    "desc": "页面",
    "children": [
      {
        "id": 1731734128139,
        "name": "Button",
        "desc": "按钮",
        "props": {
          "type": "primary",
          "text": "按钮"
        },
        "parentId": 1
      }
    ]
  }
]
*/

  return <div>{renderComponents(components)}</div>;
}
