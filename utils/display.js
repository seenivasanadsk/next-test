import { humanizeDateTime } from "./dateTime";

export default function display(value, functionName, options = {}) {
  switch (functionName) {
    case "dateTime":
      return humanizeDateTime(value, "dateTime", { relative: !options?.plain });
    default:
      return value;
  }
}
