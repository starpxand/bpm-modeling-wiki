"""BPMN 2.0: «Обработка заказа в интернет-магазине» – файл .bpmn и SVG, отрисованный движком bpmn-js.

Запуск: python tools/build_bpmn.py  →  docs/assets/order_process.bpmn, docs/assets/img/bpmn_order.svg
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, r"D:\Projects\logihub\_tools\mindmap")
from bpmn_snippets import BPMN_JS, CSS, Diagram  # noqa: E402

ROOT = Path(__file__).resolve().parents[1] / "docs" / "assets"


def model() -> Diagram:
    d = Diagram()
    P = "Order"
    lanes = [("Клиент", 0, 150, []), ("Менеджер магазина", 150, 190, []), ("Склад", 340, 180, []),
             ("Служба доставки", 520, 180, [])]
    d.pool(P, "Обработка заказа в интернет-магазине", -30, 0, 2230, 700, lanes=lanes)
    L = {name: mem for name, _, _, mem in lanes}

    def el(lane, *a, **k):
        e = d.el(P, *a, **k)
        L[lane].append(e)
        return e

    def f(a, b, pts, name="", **k):
        return d.flow(P, a, b, pts, name=name, **k)

    # клиент
    s0 = el("Клиент", "start", "Нужен\nтовар", 60, 57)
    c1 = el("Клиент", "task:user", "Оформить\nзаказ", 140, 35)
    do = el("Клиент", "data", "Заказ", 310, 20)
    c2 = el("Клиент", "task:user", "Оплатить\nсчёт", 680, 35)
    c3 = el("Клиент", "task:user", "Принять\nзаказ", 1520, 35)
    gc = el("Клиент", "gw:xor", "Есть\nпретензии?", 1660, 50, lbl=(1650, 8, 70, 27))
    # менеджер
    m1 = el("Менеджер магазина", "task:user", "Проверить\nналичие", 300, 160)
    st = el("Менеджер магазина", "store", "БД заказов", 330, 270)
    g1 = el("Менеджер магазина", "gw:xor", "Товар\nв наличии?", 450, 175, lbl=(440, 147, 70, 27))
    m2 = el("Менеджер магазина", "task:send", "Выставить\nсчёт", 540, 160)
    mn = el("Менеджер магазина", "task:send", "Сообщить\nоб отсутствии", 540, 255)
    en = el("Менеджер магазина", "end", "Заказ\nотклонён", 690, 277)
    ge = el("Менеджер магазина", "gw:event", "", 790, 175)
    mc = el("Менеджер магазина", "icatch", "Оплата\nпоступила", 880, 182, ev="message")
    tc = el("Менеджер магазина", "icatch", "3 дня", 880, 277, ev="timer")
    ec = el("Менеджер магазина", "end", "Заказ\nотменён", 960, 277)
    mr = el("Менеджер магазина", "task:user", "Оформить\nвозврат", 1720, 160)
    gm = el("Менеджер магазина", "gw:xor", "", 1880, 175)
    mz = el("Менеджер магазина", "task:user", "Закрыть\nзаказ", 1960, 160)
    ez = el("Менеджер магазина", "end", "Заказ\nвыполнен", 2110, 182)
    # склад
    ga = el("Склад", "gw:and", "", 960, 402)
    s1 = el("Склад", "task:manual", "Собрать\nтовар", 1040, 345)
    s2 = el("Склад", "task:user", "Подготовить\nдокументы", 1040, 430)
    gj = el("Склад", "gw:and", "", 1180, 402)
    s3 = el("Склад", "task:manual", "Передать\nв доставку", 1260, 387)
    # доставка
    d1 = el("Служба доставки", "task:manual", "Доставить\nзаказ", 1400, 545)
    bt = el("Служба доставки", "boundary", "Задержка", 1443, 607, ev="timer",
            attrs=f'attachedToRef="{d1}" cancelActivity="false"', lbl=(1390, 640, 50, 14))
    d2 = el("Служба доставки", "task:send", "Уведомить клиента\nо задержке", 1540, 615)
    e2 = el("Служба доставки", "end", "Клиент\nуведомлён", 1690, 637)

    f(s0, c1, [(96, 75), (140, 75)])
    f(c1, m1, [(250, 75), (275, 75), (275, 200), (300, 200)])
    d.flow(P, c1, do, [(250, 55), (310, 45)], assoc=True)
    d.flow(P, m1, st, [(355, 240), (355, 270)], assoc=True)
    f(m1, g1, [(410, 200), (450, 200)])
    f(g1, m2, [(500, 200), (540, 200)], "Да", lbl=(508, 182, 20, 14))
    f(g1, mn, [(475, 225), (475, 295), (540, 295)], "Нет", lbl=(480, 262, 24, 14))
    f(mn, en, [(650, 295), (690, 295)])
    f(m2, c2, [(650, 200), (665, 200), (665, 75), (680, 75)])
    f(c2, ge, [(790, 75), (815, 75), (815, 175)])
    f(ge, mc, [(840, 200), (880, 200)])
    f(ge, tc, [(815, 225), (815, 295), (880, 295)])
    f(tc, ec, [(916, 295), (960, 295)])
    f(mc, ga, [(916, 200), (940, 200), (940, 427), (960, 427)])
    f(ga, s1, [(985, 402), (985, 385), (1040, 385)])
    f(ga, s2, [(985, 452), (985, 470), (1040, 470)])
    f(s1, gj, [(1150, 385), (1205, 385), (1205, 402)])
    f(s2, gj, [(1150, 470), (1205, 470), (1205, 452)])
    f(gj, s3, [(1230, 427), (1260, 427)])
    f(s3, d1, [(1370, 427), (1385, 427), (1385, 585), (1400, 585)])
    f(bt, d2, [(1461, 643), (1461, 655), (1540, 655)])
    f(d2, e2, [(1650, 655), (1690, 655)])
    f(d1, c3, [(1455, 545), (1455, 75), (1520, 75)])
    f(c3, gc, [(1630, 75), (1660, 75)])
    f(gc, mr, [(1685, 100), (1685, 200), (1720, 200)], "Да", lbl=(1690, 140, 20, 14))
    f(gc, gm, [(1710, 75), (1905, 75), (1905, 175)], "Нет", lbl=(1790, 58, 24, 14))
    f(mr, gm, [(1830, 200), (1880, 200)])
    f(gm, mz, [(1930, 200), (1960, 200)])
    f(mz, ez, [(2070, 200), (2110, 200)])
    for i, (name, *rest) in enumerate(d.procs[P]["lanes"]):
        lane_name = rest[0]
        d.procs[P]["lanes"][i] = (name, lane_name, *rest[1:5], L[lane_name])
    return d


def main():
    xml = model().xml()
    (ROOT / "order_process.bpmn").write_text(xml, encoding="utf-8")
    from playwright.sync_api import sync_playwright
    links = "".join(f'<link rel="stylesheet" href="{c}">' for c in CSS)
    page = ROOT.parent.parent / "tools" / "_render.html"
    page.write_text(f'<html><head>{links}</head><body style="margin:0"><div id="c" style="width:1800px;height:900px">'
                    f'</div><script src="{BPMN_JS}"></script><script>window.v=new BpmnJS({{container:"#c"}});'
                    'window.R=async(x)=>{try{const r=await v.importXML(x);const s=(await v.saveSVG()).svg;'
                    'return JSON.stringify({svg:s,warn:r.warnings.map(w=>w.message)})}catch(e){return JSON.stringify({err:e.message})}}'
                    '</script></body></html>', encoding="utf-8")
    import json
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")
        pg = b.new_page()
        pg.goto(page.as_uri()); pg.wait_for_function("!!window.R")
        res = json.loads(pg.evaluate("x => R(x)", xml))
        b.close()
    page.unlink()
    if "err" in res:
        raise SystemExit("bpmn-js: " + res["err"])
    print("предупреждения bpmn-js:", res["warn"])
    (ROOT / "img" / "bpmn_order.svg").write_text(res["svg"], encoding="utf-8")
    print("ok")


if __name__ == "__main__":
    main()
