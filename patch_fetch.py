import codecs

with codecs.open("frontend/src/main.jsx", "r", "utf-8") as f:
    code = f.read()

new_fetch = """const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  config = config || {};
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.token) {
        config.headers = {
          ...config.headers,
          "Authorization": `Bearer ${user.token}`
        };
      }
    } catch (e) {}
  }
  
  const res = await originalFetch(resource, config);
  
  if (res.status === 401 && resource !== "/api/login") {
    // Token invalid or missing, clear auth and redirect
    localStorage.removeItem("user");
    window.location.href = "/";
  }
  
  return res;
};"""

# Replace the old fetch interceptor
start_idx = code.find("const originalFetch = window.fetch;")
end_idx = code.find("};", start_idx) + 2

code = code[:start_idx] + new_fetch + code[end_idx:]

with codecs.open("frontend/src/main.jsx", "w", "utf-8") as f:
    f.write(code)
print("done")

