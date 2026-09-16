import email
from pypdf import PdfReader

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    try:
        reader = PdfReader(file_path)
        extracted_text = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        return "\n".join(extracted_text).strip()
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def extract_text_from_file(file_path: str, filename: str) -> str:
    """Extract text from PDF, TXT, EML, or DOCX files."""
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    
    if ext == 'pdf':
        return extract_text_from_pdf(file_path)
    elif ext in ['txt', 'log']:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read().strip()
        except Exception as e:
            return f"Error reading text file: {e}"
    elif ext == 'eml':
        try:
            with open(file_path, 'rb') as f:
                msg = email.message_from_binary_file(f)
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == 'text/plain':
                            payload = part.get_payload(decode=True)
                            if isinstance(payload, bytes):
                                body += payload.decode('utf-8', errors='ignore')
                            elif isinstance(payload, str):
                                body += payload
                else:
                    payload = msg.get_payload(decode=True)
                    if isinstance(payload, bytes):
                        body = payload.decode('utf-8', errors='ignore')
                    elif isinstance(payload, str):
                        body = payload
                return body.strip() or str(msg)
        except Exception as e:
            return f"Error reading EML file: {e}"
    else:
        # Fallback to direct string read
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read().strip()
        except Exception:
            return ""