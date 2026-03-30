# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS  # add this
from pdf2image import convert_from_bytes
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
import base64


app = Flask(__name__)
CORS(app)  # add this


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/ocr', methods=['POST'])
def ocr():
    try:
        data = request.get_json()

        if not data or 'pdf' not in data:
            return jsonify({'error': 'No PDF data provided'}), 400

        # Decode base64 PDF
        pdf_bytes = base64.b64decode(data['pdf'])

        # Convert PDF pages to images (requires poppler)
        images = convert_from_bytes(
            pdf_bytes,
            dpi=500,  # Higher DPI = better accuracy
            fmt='PNG'
        )

        # Run OCR on each page
        pages = []
        full_text = ''

        for i, image in enumerate(images):
            page_text = pytesseract.image_to_string(
                image,
                lang='eng',  # Change for other languages
                config='--psm 3'  # Auto page segmentation
            )
            pages.append({
                'page': i + 1,
                'text': page_text
            })
            full_text += f"\n--- Page {i + 1} ---\n{page_text}"

        return jsonify({
            'success': True,
            'pageCount': len(images),
            'fullText': full_text.strip(),
            'pages': pages
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
