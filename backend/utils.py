import fitz  # PyMuPDF
from docx import Document
from io import BytesIO

def extract_text_from_pdf(file_bytes):
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def extract_text_from_docx(file_bytes):
    file_stream = BytesIO(file_bytes)
    document = Document(file_stream)
    text = "\n".join([para.text for para in document.paragraphs])
    return text

def extract_from_any(filename, file_bytes):
    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif filename.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    else:
        return file_bytes.decode("utf-8")
