// utils\searchParams.js

export default {
  updateOne: (key, value, route) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    route.push(`${window.location.pathname}?${params.toString()}`);
  },
};
