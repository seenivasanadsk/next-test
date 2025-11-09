// httpStatus.js
export const HTTP_STATUS = {
  // 1xx Informational
  100: {
    name: "Continue",
    description: "Request received, client should continue",
  },
  101: {
    name: "Switching Protocols",
    description: "Protocol is switching as requested",
  },
  102: {
    name: "Processing",
    description: "WebDAV, request received but not completed",
  },

  // 2xx Success
  200: { name: "OK", description: "Standard success response" },
  201: { name: "Created", description: "Resource successfully created" },
  202: {
    name: "Accepted",
    description: "Request accepted but not yet processed",
  },
  203: {
    name: "Non-Authoritative Information",
    description: "Response from third-party source",
  },
  204: { name: "No Content", description: "Successful but no body returned" },
  205: { name: "Reset Content", description: "Reset document view" },
  206: { name: "Partial Content", description: "Used for range requests" },
  207: { name: "Multi-Status", description: "WebDAV" },
  208: { name: "Already Reported", description: "WebDAV" },
  226: { name: "IM Used", description: "HTTP Delta encoding" },

  // 3xx Redirection
  300: { name: "Multiple Choices", description: "Multiple options available" },
  301: { name: "Moved Permanently", description: "Resource permanently moved" },
  302: { name: "Found", description: "Temporary redirect" },
  303: { name: "See Other", description: "Redirect with GET" },
  304: { name: "Not Modified", description: "Cached version is valid" },
  305: { name: "Use Proxy", description: "Requested via proxy" },
  307: {
    name: "Temporary Redirect",
    description: "Temporary redirect, method preserved",
  },
  308: {
    name: "Permanent Redirect",
    description: "Permanent redirect, method preserved",
  },

  // 4xx Client Errors
  400: { name: "Bad Request", description: "Invalid request syntax" },
  401: {
    name: "Unauthorized",
    description: "Authentication required or failed",
  },
  402: { name: "Payment Required", description: "Reserved for future use" },
  403: { name: "Forbidden", description: "Server refuses action" },
  404: { name: "Not Found", description: "Resource does not exist" },
  405: { name: "Method Not Allowed", description: "HTTP method not supported" },
  406: {
    name: "Not Acceptable",
    description: "Content not acceptable per headers",
  },
  407: {
    name: "Proxy Authentication Required",
    description: "Proxy requires auth",
  },
  408: { name: "Request Timeout", description: "Server timed out waiting" },
  409: {
    name: "Conflict",
    description: "Conflict with current resource state",
  },
  410: { name: "Gone", description: "Resource permanently gone" },
  411: {
    name: "Length Required",
    description: "Content-Length header required",
  },
  412: {
    name: "Precondition Failed",
    description: "Conditional request failed",
  },
  413: { name: "Payload Too Large", description: "Request body too large" },
  414: { name: "URI Too Long", description: "Request URI too long" },
  415: {
    name: "Unsupported Media Type",
    description: "Request media type not supported",
  },
  416: {
    name: "Range Not Satisfiable",
    description: "Requested range not valid",
  },
  417: { name: "Expectation Failed", description: "Expect header failed" },
  418: { name: "I'm a teapot", description: "RFC 2324, joke status" },
  422: {
    name: "Unprocessable Entity",
    description: "WebDAV, validation error",
  },
  425: {
    name: "Too Early",
    description: "Retry later, avoiding replay attacks",
  },
  426: { name: "Upgrade Required", description: "Client must switch protocol" },
  428: {
    name: "Precondition Required",
    description: "Require conditional request",
  },
  429: { name: "Too Many Requests", description: "Rate limiting" },
  431: {
    name: "Request Header Fields Too Large",
    description: "Headers too large",
  },
  451: {
    name: "Unavailable For Legal Reasons",
    description: "Legal restrictions",
  },

  // 5xx Server Errors
  500: { name: "Internal Server Error", description: "Generic server error" },
  501: {
    name: "Not Implemented",
    description: "Server does not support functionality",
  },
  502: {
    name: "Bad Gateway",
    description: "Invalid response from upstream server",
  },
  503: {
    name: "Service Unavailable",
    description: "Server overloaded or down",
  },
  504: { name: "Gateway Timeout", description: "Upstream server timeout" },
  505: {
    name: "HTTP Version Not Supported",
    description: "Version unsupported",
  },
  506: {
    name: "Variant Also Negotiates",
    description: "Transparent content negotiation",
  },
  507: {
    name: "Insufficient Storage",
    description: "WebDAV, server storage full",
  },
  508: { name: "Loop Detected", description: "WebDAV, loop detected" },
  510: { name: "Not Extended", description: "Further extensions required" },
  511: {
    name: "Network Authentication Required",
    description: "Requires network authentication",
  },
};
