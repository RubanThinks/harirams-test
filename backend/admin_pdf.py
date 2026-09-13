"""
PDF generators for admin — pending-orders summary, address stickers, invoice.
Uses reportlab (server-side, no headless browser).

Address stickers:
  Each box shows the brand LOGO (top, centered), a bold TO block (name / lines /
  city / phone) and a bold FROM block (company from company.json).
  Sizing rule:
    - <=3 addresses  -> A5 page (1 col x 3 rows = 3 boxes)
    - 4..6 addresses -> A4 page (2 cols x 3 rows = 6 boxes)
    - >6 addresses   -> greedy: fill A4 pages of 6 first, remainder on final page
                         (A5 if <=3, else A4).
  Deliverable is a single PDF with mixed page sizes.
"""
import io
import json
from datetime import datetime
from pathlib import Path

from reportlab.lib.pagesizes import A4, A5
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)

BACKEND_DIR = Path(__file__).parent
CONFIG_DIR = BACKEND_DIR / "config"
LOGO_PATH = BACKEND_DIR.parent / "frontend" / "public" / "assets" / "logo" / "logo.jpeg"


def _company() -> dict:
    with open(CONFIG_DIR / "company.json", "r", encoding="utf-8") as f:
        return json.load(f)


def _rs(n) -> str:
    return f"Rs.{int(float(n))}"


# ---------------------------------------------------------------- Address(es)
def _plan_pages(order_count: int) -> list[dict]:
    """Return a list of {size: 'A4'|'A5', count: int} describing how the orders
    will be laid out across pages.

    Rule:
      total <= 3            -> 1 page A5
      4 <= total <= 6       -> 1 page A4
      total  > 6            -> repeat A4(6) pages, then remainder:
                                remainder <= 3 -> A5, else A4
    """
    plan: list[dict] = []
    remaining = order_count
    while remaining > 6:
        plan.append({"size": "A4", "count": 6})
        remaining -= 6
    if remaining > 0:
        if remaining <= 3:
            plan.append({"size": "A5", "count": remaining})
        else:
            plan.append({"size": "A4", "count": remaining})
    return plan


def _addr_lines(order: dict) -> list[str]:
    a = order.get("address") or {}
    lines = [a.get("name", "").strip()]
    if a.get("line1"): lines.append(a["line1"].strip())
    if a.get("line2"): lines.append(a["line2"].strip())
    if a.get("landmark"): lines.append(f"Near {a['landmark'].strip()}")
    tail = ", ".join([x for x in [a.get("city", "").strip(), a.get("state", "").strip()] if x])
    pin = (a.get("pincode") or "").strip()
    if tail and pin: lines.append(f"{tail} - {pin}")
    elif tail: lines.append(tail)
    elif pin: lines.append(pin)
    phone = (order.get("phone") or "").strip()
    if phone: lines.append(f"Ph : +91-{phone}")
    return [ln for ln in lines if ln]


def _company_lines(company: dict) -> list[str]:
    lines = [company.get("legalCompanyName") or company.get("brandName") or "HARIRAM'S"]
    if company.get("address"): lines.append(company["address"])
    if company.get("customerCare"): lines.append(f"Ph : {company['customerCare']}")
    return lines


def _draw_box(c: canvas.Canvas, x: float, y: float, w: float, h: float,
              order: dict, company: dict, logo: ImageReader | None):
    """Draw one address sticker inside the rectangle at (x, y) with size (w, h).
    (x, y) is the BOTTOM-LEFT corner of the box in points."""
    inset = 4 * mm
    inner_left = x + inset
    inner_right = x + w - inset
    inner_top = y + h - inset
    inner_bottom = y + inset

    # Outer border
    c.setStrokeColor(colors.HexColor("#3B2414"))
    c.setLineWidth(0.8)
    c.rect(x + 1 * mm, y + 1 * mm, w - 2 * mm, h - 2 * mm, stroke=1, fill=0)

    # Logo (top-center)
    logo_max_h = min(18 * mm, h * 0.22)
    logo_bottom = inner_top - logo_max_h
    if logo is not None:
        try:
            iw, ih = logo.getSize()
            ratio = iw / ih if ih else 1.0
            draw_h = logo_max_h
            draw_w = draw_h * ratio
            max_w = (w - 2 * inset) * 0.6
            if draw_w > max_w:
                draw_w = max_w
                draw_h = draw_w / ratio
            lx = x + (w - draw_w) / 2
            ly = inner_top - draw_h
            c.drawImage(logo, lx, ly, width=draw_w, height=draw_h,
                        preserveAspectRatio=True, mask="auto")
            logo_bottom = ly
        except Exception:
            pass

    # Divider under logo
    div_y = logo_bottom - 2 * mm
    c.setStrokeColor(colors.HexColor("#D89B22"))
    c.setLineWidth(0.6)
    c.line(inner_left, div_y, inner_right, div_y)

    # ---- TO block ----
    text_top = div_y - 3 * mm
    c.setFillColor(colors.HexColor("#111111"))
    label_size = 8.5
    body_size = 9.5
    line_gap = 3.6 * mm

    c.setFont("Helvetica-Bold", label_size)
    c.drawString(inner_left, text_top, "TO:")
    cursor = text_top - line_gap
    c.setFont("Helvetica-Bold", body_size)
    for ln in _addr_lines(order):
        c.drawString(inner_left, cursor, _clip(ln, c, body_size, inner_right - inner_left))
        cursor -= line_gap

    # ---- FROM block ----
    cursor -= 2 * mm
    c.setFont("Helvetica-Bold", label_size)
    c.setFillColor(colors.HexColor("#6B5A46"))
    c.drawString(inner_left, cursor, "FROM:")
    cursor -= line_gap
    c.setFont("Helvetica-Bold", body_size - 0.5)
    c.setFillColor(colors.HexColor("#3B2414"))
    for ln in _company_lines(company):
        c.drawString(inner_left, cursor, _clip(ln, c, body_size - 0.5, inner_right - inner_left))
        cursor -= line_gap

    # Order number footer (bottom-right, small)
    order_no = (order.get("orderNumber") or "").strip()
    if order_no:
        c.setFont("Helvetica-Oblique", 7)
        c.setFillColor(colors.HexColor("#6B5A46"))
        c.drawRightString(inner_right, inner_bottom, f"#{order_no}")


def _clip(text: str, c: canvas.Canvas, font_size: float, max_width: float) -> str:
    """Truncate `text` with ellipsis if it overflows `max_width` at current font."""
    if c.stringWidth(text, "Helvetica-Bold", font_size) <= max_width:
        return text
    # Progressive shortening
    ellipsis = "…"
    while text and c.stringWidth(text + ellipsis, "Helvetica-Bold", font_size) > max_width:
        text = text[:-1]
    return (text + ellipsis) if text else ""


def _draw_page(c: canvas.Canvas, size: str, orders: list[dict], company: dict, logo):
    """Layout `orders` on a single page of the given `size`."""
    if size == "A5":
        c.setPageSize(A5)
        page_w, page_h = A5
        cols, rows = 1, 3
        margin = 8 * mm
    else:
        c.setPageSize(A4)
        page_w, page_h = A4
        cols, rows = 2, 3
        margin = 10 * mm

    gutter = 4 * mm
    grid_w = page_w - 2 * margin
    grid_h = page_h - 2 * margin
    box_w = (grid_w - gutter * (cols - 1)) / cols
    box_h = (grid_h - gutter * (rows - 1)) / rows

    for i, order in enumerate(orders):
        r = i // cols
        col = i % cols
        # Fill top-to-bottom, left-to-right
        bx = margin + col * (box_w + gutter)
        by = page_h - margin - (r + 1) * box_h - r * gutter
        _draw_box(c, bx, by, box_w, box_h, order, company, logo)

    c.showPage()


def build_addresses_pdf(orders: list[dict]) -> bytes:
    """Build a single PDF containing sticker labels for every order in `orders`.
    Pages are A5 or A4 per the rule defined in _plan_pages()."""
    if not orders:
        return b""

    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.setTitle("Shipping Address Stickers")

    company = _company()
    logo: ImageReader | None = None
    try:
        if LOGO_PATH.exists():
            logo = ImageReader(str(LOGO_PATH))
    except Exception:
        logo = None

    plan = _plan_pages(len(orders))
    idx = 0
    for entry in plan:
        chunk = orders[idx: idx + entry["count"]]
        idx += entry["count"]
        _draw_page(c, entry["size"], chunk, company, logo)

    c.save()
    return buf.getvalue()


# ---------------------------------------------------------------- Pending list
def build_pending_orders_pdf(orders: list[dict]) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        rightMargin=12 * mm, leftMargin=12 * mm,
        topMargin=15 * mm, bottomMargin=12 * mm,
        title="Pending Orders",
    )
    styles = getSampleStyleSheet()
    company = _company()
    flow = []
    h1 = ParagraphStyle(
        "H1", parent=styles["Heading1"], fontSize=16,
        textColor=colors.HexColor("#174C2B"), spaceAfter=2,
    )
    sub = ParagraphStyle(
        "Sub", parent=styles["Normal"], fontSize=9,
        textColor=colors.HexColor("#6B5A46"), spaceAfter=8,
    )
    flow.append(Paragraph(f"{company.get('brandName','HARIRAM S')} — Pending Orders", h1))
    flow.append(Paragraph(
        f"Generated {datetime.now().strftime('%d %b %Y, %H:%M')} &nbsp;|&nbsp; Total: {len(orders)} order(s)",
        sub,
    ))
    flow.append(HRFlowable(width="100%", color=colors.HexColor("#D89B22"), thickness=1))
    flow.append(Spacer(1, 6 * mm))

    header = ["Order #", "Customer", "Phone", "City", "Items", "Shipping", "Total"]
    rows = [header]

    for o in orders:
        addr = o.get("address", {})
        items_str = "<br/>".join(
            f"{i.get('variant','')} {i.get('name','')} x {i.get('quantity',1)}"
            for i in o.get("items", [])
        )
        rows.append([
            o.get("orderNumber", ""),
            addr.get("name", ""),
            f"+91 {o.get('phone','')}",
            addr.get("city", ""),
            Paragraph(items_str, styles["BodyText"]),
            _rs(o.get("shipping", 0)),
            _rs(o.get("total", 0)),
        ])

    tbl = Table(
        rows, repeatRows=1,
        colWidths=[26 * mm, 34 * mm, 26 * mm, 22 * mm, 46 * mm, 20 * mm, 22 * mm],
    )
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#174C2B")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#EADFC7")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#FFFDF7"), colors.white]),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))
    flow.append(tbl)
    doc.build(flow)
    return buf.getvalue()


# ---------------------------------------------------------------- Invoice
def build_invoice_pdf(order: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        rightMargin=16 * mm, leftMargin=16 * mm,
        topMargin=16 * mm, bottomMargin=16 * mm,
        title=f"Invoice {order.get('orderNumber','')}",
    )
    styles = getSampleStyleSheet()
    company = _company()
    flow = []
    h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=20,
                        textColor=colors.HexColor("#174C2B"), spaceAfter=0)
    small = ParagraphStyle("S", parent=styles["Normal"], fontSize=9,
                           textColor=colors.HexColor("#6B5A46"))
    label = ParagraphStyle("L", parent=styles["Normal"], fontSize=9,
                           textColor=colors.HexColor("#6B5A46"),
                           fontName="Helvetica-Bold", spaceAfter=2)
    body = ParagraphStyle("B", parent=styles["Normal"], fontSize=10, leading=14)

    flow.append(Paragraph(company.get("brandName", "HARIRAM S"), h1))
    flow.append(Paragraph(
        f"{company.get('legalCompanyName','')} &nbsp;|&nbsp; "
        f"GST: {company.get('gstNumber','')} &nbsp;|&nbsp; "
        f"FSSAI: {company.get('fssaiNumber','')}", small,
    ))
    flow.append(Paragraph(
        f"{company.get('address','')} &nbsp;|&nbsp; {company.get('customerCare','')}",
        small,
    ))
    flow.append(Spacer(1, 6 * mm))
    flow.append(HRFlowable(width="100%", color=colors.HexColor("#D89B22"), thickness=1))
    flow.append(Spacer(1, 6 * mm))

    # Invoice meta table
    addr = order.get("address", {})
    meta = [
        [Paragraph("BILL TO", label),
         Paragraph("INVOICE", label)],
        [Paragraph(
            f"<b>{addr.get('name','')}</b><br/>"
            f"{addr.get('line1','')}"
            f"{', ' + addr['line2'] if addr.get('line2') else ''}<br/>"
            f"{('Near ' + addr['landmark'] + '<br/>') if addr.get('landmark') else ''}"
            f"{addr.get('city','')}, {addr.get('state','')} - {addr.get('pincode','')}<br/>"
            f"Phone: +91-{order.get('phone','')}", body),
         Paragraph(
             f"<b>#{order.get('orderNumber','')}</b><br/>"
             f"Date: {datetime.fromisoformat(order.get('created_at')).strftime('%d %b %Y')}<br/>"
             f"Payment: {order.get('paymentMethod','')}<br/>"
             f"Status: {order.get('paymentStatus','')}", body)],
    ]
    meta_tbl = Table(meta, colWidths=[90 * mm, 80 * mm])
    meta_tbl.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    flow.append(meta_tbl)
    flow.append(Spacer(1, 6 * mm))

    # Line items
    rows = [["#", "Item", "Qty", "Unit Price", "Amount"]]
    for i, it in enumerate(order.get("items", []), 1):
        rows.append([
            str(i),
            f"{it.get('name','')} — {it.get('variant','')}",
            str(it.get("quantity", 0)),
            _rs(it.get("price", 0)),
            _rs(it.get("price", 0) * it.get("quantity", 0)),
        ])
    rows.append(["", "", "", "Subtotal", _rs(order.get("subtotal", 0))])
    rows.append(["", "", "", "Shipping", _rs(order.get("shipping", 0))])
    rows.append(["", "", "", "TOTAL", _rs(order.get("total", 0))])
    tbl = Table(rows, colWidths=[10 * mm, 90 * mm, 15 * mm, 30 * mm, 30 * mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#174C2B")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (2, 1), (-1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -3), 0.4, colors.HexColor("#EADFC7")),
        ("LINEABOVE", (3, -3), (-1, -3), 0.8, colors.HexColor("#3B2414")),
        ("FONTNAME", (3, -1), (-1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (3, -1), (-1, -1), colors.HexColor("#174C2B")),
        ("FONTSIZE", (3, -1), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
    ]))
    flow.append(tbl)
    flow.append(Spacer(1, 8 * mm))
    flow.append(Paragraph(
        "Thank you for choosing Hariram's Pure Cow Ghee. "
        "This is a computer-generated invoice; no signature required.",
        small,
    ))
    doc.build(flow)
    return buf.getvalue()
