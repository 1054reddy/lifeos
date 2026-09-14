from pathlib import Path

from pypdf import PdfReader


def extract_pdf_text(file_path: str | Path) -> str:
    """
    Extract text from all pages of a PDF.

    Returns an empty string when the PDF contains no
    extractable text, such as a scanned/image-only PDF.
    """
    reader = PdfReader(file_path)

    pages_text: list[str] = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            cleaned_text = text.strip()

            if cleaned_text:
                pages_text.append(cleaned_text)

    return "\n\n".join(pages_text)