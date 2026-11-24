import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

styles = getSampleStyleSheet()

BROWN = colors.HexColor("#5a3a22")
CARAMEL = colors.HexColor("#a8743f")

title_style = ParagraphStyle(
    "IDTitle", parent=styles["Title"], textColor=BROWN
)
heading_style = ParagraphStyle(
    "IDHeading", parent=styles["Heading2"], textColor=CARAMEL, spaceBefore=12
)
body_style = ParagraphStyle(
    "IDBody", parent=styles["BodyText"], leading=15
)


def to_markup(text) -> str:
    """Escape AI text for ReportLab (it treats <, > and & as markup) and
    convert **bold** and newlines into ReportLab tags."""

    safe = escape(str(text or "Not available."))
    safe = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", safe)
    safe = re.sub(r"^#+\s*", "", safe, flags=re.MULTILINE)
    return safe.replace("\n", "<br/>")


def generate_notes_pdf(document, output_path):
    pdf = SimpleDocTemplate(
        output_path,
        title=f"{document.filename} - Study Notes",
        author="IntelliDocs AI",
    )

    elements = [
        Paragraph("IntelliDocs AI · Study Notes", title_style),
        Spacer(1, 16),
        Paragraph(f"<b>Document:</b> {escape(document.filename or '')}", body_style),
        Paragraph(f"<b>Subject:</b> {escape(document.subject or '')}", body_style),
        Paragraph(f"<b>Category:</b> {escape(document.category or '')}", body_style),
        Spacer(1, 16),
    ]

    sections = [
        ("Summary", document.summary),
        ("Key Points", document.key_points),
        ("Study Notes", document.notes),
        ("Viva Questions", document.viva_questions),
        ("MCQs", document.mcqs),
    ]

    for title, content in sections:
        elements.append(Paragraph(title, heading_style))
        elements.append(Paragraph(to_markup(content), body_style))
        elements.append(Spacer(1, 12))

    pdf.build(elements)
