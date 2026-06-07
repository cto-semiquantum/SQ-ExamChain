import fitz  # PyMuPDF
import json
from io import BytesIO

def add_fingerprint_to_pdf(pdf_bytes: bytes, center_id: int, timestamp: str, download_id: int) -> bytes:
    """
    Injects a hidden fingerprint into the PDF.
    We embed this as document metadata for robustness, and also add an invisible text stamp.
    """
    doc = fitz.open("pdf", pdf_bytes)
    
    fingerprint_data = {
        "center_id": center_id,
        "timestamp": timestamp,
        "download_id": download_id
    }
    fingerprint_json = json.dumps(fingerprint_data)

    # 1. Add to metadata
    metadata = doc.metadata
    metadata["keywords"] = fingerprint_json
    doc.set_metadata(metadata)

    # 2. Add invisible text to the first page (as a fallback)
    if len(doc) > 0:
        page = doc[0]
        # Insert text with white color to blend with white background, or transparent
        # In fitz, we can set text color to (1,1,1) (white) so it's not visible
        page.insert_text(fitz.Point(10, 10), fingerprint_json, fontsize=2, color=(1, 1, 1))

    out_bytes = doc.write()
    doc.close()
    return out_bytes

def extract_fingerprint_from_pdf(pdf_bytes: bytes) -> dict:
    """
    Extracts the hidden fingerprint from the PDF metadata.
    """
    try:
        doc = fitz.open("pdf", pdf_bytes)
        metadata = doc.metadata
        keywords = metadata.get("keywords", "")
        
        # fallback: search first page text if metadata is stripped
        if not keywords and len(doc) > 0:
            page = doc[0]
            text = page.get_text()
            # Try to find JSON-like structure
            import re
            match = re.search(r'\{"center_id".+?\}', text)
            if match:
                keywords = match.group(0)

        doc.close()
        
        if keywords:
            return json.loads(keywords)
    except Exception as e:
        print(f"Error extracting fingerprint: {e}")
    
    return None
