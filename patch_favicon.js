const fs = require("fs");
let html = fs.readFileSync("frontend/index.html", "utf-8");
html = html.replace("<link rel=\"icon\" type=\"image/svg+xml\" href=\"/favicon.svg\" />", "<link rel=\"icon\" type=\"image/png\" href=\"/assets/tckt_logo.png\" />");
html = html.replace("<title>frontend</title>", "<title>H? th?ng ph?ng v?n TCKT</title>");
fs.writeFileSync("frontend/index.html", html);
console.log("done");

