import codecs

with codecs.open("frontend/src/components/ChatWidget.jsx", "r", "utf-8") as f:
    code = f.read()

code = code.replace(
    """const res = await fetch("/api/staff");
    const data = await res.json();
    setStaff(data.filter(u => u.username !== currentUser.username));""",
    """const res = await fetch("/api/staff");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) setStaff(data.filter(u => u.username !== currentUser.username));"""
)

code = code.replace(
    """const res = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data);""",
    """const res = await fetch("/api/messages");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) setMessages(data);"""
)

with codecs.open("frontend/src/components/ChatWidget.jsx", "w", "utf-8") as f:
    f.write(code)
print("done")

