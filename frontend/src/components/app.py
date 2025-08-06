from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import PyPDF2
import google.generativeai as genai
from werkzeug.utils import secure_filename
import tempfile

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# ✅ Configure Gemini AI
genai.configure(api_key="AIzaSyBoc8G9zbFUiMRrj_h2xTBAFId0Q55x6so")  # Replace with your key

# Configure upload settings
UPLOAD_FOLDER = tempfile.gettempdir()
ALLOWED_EXTENSIONS = {'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ✅ Function: Extract text from PDF
def extract_text_from_pdf(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page in reader.pages:
                text += page.extract_text()
            return text
    except Exception as e:
        print("❌ Error reading PDF:", e)
        return None

# ✅ Function: Summarize resume using Gemini
def summarize_resume(resume_text):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
You are an AI helping recruiters summarize resumes of job applicants.

Generate a short, structured summary of the following resume:

Resume:
\"\"\"
{resume_text}
\"\"\"

Summary (include Name, Education, Skills, Experience, Roles fit for, Languages, Certifications):
"""
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print("❌ Error generating summary:", e)
        return "Summary generation failed."

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Resume Summarizer API is running"})

@app.route('/api/summarize', methods=['POST'])
def summarize_pdf():
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Check if file is allowed
        if not allowed_file(file.filename):
            return jsonify({"error": "Only PDF files are allowed"}), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(temp_path)
        
        try:
            # Extract text from PDF
            resume_text = extract_text_from_pdf(temp_path)
            
            if not resume_text:
                return jsonify({"error": "Could not extract text from PDF"}), 400
            
            if len(resume_text.strip()) == 0:
                return jsonify({"error": "PDF appears to be empty or contains no readable text"}), 400
            
            # Generate summary
            summary = summarize_resume(resume_text)
            
            return jsonify({
                "success": True,
                "filename": filename,
                "summary": summary,
                "extracted_text_length": len(resume_text)
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({"error": "File too large. Maximum size is 16MB"}), 413

if __name__ == '__main__':
    print("🚀 Starting Resume Summarizer API...")
    print("📋 Available endpoints:")
    print("   GET  /api/health - Health check")
    print("   POST /api/summarize - Upload and summarize PDF resume")
    app.run(debug=True, host='0.0.0.0', port=5000)