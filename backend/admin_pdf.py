"""
PDF generators for admin — pending-orders summary, address slip(s), invoice.
Uses reportlab (server-side, no headless browser).
"""
import io
import json
from datetime import datetime
from pathlib import Path
from reportlab.lib.pagesizes import A4, LETTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, KeepTogether
)

CONFIG_DIR = Path(__file__).parent / "config"


def _company() -> dict:
    with open(CONFIG_DIR / "company.json", "r", encoding="utf-8") as f:
        return json.load(f)


def _rs(n) -> str:
    return f"Rs.{int(float(n))}"


# ---------------------------------------------------------------- Address(es)
def build_addresses_pdf(orders: list[dict]) -> bytes:
    """Print one address per page for each order, separated by solid line
    with extra spacing. Suitable for shipping labels."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=18 * mm, bottomMargin=18 * mm,
        title="Shipping Addresses",
    )
    styles = getSampleStyleSheet()
    company = _company()

    title_style = ParagraphStyle(
        "AddrTitle", parent=styles["Heading2"],
        fontName="Helvetica-Bold", fontSize=14, spaceAfter=4,
        textColor=colors.HexColor("#174C2B"),
    )
    from_style = ParagraphStyle(
        "From", parent=styles["Normal"], fontSize=9,
        textColor=colors.HexColor("#6B5A46"), spaceAfter=8,
    )
    to_label = ParagraphStyle(
        "ToLabel", parent=styles["Normal"], fontSize=10,
        textColor=colors.HexColor("#6B5A46"),
        fontName="Helvetica-Bold", spaceAfter=6,
    )
    to_body = ParagraphStyle(
        "ToBody", parent=styles["Normal"], fontSize=13,
        leading=18, textColor=colors.HexColor("#111111"),
    )
    order_ref = ParagraphStyle(
        "OrderRef", parent=styles["Normal"], fontSize=9,
        textColor=colors.HexColor("#6B5A46"), spaceBefore=8,
    )

    flow = []
    for idx, order in enumerate(orders):
        addr = order.get("address", {})
        block = []
        block.append(Paragraph(company.get("brandName", "HARIRAM'S"), title_style))
        block.append(Paragraph(
            f"{company.get('address','')} &nbsp;|&nbsp; {company.get('customerCare','')}",
            from_style,
        ))
        block.append(HRFlowable(width="100%", color=colors.HexColor("#D89B22"), thickness=1))
        block.append(Spacer(1, 8 * mm))
        block.append(Paragraph("SHIP TO:", to_label))
        lines = [
            addr.get("name", ""),
            addr.get("line1", ""),
        ]
        if addr.get("line2"): lines.append(addr["line2"])
        if addr.get("landmark"): lines.append(f"Near {addr['landmark']}")
        lines.append(f"{addr.get('city','')}, {addr.get('state','')} - {addr.get('pincode','')}")
        lines.append(f"Phone: +91-{order.get('phone','')}")
        for ln in lines:
            block.append(Paragraph(ln, to_body))
        block.append(Paragraph(
            f"Order: <b>{order.get('orderNumber','')}</b>",
            order_ref,
        ))
        flow.append(KeepTogether(block))

        # Separator between addresses (except after last)
        if idx < len(orders) - 1:
            flow.append(Spacer(1, 14 * mm))
            flow.append(HRFlowable(width="100%", color=colors.HexColor("#3B2414"), thickness=1.6))
            flow.append(Spacer(1, 14 * mm))

    doc.build(flow)
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
    big_num = ParagraphStyle("Big", parent=styles["Normal"], fontSize=13,
                             fontName="Helvetica-Bold",
                             textColor=colors.HexColor("#174C2B"))

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
