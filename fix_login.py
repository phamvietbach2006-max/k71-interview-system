import codecs

with codecs.open("frontend/src/pages/Login.jsx", "r", "utf-8") as f:
    code = f.read()

# Fix min-h-screen to w-full flex-1
code = code.replace(
    """<div className="min-h-screen flex flex-col items-center justify-start md:justify-center bg-slate-50 p-4 font-sans relative overflow-x-hidden overflow-y-auto">""",
    """<div className="flex-1 w-full flex flex-col items-center justify-center bg-slate-50 p-4 font-sans relative overflow-x-hidden overflow-y-auto py-8">"""
)

# Fix dual logos
old_logos = """        {/* Dual Logos */}
        <div className="z-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-12 md:mt-0 mb-8 md:mb-12 w-full px-4">
          <img src="/assets/title_k71.png" alt="Tuyển Thành Viên Ban Tổ Chức - Kiểm Tra" className="w-[85%] max-w-[22rem] md:max-w-none md:w-[24rem] lg:w-[32rem] drop-shadow-2xl transform animate-fade-in-up" />
          <span className="text-6xl md:text-7xl font-black text-white/70 drop-shadow-md animate-fade-in">&amp;</span>
          <img src="/assets/title_bcs.png" alt="Ban Cán sự năm nhất" className="w-[85%] max-w-[22rem] md:max-w-none md:w-[24rem] lg:w-[32rem] drop-shadow-2xl transform animate-fade-in-up animation-delay-100" />
        </div>"""

new_logos = """        {/* Dual Logos */}
        <div className="z-10 flex flex-row items-center justify-center gap-2 md:gap-8 mb-6 md:mb-12 w-full px-4 max-w-2xl">
          <img src="/assets/title_k71.png" alt="Tuyển Thành Viên Ban Tổ Chức - Kiểm Tra" className="w-[45%] md:w-[24rem] lg:w-[32rem] object-contain drop-shadow-2xl transform animate-fade-in-up" />
          <span className="text-3xl md:text-7xl font-black text-white/70 drop-shadow-md animate-fade-in">&amp;</span>
          <img src="/assets/title_bcs.png" alt="Ban Cán sự năm nhất" className="w-[45%] md:w-[24rem] lg:w-[32rem] object-contain drop-shadow-2xl transform animate-fade-in-up animation-delay-100" />
        </div>"""

# Ensure we replace exactly the old_logos block, handling possible text discrepancies with re.sub or exact if matches
if "Dual Logos" in code:
    start_idx = code.find("{/* Dual Logos */}")
    end_idx = code.find("</div>", code.find("<img src=\"/assets/title_bcs.png\"", start_idx)) + 6
    code = code[:start_idx] + new_logos + code[end_idx:]

with codecs.open("frontend/src/pages/Login.jsx", "w", "utf-8") as f:
    f.write(code)
print("done")

