import codecs
with codecs.open("frontend/src/pages/TvView.jsx", "r", "utf-8") as f:
    code = f.read()

# Change Logo to 15% and make it larger within the space
code = code.replace("""className="h-[25%] flex justify-center items-center shrink-0 mb-1\"""", """className="h-[15%] flex justify-center items-center shrink-0 mb-0\"""")
code = code.replace("""className="w-full max-w-[85%] h-full object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]\"""", """className="w-full max-w-[95%] h-[120%] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] scale-110\"""")

# Change Moving to 35%
code = code.replace("""className="h-[25%] flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 border-t border-blue-500/30 pt-2 shrink-0\"""", """className="h-[35%] flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 border-t border-blue-500/30 pt-2 shrink-0\"""")
code = code.replace("""className="h-[25%] flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 border-t border-emerald-500/30 pt-2 shrink-0\"""", """className="h-[35%] flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2 border-t border-emerald-500/30 pt-2 shrink-0\"""")

# Check waiting is 50%
if "h-[50%]" not in code:
    code = code.replace("""className="h-[45%] bg-slate-900/40 rounded-3xl p-4 flex flex-col overflow-hidden mt-2\"""", """className="h-[50%] bg-slate-900/40 rounded-3xl p-4 flex flex-col overflow-hidden mt-2\"""")

with codecs.open("frontend/src/pages/TvView.jsx", "w", "utf-8") as f:
    f.write(code)
print("done")

