const fs = require('fs');
const marked = require('marked');

const mdPath = 'huong_dan_su_dung.md';
const docPath = 'huong_dan_su_dung.doc';

const mdContent = fs.readFileSync(mdPath, 'utf-8');
const htmlContent = marked.parse(mdContent);

const wordHtml = [
  "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>",
  "<head><title>Tài liệu Hướng dẫn sử dụng</title>",
  "<!--[if gte mso 9]>",
  "<xml>",
  "<w:WordDocument>",
  "<w:View>Print</w:View>",
  "<w:Zoom>100</w:Zoom>",
  "<w:DoNotOptimizeForBrowser/>",
  "</w:WordDocument>",
  "</xml>",
  "<![endif]-->",
  "<style>",
  "  body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; }",
  "  h1 { font-size: 20pt; text-align: center; font-weight: bold; }",
  "  h2 { font-size: 16pt; font-weight: bold; margin-top: 20pt; }",
  "  h3 { font-size: 14pt; font-weight: bold; margin-top: 15pt; }",
  "  p { line-height: 1.5; }",
  "  ul, ol { line-height: 1.5; margin-left: 20pt; }",
  "  li { margin-bottom: 5pt; }",
  "  blockquote { background: #f0f0f0; border-left: 3px solid #ccc; padding: 10pt; margin: 10pt 0; font-style: italic; }",
  "</style>",
  "</head>",
  "<body>",
  htmlContent,
  "</body>",
  "</html>"
].join('\\n');

fs.writeFileSync(docPath, wordHtml, 'utf-8');
console.log('Created huong_dan_su_dung.doc successfully');
