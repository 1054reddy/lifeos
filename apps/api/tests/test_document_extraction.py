from pathlib import Path

from pypdf import PdfWriter

from app.services.document_extraction import extract_pdf_text


def create_blank_pdf(path: Path) -> None:
    writer = PdfWriter()

    writer.add_blank_page(
        width=612,
        height=792,
    )

    with path.open("wb") as file:
        writer.write(file)


def create_text_pdf(path: Path) -> None:
    stream = (
        "BT\n"
        "/F1 12 Tf\n"
        "72 720 Td\n"
        "(LifeOS Document Test) Tj\n"
        "0 -20 Td\n"
        "(Hello from PDF extraction.) Tj\n"
        "ET"
    ).encode("latin-1")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        (
            b"<< /Type /Page "
            b"/Parent 2 0 R "
            b"/MediaBox [0 0 612 792] "
            b"/Resources << /Font << /F1 5 0 R >> >> "
            b"/Contents 4 0 R >>"
        ),
        (
            f"<< /Length {len(stream)} >>\n"
        ).encode()
        + b"stream\n"
        + stream
        + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]

    for object_number, object_data in enumerate(objects, start=1):
        offsets.append(len(pdf))

        pdf.extend(
            f"{object_number} 0 obj\n".encode()
        )
        pdf.extend(object_data)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)

    pdf.extend(
        f"xref\n0 {len(objects) + 1}\n".encode()
    )
    pdf.extend(b"0000000000 65535 f \n")

    for offset in offsets[1:]:
        pdf.extend(
            f"{offset:010d} 00000 n \n".encode()
        )

    pdf.extend(
        (
            f"trailer\n"
            f"<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            f"startxref\n"
            f"{xref_offset}\n"
            f"%%EOF\n"
        ).encode()
    )

    path.write_bytes(pdf)


def test_extract_pdf_text_returns_empty_for_blank_pdf(
    tmp_path: Path,
) -> None:
    pdf_path = tmp_path / "blank.pdf"

    create_blank_pdf(pdf_path)

    result = extract_pdf_text(pdf_path)

    assert result == ""


def test_extract_pdf_text_extracts_text_from_pdf(
    tmp_path: Path,
) -> None:
    pdf_path = tmp_path / "text.pdf"

    create_text_pdf(pdf_path)

    result = extract_pdf_text(pdf_path)

    assert "LifeOS Document Test" in result
    assert "Hello from PDF extraction." in result