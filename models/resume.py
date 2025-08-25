import os
import json
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import speech_recognition as sr
from googletrans import Translator
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.platypus import SimpleDocTemplate
import pandas as pd
import warnings
warnings.filterwarnings('ignore')

class MultilingualResumeBuilder:
    def __init__(self):
        self.translator = Translator()
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
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
        
        # Initialize user data structure
        self.user_data = {
            'personal_info': {},
            'objective': '',
            'education': [],
            'experience': [],
            'skills': [],
            'projects': [],
            'certifications': [],
            'languages': [],
            'hobbies': []
        }
        
        print("🎯 Multilingual Resume Builder Initialized!")
        print("Supported Languages: Hindi, Marathi, English, Gujarati, Bengali, Tamil, Telugu, Kannada")
    
    def detect_language(self, text: str) -> str:
        """Detect the language of input text"""
        try:
            detected = self.translator.detect(text)
            detected_lang = detected.lang
            
            # Map detected language to our supported languages
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
    
    def speech_to_text(self, language: str = 'hindi', timeout: int = 10) -> str:
        """Convert speech to text in specified language"""
        try:
            with self.microphone as source:
                print(f"🎤 Listening in {language.title()}... (Speak now)")
                print("⏰ Speak clearly and wait for the beep")
                self.recognizer.adjust_for_ambient_noise(source)
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=30)
            
            print("🔄 Processing your speech...")
            
            # Convert speech to text
            lang_code = self.language_codes.get(language, 'hi')
            text = self.recognizer.recognize_google(audio, language=lang_code)
            
            print(f"✅ Recognized: {text}")
            return text
            
        except sr.WaitTimeoutError:
            print("❌ No speech detected. Please try again.")
            return ""
        except sr.UnknownValueError:
            print("❌ Could not understand the audio. Please speak clearly.")
            return ""
        except sr.RequestError as e:
            print(f"❌ Error with speech recognition service: {e}")
            return ""
    
    def get_input_method(self) -> str:
        """Ask user for preferred input method"""
        print("\n📝 How would you like to provide your information?")
        print("1. 🎤 Voice Input (Speak in your language)")
        print("2. ⌨️  Text Input (Type in your language)")
        print("3. 📋 Interactive Form (English)")
        
        while True:
            choice = input("\nEnter your choice (1/2/3): ").strip()
            if choice in ['1', '2', '3']:
                return choice
            print("❌ Please enter 1, 2, or 3")
    
    def get_preferred_language(self) -> str:
        """Get user's preferred language"""
        print("\n🌍 Select your preferred language:")
        languages = list(self.language_codes.keys())
        for i, lang in enumerate(languages, 1):
            print(f"{i}. {lang.title()}")
        
        while True:
            try:
                choice = int(input(f"\nEnter choice (1-{len(languages)}): "))
                if 1 <= choice <= len(languages):
                    return languages[choice-1]
                print(f"❌ Please enter a number between 1 and {len(languages)}")
            except ValueError:
                print("❌ Please enter a valid number")
    
    def collect_personal_info(self, input_method: str, language: str) -> Dict:
        """Collect personal information"""
        print(f"\n👤 Personal Information ({language.title()})")
        print("=" * 40)
        
        personal_info = {}
        fields = [
            ('name', 'Full Name / पूरा नाम / पूर्ण नाव'),
            ('email', 'Email Address / ईमेल पता / ईमेल पत्ता'),
            ('phone', 'Phone Number / फोन नंबर / फोन नंबर'),
            ('address', 'Address / पता / पत्ता'),
            ('city', 'City / शहर / शहर'),
            ('state', 'State / राज्य / राज्य'),
            ('pincode', 'PIN Code / पिन कोड / पिन कोड')
        ]
        
        for field, prompt in fields:
            if input_method == '1':  # Voice input
                print(f"\n🎤 Please say your {prompt}")
                text = self.speech_to_text(language)
                if text:
                    # Translate to English for processing
                    english_text = self.translate_text(text, language, 'en')
                    personal_info[field] = english_text
                    print(f"✅ Recorded: {text} -> {english_text}")
                else:
                    personal_info[field] = input(f"⌨️  Fallback - Type your {prompt}: ")
            
            elif input_method == '2':  # Text input
                text = input(f"⌨️  Enter your {prompt}: ")
                if text:
                    # Detect and translate if needed
                    detected_lang = self.detect_language(text)
                    if detected_lang != 'english':
                        english_text = self.translate_text(text, detected_lang, 'en')
                        personal_info[field] = english_text
                        print(f"🔄 Translated: {text} -> {english_text}")
                    else:
                        personal_info[field] = text
            
            else:  # Interactive form
                personal_info[field] = input(f"Enter your {prompt.split('/')[0].strip()}: ")
        
        return personal_info
    
    def collect_career_objective(self, input_method: str, language: str) -> str:
        """Collect career objective"""
        print(f"\n🎯 Career Objective ({language.title()})")
        print("=" * 40)
        print("Describe your career goals and what you want to achieve")
        print("करियर के लक्ष्य और आप क्या हासिल करना चाहते हैं इसका वर्णन करें")
        print("तुमचे करिअर ध्येय आणि तुम्हाला काय साध्य करायचे आहे याचे वर्णन करा")
        
        if input_method == '1':  # Voice input
            print(f"\n🎤 Please speak your career objective in {language}")
            text = self.speech_to_text(language)
            if text:
                english_text = self.translate_text(text, language, 'en')
                print(f"✅ Objective recorded: {english_text}")
                return english_text
            else:
                return input("⌨️  Fallback - Type your career objective: ")
        
        elif input_method == '2':  # Text input
            text = input("⌨️  Enter your career objective: ")
            if text:
                detected_lang = self.detect_language(text)
                if detected_lang != 'english':
                    english_text = self.translate_text(text, detected_lang, 'en')
                    print(f"🔄 Translated: {english_text}")
                    return english_text
                return text
        
        else:  # Interactive form
            return input("Enter your career objective: ")
    
    def collect_education(self, input_method: str, language: str) -> List[Dict]:
        """Collect education information"""
        print(f"\n🎓 Education Details ({language.title()})")
        print("=" * 40)
        
        education_list = []
        
        while True:
            print(f"\n📚 Education Entry {len(education_list) + 1}")
            education = {}
            
            # Fields for education
            fields = [
                ('degree', 'Degree/Qualification / डिग्री/योग्यता / पदवी/पात्रता'),
                ('institution', 'School/College Name / स्कूल/कॉलेज का नाम / शाळा/महाविद्यालयाचे नाव'),
                ('year', 'Year of Completion / पूर्णता का वर्ष / पूर्ण होण्याचे वर्ष'),
                ('percentage', 'Percentage/CGPA / प्रतिशत/सीजीपीए / टक्केवारी/सीजीपीए')
            ]
            
            for field, prompt in fields:
                if input_method == '1':  # Voice input
                    print(f"🎤 Say your {prompt}")
                    text = self.speech_to_text(language)
                    if text:
                        english_text = self.translate_text(text, language, 'en')
                        education[field] = english_text
                    else:
                        education[field] = input(f"⌨️  Type your {prompt}: ")
                
                elif input_method == '2':  # Text input
                    text = input(f"⌨️  Enter {prompt}: ")
                    if text:
                        detected_lang = self.detect_language(text)
                        if detected_lang != 'english':
                            english_text = self.translate_text(text, detected_lang, 'en')
                            education[field] = english_text
                        else:
                            education[field] = text
                
                else:  # Interactive form
                    education[field] = input(f"Enter {prompt.split('/')[0].strip()}: ")
            
            education_list.append(education)
            
            # Ask if user wants to add more education
            more = input("\n➕ Add another education entry? (y/n): ").lower()
            if more != 'y':
                break
        
        return education_list
    
    def collect_experience(self, input_method: str, language: str) -> List[Dict]:
        """Collect work experience"""
        print(f"\n💼 Work Experience ({language.title()})")
        print("=" * 40)
        
        experience_list = []
        
        while True:
            print(f"\n🏢 Experience Entry {len(experience_list) + 1}")
            experience = {}
            
            fields = [
                ('company', 'Company Name / कंपनी का नाम / कंपनीचे नाव'),
                ('position', 'Job Position / नौकरी की स्थिति / नोकरीची स्थिती'),
                ('duration', 'Duration (e.g., 2020-2022) / अवधि / कालावधी'),
                ('description', 'Job Description / नौकरी का विवरण / नोकरीचे वर्णन')
            ]
            
            for field, prompt in fields:
                if input_method == '1':  # Voice input
                    print(f"🎤 Say your {prompt}")
                    text = self.speech_to_text(language)
                    if text:
                        english_text = self.translate_text(text, language, 'en')
                        experience[field] = english_text
                    else:
                        experience[field] = input(f"⌨️  Type {prompt}: ")
                
                elif input_method == '2':  # Text input
                    text = input(f"⌨️  Enter {prompt}: ")
                    if text:
                        detected_lang = self.detect_language(text)
                        if detected_lang != 'english':
                            english_text = self.translate_text(text, detected_lang, 'en')
                            experience[field] = english_text
                        else:
                            experience[field] = text
                
                else:
                    experience[field] = input(f"Enter {prompt.split('/')[0].strip()}: ")
            
            experience_list.append(experience)
            
            more = input("\n➕ Add another work experience? (y/n): ").lower()
            if more != 'y':
                break
        
        return experience_list
    
    def collect_skills(self, input_method: str, language: str) -> List[str]:
        """Collect skills information"""
        print(f"\n🔧 Skills ({language.title()})")
        print("=" * 40)
        print("List your technical and soft skills")
        print("अपने तकनीकी और सॉफ्ट स्किल्स की सूची बनाएं")
        print("तुमची तांत्रिक आणि सॉफ्ट कौशल्यांची यादी करा")
        
        skills = []
        
        if input_method == '1':  # Voice input
            print("🎤 Say all your skills (comma separated)")
            text = self.speech_to_text(language)
            if text:
                english_text = self.translate_text(text, language, 'en')
                skills = [skill.strip() for skill in english_text.split(',')]
            else:
                skills_input = input("⌨️  Type your skills (comma separated): ")
                skills = [skill.strip() for skill in skills_input.split(',')]
        
        elif input_method == '2':  # Text input
            text = input("⌨️  Enter your skills (comma separated): ")
            if text:
                detected_lang = self.detect_language(text)
                if detected_lang != 'english':
                    english_text = self.translate_text(text, detected_lang, 'en')
                    skills = [skill.strip() for skill in english_text.split(',')]
                else:
                    skills = [skill.strip() for skill in text.split(',')]
        
        else:  # Interactive form
            skills_input = input("Enter your skills (comma separated): ")
            skills = [skill.strip() for skill in skills_input.split(',')]
        
        return [skill for skill in skills if skill]  # Remove empty skills
    
    def collect_projects(self, input_method: str, language: str) -> List[Dict]:
        """Collect projects information"""
        print(f"\n🚀 Projects ({language.title()})")
        print("=" * 40)
        
        projects_list = []
        
        while True:
            print(f"\n📁 Project {len(projects_list) + 1}")
            project = {}
            
            fields = [
                ('name', 'Project Name / प्रोजेक्ट का नाम / प्रकल्पाचे नाव'),
                ('description', 'Project Description / प्रोजेक्ट का विवरण / प्रकल्पाचे वर्णन'),
                ('technologies', 'Technologies Used / उपयोग की गई तकनीकें / वापरलेली तंत्रज्ञान'),
                ('duration', 'Duration / अवधि / कालावधी')
            ]
            
            for field, prompt in fields:
                if input_method == '1':  # Voice input
                    print(f"🎤 Say {prompt}")
                    text = self.speech_to_text(language)
                    if text:
                        english_text = self.translate_text(text, language, 'en')
                        project[field] = english_text
                    else:
                        project[field] = input(f"⌨️  Type {prompt}: ")
                
                elif input_method == '2':  # Text input
                    text = input(f"⌨️  Enter {prompt}: ")
                    if text:
                        detected_lang = self.detect_language(text)
                        if detected_lang != 'english':
                            english_text = self.translate_text(text, detected_lang, 'en')
                            project[field] = english_text
                        else:
                            project[field] = text
                
                else:
                    project[field] = input(f"Enter {prompt.split('/')[0].strip()}: ")
            
            projects_list.append(project)
            
            more = input("\n➕ Add another project? (y/n): ").lower()
            if more != 'y':
                break
        
        return projects_list
    
    def collect_all_information(self):
        """Collect all resume information from user"""
        print("🌟 Welcome to Multilingual Resume Builder!")
        print("=" * 50)
        
        # Get input preferences
        input_method = self.get_input_method()
        language = self.get_preferred_language()
        
        print(f"\n✅ Input Method: {'Voice' if input_method == '1' else 'Text' if input_method == '2' else 'Form'}")
        print(f"✅ Language: {language.title()}")
        
        # Collect information
        print("\n🔄 Starting data collection...")
        
        self.user_data['personal_info'] = self.collect_personal_info(input_method, language)
        self.user_data['objective'] = self.collect_career_objective(input_method, language)
        self.user_data['education'] = self.collect_education(input_method, language)
        self.user_data['experience'] = self.collect_experience(input_method, language)
        self.user_data['skills'] = self.collect_skills(input_method, language)
        self.user_data['projects'] = self.collect_projects(input_method, language)
        
        # Optional sections
        add_certs = input("\n📜 Add certifications? (y/n): ").lower() == 'y'
        if add_certs:
            self.user_data['certifications'] = self.collect_simple_list(
                "Certifications", input_method, language
            )
        
        add_languages = input("\n🗣️ Add known languages? (y/n): ").lower() == 'y'
        if add_languages:
            self.user_data['languages'] = self.collect_simple_list(
                "Languages", input_method, language
            )
        
        add_hobbies = input("\n🎨 Add hobbies/interests? (y/n): ").lower() == 'y'
        if add_hobbies:
            self.user_data['hobbies'] = self.collect_simple_list(
                "Hobbies", input_method, language
            )
        
        print("\n✅ All information collected successfully!")
        return language
    
    def collect_simple_list(self, section_name: str, input_method: str, language: str) -> List[str]:
        """Collect simple list items"""
        print(f"\n📝 {section_name}")
        
        if input_method == '1':  # Voice input
            print(f"🎤 Say your {section_name.lower()} (comma separated)")
            text = self.speech_to_text(language)
            if text:
                english_text = self.translate_text(text, language, 'en')
                return [item.strip() for item in english_text.split(',')]
            else:
                text = input(f"⌨️  Type your {section_name.lower()} (comma separated): ")
                return [item.strip() for item in text.split(',')]
        
        elif input_method == '2':  # Text input
            text = input(f"⌨️  Enter your {section_name.lower()} (comma separated): ")
            if text:
                detected_lang = self.detect_language(text)
                if detected_lang != 'english':
                    english_text = self.translate_text(text, detected_lang, 'en')
                    return [item.strip() for item in english_text.split(',')]
                return [item.strip() for item in text.split(',')]
        
        else:
            text = input(f"Enter your {section_name.lower()} (comma separated): ")
            return [item.strip() for item in text.split(',')]
    
    def create_pdf_resume(self, output_language: str = 'english', template: str = 'modern') -> str:
        """Create PDF resume from collected data"""
        
        # Generate filename
        name = self.user_data['personal_info'].get('name', 'Resume')
        filename = f"{name.replace(' ', '_')}_Resume_{output_language}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        # Create PDF document
        doc = SimpleDocTemplate(filename, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
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
        personal = self.user_data['personal_info']
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
        if self.user_data['objective']:
            obj_header = Paragraph(sections['objective'], heading_style)
            story.append(obj_header)
            
            # Translate objective if needed
            objective_text = self.user_data['objective']
            if output_language != 'english':
                objective_text = self.translate_text(objective_text, 'en', self.language_codes[output_language])
            
            obj_para = Paragraph(objective_text, normal_style)
            story.append(obj_para)
            story.append(Spacer(1, 6))
        
        # Education
        if self.user_data['education']:
            edu_header = Paragraph(sections['education'], heading_style)
            story.append(edu_header)
            
            for edu in self.user_data['education']:
                edu_data = [
                    [f"{edu.get('degree', 'N/A')}", f"{edu.get('year', 'N/A')}"],
                    [edu.get('institution', 'N/A'), f"Score: {edu.get('percentage', 'N/A')}"]
                ]
                
                # Translate if needed
                if output_language != 'english':
                    for i in range(len(edu_data)):
                        for j in range(len(edu_data[i])):
                            if not any(char.isdigit() for char in edu_data[i][j]):  # Don't translate numbers
                                edu_data[i][j] = self.translate_text(
                                    edu_data[i][j].replace('<b>', '').replace('</b>', ''), 
                                    'en', self.language_codes[output_language]
                                )
                                if '<b>' in edu_data[i][j] or '</b>' in edu_data[i][j]:
                                    edu_data[i][j] = f"<b>{edu_data[i][j]}</b>"
                
                edu_table = Table(edu_data, colWidths=[4*inch, 2*inch])
                edu_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                ]))
                story.append(edu_table)
            
            story.append(Spacer(1, 6))
        
        # Work Experience
        if self.user_data['experience']:
            exp_header = Paragraph(sections['experience'], heading_style)
            story.append(exp_header)
            
            for exp in self.user_data['experience']:
                company_text = f"<b>{exp.get('company', 'N/A')}</b> - {exp.get('position', 'N/A')}"
                duration_text = f"<i>{exp.get('duration', 'N/A')}</i>"
                
                # Translate if needed
                if output_language != 'english':
                    company_text = self.translate_text(company_text.replace('<b>', '').replace('</b>', ''), 
                                                    'en', self.language_codes[output_language])
                    company_text = f"<b>{company_text.split(' - ')[0]}</b> - {company_text.split(' - ')[1] if ' - ' in company_text else ''}"
                
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
        if self.user_data['skills']:
            skills_header = Paragraph(sections['skills'], heading_style)
            story.append(skills_header)
            
            skills_text = ", ".join(self.user_data['skills'])
            if output_language != 'english':
                skills_text = self.translate_text(skills_text, 'en', self.language_codes[output_language])
            
            skills_para = Paragraph(skills_text, normal_style)
            story.append(skills_para)
            story.append(Spacer(1, 6))
        
        # Projects
        if self.user_data['projects']:
            projects_header = Paragraph(sections['projects'], heading_style)
            story.append(projects_header)
            
            for project in self.user_data['projects']:
                project_name = f"<b>{project.get('name', 'N/A')}</b>"
                duration = project.get('duration', '')
                
                if output_language != 'english':
                    project_name = f"<b>{self.translate_text(project.get('name', 'N/A'), 'en', self.language_codes[output_language])}</b>"
                
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
        
        # Certifications
        if self.user_data['certifications']:
            cert_header = Paragraph(sections['certifications'], heading_style)
            story.append(cert_header)
            
            cert_list = []
            for cert in self.user_data['certifications']:
                if output_language != 'english':
                    cert = self.translate_text(cert, 'en', self.language_codes[output_language])
                cert_list.append(f"• {cert}")
            
            cert_para = Paragraph("<br/>".join(cert_list), normal_style)
            story.append(cert_para)
            story.append(Spacer(1, 6))
        
        # Languages
        if self.user_data['languages']:
            lang_header = Paragraph(sections['languages'], heading_style)
            story.append(lang_header)
            
            lang_text = ", ".join(self.user_data['languages'])
            if output_language != 'english':
                lang_text = self.translate_text(lang_text, 'en', self.language_codes[output_language])
            
            lang_para = Paragraph(lang_text, normal_style)
            story.append(lang_para)
            story.append(Spacer(1, 6))
        
        # Hobbies
        if self.user_data['hobbies']:
            hobby_header = Paragraph(sections['hobbies'], heading_style)
            story.append(hobby_header)
            
            hobby_text = ", ".join(self.user_data['hobbies'])
            if output_language != 'english':
                hobby_text = self.translate_text(hobby_text, 'en', self.language_codes[output_language])
            
            hobby_para = Paragraph(hobby_text, normal_style)
            story.append(hobby_para)
        
        # Build PDF
        try:
            doc.build(story)
            print(f"✅ Resume created successfully: {filename}")
            return filename
        except Exception as e:
            print(f"❌ Error creating PDF: {str(e)}")
            return None
    
    def create_regional_resume(self, regional_language: str) -> str:
        """Create resume in regional language"""
        return self.create_pdf_resume(regional_language, 'modern')
    
    def create_video_audio_resume(self, language: str = 'hindi') -> str:
        """Create audio description of resume"""
        try:
            import pyttsx3
            
            # Initialize text-to-speech engine
            engine = pyttsx3.init()
            
            # Set voice properties
            voices = engine.getProperty('voices')
            for voice in voices:
                if language.lower() in voice.name.lower():
                    engine.setProperty('voice', voice.id)
                    break
            
            engine.setProperty('rate', 150)  # Speed of speech
            engine.setProperty('volume', 0.9)  # Volume level
            
            # Generate audio content
            audio_content = self.generate_audio_content(language)
            
            # Create audio file
            audio_filename = f"{self.user_data['personal_info'].get('name', 'Resume').replace(' ', '_')}_Audio_Resume_{language}.wav"
            engine.save_to_file(audio_content, audio_filename)
            engine.runAndWait()
            
            print(f"🎵 Audio resume created: {audio_filename}")
            return audio_filename
            
        except ImportError:
            print("❌ pyttsx3 not installed. Install it using: pip install pyttsx3")
            return None
        except Exception as e:
            print(f"❌ Error creating audio resume: {str(e)}")
            return None
    
    def generate_audio_content(self, language: str) -> str:
        """Generate content for audio resume"""
        personal = self.user_data['personal_info']
        
        # Create content in English first
        content = f"""
        Hello, my name is {personal.get('name', '')}.
        I am from {personal.get('city', '')}, {personal.get('state', '')}.
        You can contact me at {personal.get('email', '')} or {personal.get('phone', '')}.
        
        My career objective is: {self.user_data['objective']}
        """
        
        # Add education
        if self.user_data['education']:
            content += "\nRegarding my education: "
            for edu in self.user_data['education']:
                content += f"I have completed {edu.get('degree', '')} from {edu.get('institution', '')} in {edu.get('year', '')}. "
        
        # Add experience
        if self.user_data['experience']:
            content += "\nMy work experience includes: "
            for exp in self.user_data['experience']:
                content += f"I worked as {exp.get('position', '')} at {exp.get('company', '')} for {exp.get('duration', '')}. "
        
        # Add skills
        if self.user_data['skills']:
            content += f"\nMy key skills are: {', '.join(self.user_data['skills'])}. "
        
        # Add projects
        if self.user_data['projects']:
            content += "\nI have worked on several projects including: "
            for project in self.user_data['projects']:
                content += f"{project.get('name', '')} using {project.get('technologies', '')}. "
        
        content += "\nThank you for considering my application. I look forward to hearing from you."
        
        # Translate to target language if needed
        if language != 'english':
            content = self.translate_text(content, 'en', self.language_codes[language])
        
        return content
    
    def save_data_json(self, filename: str = None) -> str:
        """Save collected data to JSON file"""
        if not filename:
            name = self.user_data['personal_info'].get('name', 'Resume')
            filename = f"{name.replace(' ', '_')}_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.user_data, f, indent=2, ensure_ascii=False)
            print(f"💾 Data saved to: {filename}")
            return filename
        except Exception as e:
            print(f"❌ Error saving data: {str(e)}")
            return None
    
    def load_data_json(self, filename: str) -> bool:
        """Load data from JSON file"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                self.user_data = json.load(f)
            print(f"📂 Data loaded from: {filename}")
            return True
        except Exception as e:
            print(f"❌ Error loading data: {str(e)}")
            return False
    
    def preview_resume_data(self):
        """Preview collected resume data"""
        print("\n📋 RESUME PREVIEW")
        print("=" * 50)
        
        # Personal Information
        print("\n👤 PERSONAL INFORMATION:")
        personal = self.user_data['personal_info']
        for key, value in personal.items():
            if value:
                print(f"   {key.title()}: {value}")
        
        # Career Objective
        if self.user_data['objective']:
            print(f"\n🎯 CAREER OBJECTIVE:")
            print(f"   {self.user_data['objective']}")
        
        # Education
        if self.user_data['education']:
            print(f"\n🎓 EDUCATION:")
            for i, edu in enumerate(self.user_data['education'], 1):
                print(f"   {i}. {edu.get('degree', 'N/A')} - {edu.get('institution', 'N/A')} ({edu.get('year', 'N/A')})")
        
        # Experience
        if self.user_data['experience']:
            print(f"\n💼 WORK EXPERIENCE:")
            for i, exp in enumerate(self.user_data['experience'], 1):
                print(f"   {i}. {exp.get('position', 'N/A')} at {exp.get('company', 'N/A')} ({exp.get('duration', 'N/A')})")
        
        # Skills
        if self.user_data['skills']:
            print(f"\n🔧 SKILLS:")
            print(f"   {', '.join(self.user_data['skills'])}")
        
        # Projects
        if self.user_data['projects']:
            print(f"\n🚀 PROJECTS:")
            for i, project in enumerate(self.user_data['projects'], 1):
                print(f"   {i}. {project.get('name', 'N/A')} - {project.get('technologies', 'N/A')}")
        
        print("\n" + "=" * 50)
    
    def run_interactive_session(self):
        """Run the complete interactive resume building session"""
        try:
            print("🎉 Starting Multilingual Resume Builder Session")
            print("=" * 60)
            
            # Collect all information
            user_language = self.collect_all_information()
            
            # Preview collected data
            self.preview_resume_data()
            
            # Ask for confirmation
            confirm = input(f"\n✅ Is this information correct? (y/n): ").lower()
            if confirm != 'y':
                print("❌ Please restart and provide correct information.")
                return
            
            # Save data
            json_file = self.save_data_json()
            
            # Ask for output preferences
            print(f"\n📄 RESUME GENERATION OPTIONS:")
            print("1. 🇬🇧 English PDF Resume")
            print("2. 🇮🇳 Regional Language PDF Resume")
            print("3. 🎵 Audio Resume")
            print("4. 📦 All Formats")
            
            choice = input("Select option (1-4): ").strip()
            
            generated_files = []
            
            if choice in ['1', '4']:
                # English PDF
                pdf_file = self.create_pdf_resume('english')
                if pdf_file:
                    generated_files.append(pdf_file)
            
            if choice in ['2', '4']:
                # Regional language PDF
                regional_pdf = self.create_regional_resume(user_language)
                if regional_pdf:
                    generated_files.append(regional_pdf)
            
            if choice in ['3', '4']:
                # Audio resume
                audio_file = self.create_video_audio_resume(user_language)
                if audio_file:
                    generated_files.append(audio_file)
            
            # Summary
            print(f"\n🎊 RESUME GENERATION COMPLETE!")
            print("=" * 40)
            print(f"📊 Generated {len(generated_files)} file(s):")
            for file in generated_files:
                print(f"   ✅ {file}")
            
            if json_file:
                print(f"   💾 Data backup: {json_file}")
            
            print(f"\n💡 Tips:")
            print("• Keep your resume updated regularly")
            print("• Customize for each job application")
            print("• Use the JSON backup to quickly update information")
            print("• Practice your audio resume for interviews")
            
            return generated_files
            
        except KeyboardInterrupt:
            print(f"\n\n👋 Resume building cancelled. Goodbye!")
        except Exception as e:
            print(f"\n❌ Error during session: {str(e)}")
            print("Please try again or contact support.")

# Additional utility functions
def install_dependencies():
    """Install required packages"""
    packages = [
        'SpeechRecognition',
        'googletrans==4.0.0-rc1',
        'reportlab',
        'pyttsx3',
        'pyaudio'  # For microphone input
    ]
    
    print("📦 Installing required packages...")
    for package in packages:
        try:
            import subprocess
            subprocess.check_call(['pip', 'install', package])
            print(f"✅ Installed {package}")
        except:
            print(f"❌ Failed to install {package}")
    
    print("🎯 Installation complete!")

def demo_with_sample_data():
    """Demo function with sample data"""
    builder = MultilingualResumeBuilder()
    
    # Sample data in multiple languages
    builder.user_data = {
        'personal_info': {
            'name': 'राहुल शर्मा',
            'email': 'rahul.sharma@email.com',
            'phone': '+91-9876543210',
            'address': 'जयपुर, राजस्थान',
            'city': 'जयपुर',
            'state': 'राजस्थान',
            'pincode': '302001'
        },
        'objective': 'मैं एक सॉफ्टवेयर डेवलपर के रूप में अपने करियर को आगे बढ़ाना चाहता हूं और नई तकनीकों को सीखना चाहता हूं।',
        'education': [
            {
                'degree': 'कंप्यूटर साइंस में बी.टेक',
                'institution': 'राजस्थान तकनीकी विश्वविद्यालय',
                'year': '2022',
                'percentage': '8.5 CGPA'
            }
        ],
        'experience': [
            {
                'company': 'टेक सॉल्यूशन्स प्राइवेट लिमिटेड',
                'position': 'जूनियर डेवलपर',
                'duration': '2022-2024',
                'description': 'वेब एप्लिकेशन डेवलपमेंट और डेटाबेस मैनेजमेंट का काम किया'
            }
        ],
        'skills': ['पायथन', 'जावा', 'वेब डेवलपमेंट', 'डेटाबेस', 'मशीन लर्निंग'],
        'projects': [
            {
                'name': 'ई-कॉमर्स वेबसाइट',
                'description': 'ऑनलाइन शॉपिंग के लिए एक पूर्ण वेबसाइट बनाई',
                'technologies': 'Python, Django, MySQL',
                'duration': '3 महीने'
            }
        ],
        'certifications': ['पायथन सर्टिफिकेशन', 'वेब डेवलपमेंट कोर्स'],
        'languages': ['हिंदी', 'अंग्रेजी', 'राजस्थानी'],
        'hobbies': ['पढ़ना', 'खेल', 'संगीत']
    }
    
    print("🎭 Running demo with sample Hindi data...")
    
    # Generate resumes
    english_pdf = builder.create_pdf_resume('english')
    hindi_pdf = builder.create_pdf_resume('hindi')
    audio_file = builder.create_video_audio_resume('hindi')
    
    print(f"\n🎉 Demo complete! Generated files:")
    if english_pdf:
        print(f"   📄 English Resume: {english_pdf}")
    if hindi_pdf:
        print(f"   📄 Hindi Resume: {hindi_pdf}")
    if audio_file:
        print(f"   🎵 Audio Resume: {audio_file}")

def main():
    """Main function"""
    print("🌟 MULTILINGUAL RESUME BUILDER")
    print("=" * 50)
    print("1. 🎯 Interactive Resume Builder")
    print("2. 🎭 Demo with Sample Data")
    print("3. 📦 Install Dependencies")
    print("4. ❌ Exit")
    
    choice = input("\nSelect option (1-4): ").strip()
    
    if choice == '1':
        builder = MultilingualResumeBuilder()
        builder.run_interactive_session()
    
    elif choice == '2':
        demo_with_sample_data()
    
    elif choice == '3':
        install_dependencies()
    
    elif choice == '4':
        print("👋 Thank you for using Multilingual Resume Builder!")
    
    else:
        print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main()