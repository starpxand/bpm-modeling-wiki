"""Мини-библиотека для диаграмм в SVG: фигуры, ломаные стрелки, подписи в несколько строк."""
from __future__ import annotations

from html import escape

NAVY, BLUE, ORANGE, AMBER, INK, MUTED, PAPER, SOFT = (
    "#0b1b3f", "#2f5bea", "#ff8a3d", "#b45309", "#0f172a", "#5b6477", "#ffffff", "#f6f8fc")
FONT = "Inter, 'Segoe UI', Arial, sans-serif"
import os
TEXT_SCALE = float(os.environ.get("TEXT_SCALE", "1"))  # крупный текст для слайдов


def _lines(text: str) -> list[str]:
    return text.split("\n")


class Svg:
    def __init__(self, uid: str, w: int, h: int, title: str):
        self.uid, self.w, self.h, self.title = uid, w, h, title
        self.parts: list[str] = []

    def add(self, s: str) -> None:
        self.parts.append(s)

    # ---------- текст ----------
    def text(self, x, y, text, size=14, weight=400, anchor="start", fill=INK, cls="t", italic=False, lh=1.25):
        lines = _lines(text)
        size = size * TEXT_SCALE
        dy0 = -(len(lines) - 1) * size * lh / 2 if anchor == "middle" and cls != "nody" else 0
        style = f'font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"'
        if italic:
            style += ' font-style="italic"'
        spans = "".join(f'<tspan x="{x}" dy="{(dy0 if i == 0 else size * lh):.1f}">{escape(l)}</tspan>'
                        for i, l in enumerate(lines))
        self.add(f'<text class="{cls}" x="{x}" y="{y}" {style} dominant-baseline="middle">{spans}</text>')

    def label(self, x, y, text, size=12.5, anchor="middle", fill=INK, bg=True, italic=False):
        """Подпись стрелки с белой подложкой."""
        lines = _lines(text)
        if bg:
            size_px = size * TEXT_SCALE
            w = max(len(l) for l in lines) * size_px * 0.56 + 8
            h = len(lines) * size_px * 1.25 + 4
            x0 = x - w / 2 if anchor == "middle" else (x - 4 if anchor == "start" else x - w + 4)
            self.add(f'<rect class="lbg" x="{x0:.1f}" y="{y - h / 2:.1f}" width="{w:.1f}" height="{h:.1f}" '
                     f'rx="4" fill="{PAPER}" fill-opacity="0.92"/>')
        self.text(x, y, text, size=size, anchor=anchor, fill=fill, italic=italic, cls="lt")

    # ---------- фигуры ----------
    def rect(self, x, y, w, h, rx=0, fill=PAPER, stroke=NAVY, sw=2, cls="n", extra=""):
        self.add(f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" '
                 f'stroke="{stroke}" stroke-width="{sw}" {extra}/>')

    def circle(self, cx, cy, r, fill=PAPER, stroke=NAVY, sw=2, cls="n"):
        self.add(f'<circle class="{cls}" cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def poly(self, pts, fill=PAPER, stroke=NAVY, sw=2, cls="n"):
        p = " ".join(f"{x},{y}" for x, y in pts)
        self.add(f'<polygon class="{cls}" points="{p}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def line(self, x1, y1, x2, y2, stroke=NAVY, sw=2, cls="e", dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<line class="{cls}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def path(self, pts, stroke=NAVY, sw=2, arrow=True, cls="e", dash=None, bridges=(), packet=False):
        """Ломаная стрелка; bridges – точки (x, y), где линия перепрыгивает через другую."""
        d = f"M{pts[0][0]},{pts[0][1]}"
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            for bx, by in bridges:
                if y0 == y1 == by and min(x0, x1) < bx < max(x0, x1):
                    s = 1 if x1 > x0 else -1
                    d += f" L{bx - 7 * s},{by} A7,7 0 0 {1 if s > 0 else 0} {bx + 7 * s},{by}"
                if x0 == x1 == bx and min(y0, y1) < by < max(y0, y1):
                    s = 1 if y1 > y0 else -1
                    d += f" L{bx},{by - 7 * s} A7,7 0 0 {0 if s > 0 else 1} {bx},{by + 7 * s}"
            d += f" L{x1},{y1}"
        m = f' marker-end="url(#{self.uid}-a{self._mk(stroke)})"' if arrow else ""
        da = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<path class="{cls}" d="{d}" fill="none" stroke="{stroke}" stroke-width="{sw}" '
                 f'stroke-linejoin="round"{da}{m}/>')
        if packet:  # «пакет данных», бегущий по потоку (нотацию линии не меняет)
            length = sum(abs(x1 - x0) + abs(y1 - y0) for (x0, y0), (x1, y1) in zip(pts, pts[1:]))
            dur = max(1.6, length / 140)
            self.packets = getattr(self, "packets", 0) + 1
            self.add(f'<circle class="pkt" r="4.5" fill="{ORANGE}" stroke="#fff" stroke-width="1.5">'
                     f'<animateMotion dur="{dur:.1f}s" begin="{(self.packets * 0.37) % 2:.2f}s" '
                     f'repeatCount="indefinite" path="{d}"/></circle>')

    _markers: dict

    def _mk(self, color):
        if not hasattr(self, "_markers"):
            self._markers = {}
        if color not in self._markers:
            self._markers[color] = len(self._markers)
        return self._markers[color]

    # ---------- сборка ----------
    def render(self, extra_css: str = "") -> str:
        markers = "".join(
            f'<marker id="{self.uid}-a{i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
            f'orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{c}"/></marker>'
            for c, i in getattr(self, "_markers", {}).items())
        css = (".e{stroke-linecap:round}"
               "@media (prefers-reduced-motion:reduce){.pkt{display:none}}" + extra_css)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" width="{self.w}" '
                f'height="{self.h}" font-family="{FONT}" role="img" aria-label="{escape(self.title)}" '
                f'class="lh-svg">\n<title>{escape(self.title)}</title>\n<defs>{markers}<style>{css}</style></defs>\n'
                f'<rect width="{self.w}" height="{self.h}" fill="{PAPER}"/>\n' + "\n".join(self.parts) + "\n</svg>\n")
