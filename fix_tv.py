import codecs
with codecs.open("frontend/src/pages/TvView.jsx", "r", "utf-8") as f:
    code = f.read()

code = code.replace(
    """className="w-full max-w-[95%] h-[120%] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] scale-110\"""",
    """className="w-full h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] scale-[3] pointer-events-none origin-center\""""
)

with codecs.open("frontend/src/pages/TvView.jsx", "w", "utf-8") as f:
    f.write(code)
print("done")

