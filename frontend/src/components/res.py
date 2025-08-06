from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import base64
from datetime import datetime
from typing import Dict, List, Optional
import speech_recognition as sr
from googletrans import Translator
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
import warnings
import io
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

class MultilingualResumeBuilder:
    def __init__(self):
        self.translator = Translator()
        self.recognizer = sr.Recognizer()
        
        # Language mappings
        self.language_codes = {
            'hindi': 'hi',
            'marathi': 'mr',
            'english': 'en',
            'gujarati': 'gu',
            'bengali': 'bn',
            'tamil': 'ta',
            'telugu': 'te',
            'kannada': 'kn'
        }
        
        # Resume sections in multiple languages
        self.section_translations = {
            'en': {
                'personal_info': 'Personal Information',
                'objective': 'Career Objective',
                'education': 'Education',
                'experience': 'Work Experience',
                'skills': 'Skills',
                'projects': 'Projects',
                'certifications': 'Certifications',
                'languages': 'Languages',
                'hobbies': 'Interests & Hobbies'
            },
            'hi': {
                'personal_info': 'व्यक्तिगत जानकारी',
                'objective': 'करियर उद्देश्य',
                'education': 'शिक्षा',
                'experience': 'कार्य अनुभव',
                'skills': 'कौशल',
                'projects': 'परियोजनाएं',
                'certifications': 'प्रमाणपत्र',
                'languages': 'भाषाएं',
                'hobbies': 'रुचियां और शौक'
            },
            'mr': {
                'personal_info': 'वैयक्तिक माहिती',
                'objective': 'करिअर उद्दिष्ट',
                'education': 'शिक्षण',
                'experience': 'कामाचा अनुभव',
                'skills': 'कौशल्ये',
                'projects': 'प्रकल्प',
                'certifications': 'प्रमाणपत्रे',
                'languages': 'भाषा',
                'hobbies': 'आवडी आणि छंद'
            }
        }
    
    def detect_language(self, text: str) -> str:
        """Detect the language of input text"""
        try:
            detected = self.translator.detect(text)
            detected_lang = detected.lang
            
            lang_mapping = {
                'hi': 'hindi',
                'mr': 'marathi',
                'en': 'english',
                'gu': 'gujarati',
                'bn': 'bengali',
                'ta': 'tamil',
                'te': 'telugu',
                'kn': 'kannada'
            }
            
            return lang_mapping.get(detected_lang, 'english')
        except:
            return 'english'
    
    def translate_text(self, text: str, source_lang: str = 'auto', target_lang: str = 'en') -> str:
        """Translate text from source language to target language"""
        try:
            if source_lang == 'auto':
                result = self.translator.translate(text, dest=target_lang)
            else:
                result = self.translator.translate(text, src=self.language_codes.get(source_lang, source_lang), dest=target_lang)
            return result.text
        except Exception as e:
            print(f"Translation error: {e}")
            return text
    
    def process_audio_to_text(self, audio_data: bytes, language: str = 'hindi') -> str:
        """Convert audio bytes to text"""
        try:
            # Create audio file from bytes
            audio_file = sr.AudioFile(io.BytesIO(audio_data))
            
            with audio_file as source:
                audio = self.recognizer.record(source)
            
            # Convert speech to text
            lang_code = self.language_codes.get(language, 'hi')
            text = self.recognizer.recognize_google(audio, language=lang_code)
            
            return text
            
        except sr.UnknownValueError:
            return "Could not understand the audio"
        except sr.RequestError as e:
            return f"Error with speech recognition service: {e}"
        except Exception as e:
            return f"Error processing audio: {e}"
    
    def create_pdf_resume(self, user_data: dict, output_language: str = 'english') -> bytes:
        """Create PDF resume from user data and return as bytes"""
        
        # Create PDF document in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            spaceAfter=12,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=6,
            spaceBefore=12,
            textColor=colors.darkblue,
            borderWidth=1,
            borderColor=colors.darkblue,
            borderPadding=3
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            alignment=TA_JUSTIFY
        )
        
        # Get section headers in target language
        sections = self.section_translations.get(self.language_codes.get(output_language, 'en'), 
                                                self.section_translations['en'])
        
        # Header - Personal Information
        personal = user_data.get('personal_info', {})
        name_para = Paragraph(f"<b>{personal.get('name', 'N/A')}</b>", title_style)
        story.append(name_para)
        
        # Contact information
        contact_info = []
        if personal.get('email'):
            contact_info.append(f"📧 {personal['email']}")
        if personal.get('phone'):
            contact_info.append(f"📱 {personal['phone']}")
        if personal.get('address'):
            contact_info.append(f"🏠 {personal['address']}")
        
        if contact_info:
            contact_para = Paragraph(" | ".join(contact_info), normal_style)
            story.append(contact_para)
        
        story.append(Spacer(1, 12))
        
        # Career Objective
        if user_data.get('objective'):
            obj_header = Paragraph(sections['objective'], heading_style)
            story.append(obj_header)
            
            objective_text = user_data['objective']
            if output_language != 'english':
                objective_text = self.translate_text(objective_text, 'en', self.language_codes[output_language])
            
            obj_para = Paragraph(objective_text, normal_style)
            story.append(obj_para)
            story.append(Spacer(1, 6))
        
        # Education
        if user_data.get('education'):
            edu_header = Paragraph(sections['education'], heading_style)
            story.append(edu_header)
            
            for edu in user_data['education']:
                edu_data = [
                    [f"<b>{edu.get('degree', 'N/A')}</b>", f"{edu.get('year', 'N/A')}"],
                    [edu.get('institution', 'N/A'), f"Score: {edu.get('percentage', 'N/A')}"]
                ]
                
                # Translate if needed
                if output_language != 'english':
                    for i in range(len(edu_data)):
                        for j in range(len(edu_data[i])):
                            if not any(char.isdigit() for char in str(edu_data[i][j])):
                                clean_text = str(edu_data[i][j]).replace('<b>', '').replace('</b>', '')
                                translated = self.translate_text(clean_text, 'en', self.language_codes[output_language])
                                if '<b>' in str(edu_data[i][j]):
                                    edu_data[i][j] = f"<b>{translated}</b>"
                                else:
                                    edu_data[i][j] = translated
                
                edu_table = Table(edu_data, colWidths=[4*inch, 2*inch])
                edu_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ]))
                story.append(edu_table)
            
            story.append(Spacer(1, 6))
        
        # Work Experience
        if user_data.get('experience'):
            exp_header = Paragraph(sections['experience'], heading_style)
            story.append(exp_header)
            
            for exp in user_data['experience']:
                company_text = f"<b>{exp.get('company', 'N/A')}</b> - {exp.get('position', 'N/A')}"
                duration_text = f"<i>{exp.get('duration', 'N/A')}</i>"
                
                if output_language != 'english':
                    clean_company = company_text.replace('<b>', '').replace('</b>', '')
                    translated_company = self.translate_text(clean_company, 'en', self.language_codes[output_language])
                    if ' - ' in translated_company:
                        parts = translated_company.split(' - ')
                        company_text = f"<b>{parts[0]}</b> - {parts[1] if len(parts) > 1 else ''}"
                    else:
                        company_text = f"<b>{translated_company}</b>"
                
                company_para = Paragraph(f"{company_text} ({duration_text})", normal_style)
                story.append(company_para)
                
                description = exp.get('description', '')
                if description:
                    if output_language != 'english':
                        description = self.translate_text(description, 'en', self.language_codes[output_language])
                    desc_para = Paragraph(f"• {description}", normal_style)
                    story.append(desc_para)
                
                story.append(Spacer(1, 6))
        
        # Skills
        if user_data.get('skills'):
            skills_header = Paragraph(sections['skills'], heading_style)
            story.append(skills_header)
            
            if isinstance(user_data['skills'], list):
                skills_text = ", ".join(user_data['skills'])
            else:
                skills_text = str(user_data['skills'])
                
            if output_language != 'english':
                skills_text = self.translate_text(skills_text, 'en', self.language_codes[output_language])
            
            skills_para = Paragraph(skills_text, normal_style)
            story.append(skills_para)
            story.append(Spacer(1, 6))
        
        # Projects
        if user_data.get('projects'):
            projects_header = Paragraph(sections['projects'], heading_style)
            story.append(projects_header)
            
            for project in user_data['projects']:
                project_name = f"<b>{project.get('name', 'N/A')}</b>"
                duration = project.get('duration', '')
                
                if output_language != 'english':
                    translated_name = self.translate_text(project.get('name', 'N/A'), 'en', self.language_codes[output_language])
                    project_name = f"<b>{translated_name}</b>"
                
                project_header = f"{project_name} ({duration})" if duration else project_name
                project_para = Paragraph(project_header, normal_style)
                story.append(project_para)
                
                description = project.get('description', '')
                if description:
                    if output_language != 'english':
                        description = self.translate_text(description, 'en', self.language_codes[output_language])
                    desc_para = Paragraph(f"• {description}", normal_style)
                    story.append(desc_para)
                
                technologies = project.get('technologies', '')
                if technologies:
                    if output_language != 'english':
                        technologies = self.translate_text(technologies, 'en', self.language_codes[output_language])
                    tech_para = Paragraph(f"<i>Technologies: {technologies}</i>", normal_style)
                    story.append(tech_para)
                
                story.append(Spacer(1, 6))
        
        # Other sections (certifications, languages, hobbies)
        for section_key in ['certifications', 'languages', 'hobbies']:
            if user_data.get(section_key):
                section_header = Paragraph(sections[section_key], heading_style)
                story.append(section_header)
                
                if isinstance(user_data[section_key], list):
                    section_text = ", ".join(user_data[section_key])
                else:
                    section_text = str(user_data[section_key])
                
                if output_language != 'english':
                    section_text = self.translate_text(section_text, 'en', self.language_codes[output_language])
                
                section_para = Paragraph(section_text, normal_style)
                story.append(section_para)
                story.append(Spacer(1, 6))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

# Initialize the resume builder
resume_builder = MultilingualResumeBuilder()

@app.route('/api/languages', methods=['GET'])
def get_supported_languages():
    """Get supported languages"""
    return jsonify({
        'success': True,
        'languages': list(resume_builder.language_codes.keys())
    })

@app.route('/api/translate', methods=['POST'])
def translate_text():
    """Translate text between languages"""
    try:
        data = request.json
        text = data.get('text', '')
        source_lang = data.get('source_lang', 'auto')
        target_lang = data.get('target_lang', 'en')
        
        if not text:
            return jsonify({'success': False, 'message': 'No text provided'}), 400
        
        translated_text = resume_builder.translate_text(text, source_lang, target_lang)
        detected_lang = resume_builder.detect_language(text) if source_lang == 'auto' else source_lang
        
        return jsonify({
            'success': True,
            'original_text': text,
            'translated_text': translated_text,
            'detected_language': detected_lang,
            'target_language': target_lang
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    """Convert speech to text"""
    try:
        if 'audio' not in request.files:
            return jsonify({'success': False, 'message': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        language = request.form.get('language', 'hindi')
        
        # Read audio data
        audio_data = audio_file.read()
        
        # Convert to text
        text = resume_builder.process_audio_to_text(audio_data, language)
        
        return jsonify({
            'success': True,
            'text': text,
            'language': language
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/detect-language', methods=['POST'])
def detect_language():
    """Detect language of given text"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'success': False, 'message': 'No text provided'}), 400
        
        detected_lang = resume_builder.detect_language(text)
        
        return jsonify({
            'success': True,
            'text': text,
            'detected_language': detected_lang
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/generate-resume', methods=['POST'])
def generate_resume():
    """Generate PDF resume"""
    try:
        data = request.json
        user_data = data.get('user_data', {})
        output_language = data.get('output_language', 'english')
        
        if not user_data:
            return jsonify({'success': False, 'message': 'No user data provided'}), 400
        
        # Generate PDF
        pdf_bytes = resume_builder.create_pdf_resume(user_data, output_language)
        
        # Encode PDF as base64 for JSON response
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        
        # Generate filename
        name = user_data.get('personal_info', {}).get('name', 'Resume')
        filename = f"{name.replace(' ', '_')}_Resume_{output_language}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        return jsonify({
            'success': True,
            'pdf_data': pdf_base64,
            'filename': filename,
            'message': 'Resume generated successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/preview-resume', methods=['POST'])
def preview_resume():
    """Preview resume data"""
    try:
        data = request.json
        user_data = data.get('user_data', {})
        
        if not user_data:
            return jsonify({'success': False, 'message': 'No user data provided'}), 400
        
        # Format preview data
        preview = {
            'personal_info': user_data.get('personal_info', {}),
            'objective': user_data.get('objective', ''),
            'education': user_data.get('education', []),
            'experience': user_data.get('experience', []),
            'skills': user_data.get('skills', []),
            'projects': user_data.get('projects', []),
            'certifications': user_data.get('certifications', []),
            'languages': user_data.get('languages', []),
            'hobbies': user_data.get('hobbies', [])
        }
        
        return jsonify({
            'success': True,
            'preview': preview
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Multilingual Resume Builder API is running',
        'supported_languages': list(resume_builder.language_codes.keys())
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'message': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🌟 Multilingual Resume Builder API Starting...")
    print("📡 API Endpoints:")
    print("   GET  /api/languages - Get supported languages")
    print("   POST /api/translate - Translate text")
    print("   POST /api/speech-to-text - Convert speech to text")
    print("   POST /api/detect-language - Detect text language")
    print("   POST /api/generate-resume - Generate PDF resume")
    print("   POST /api/preview-resume - Preview resume data")
    print("   GET  /api/health - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5000)