from pathlib import Path
import base64, json
stag = Path(__file__).resolve().parent
mapping = {
    "dune-bg-composed.jpg": "static/images/bg/dune-bg-composed.jpg",
    "dune-poster.jpg": "static/images/bg/dune-poster.jpg",
    "architecture-chronicles.jpg": "static/images/series/architecture-chronicles.jpg",
    "wardley-maps.jpg": "static/images/series/wardley-maps.jpg",
}
root = stag.parents[1]
for meta in stag.glob("*.meta.json"):
    m = json.loads(meta.read_text())
    name = m["name"]
    stem = name[:-4] if name.endswith(".b64") else name
    parts = sorted(stag.glob(stem + ".part*.txt"))
    assert len(parts) == m["parts"], (name, len(parts), m["parts"])
    data = base64.b64decode("".join(p.read_text() for p in parts))
    if stem in mapping:
        dest = root / mapping[stem]
    elif stem.endswith(".png"):
        dest = root / "static/images/books" / stem
    else:
        raise SystemExit("unknown " + stem)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    print("wrote", dest.relative_to(root), len(data))
