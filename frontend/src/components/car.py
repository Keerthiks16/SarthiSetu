from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler, LabelEncoder
import re
import warnings
import os
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class CareerPathRecommender:
    def __init__(self, csv_file_path="job_descriptions.csv"):
        self.csv_file = csv_file_path
        self.df = None
        self.tfidf = None
        self.tfidf_matrix = None
        self.scaler = StandardScaler()
        self.skill_encoder = LabelEncoder()
        self.location_encoder = LabelEncoder()
        self.education_levels = {
            'below_10th': 1, '10th_pass': 2, '12th_pass': 3, 
            'diploma': 4, 'graduate': 5, 'postgraduate': 6
        }
        self.skill_categories = {
            'technical': ['programming', 'software', 'computer', 'coding', 'development', 'IT', 'tech', 'digital'],
            'creative': ['design', 'art', 'creative', 'graphics', 'writing', 'content', 'marketing'],
            'communication': ['communication', 'sales', 'customer', 'presentation', 'speaking', 'writing'],
            'manual': ['manufacturing', 'production', 'mechanical', 'electrical', 'construction', 'repair'],
            'analytical': ['analysis', 'data', 'research', 'finance', 'accounting', 'statistics'],
            'healthcare': ['medical', 'healthcare', 'nursing', 'pharmacy', 'therapy'],
            'education': ['teaching', 'training', 'education', 'instruction'],
            'service': ['hospitality', 'retail', 'food', 'cleaning', 'security', 'delivery']
        }
        self.barrier_impact = {
            'transport': ['remote', 'work_from_home', 'local', 'nearby'],
            'childcare': ['flexible_hours', 'part_time', 'remote', 'women_friendly'],
            'language': ['local_language', 'hindi', 'basic_english'],
            'disability': ['accessible', 'disability_friendly', 'inclusive']
        }
        
    def load_and_preprocess_data(self):
        """Load and preprocess the job dataset"""
        try:
            # Check if CSV file exists, if not create sample data
            if not os.path.exists(self.csv_file):
                self._create_sample_data()
            
            self.df = pd.read_csv(self.csv_file)
            
            # Clean column names
            self.df.columns = self.df.columns.str.strip().str.lower().str.replace(' ', '_')
            
            # Handle different possible column name variations
            column_mapping = {
                'job_descri': 'job_description',
                'job_title': 'job_title',
                'location': 'location',
                'skills': 'skills'
            }
            
            for old_col, new_col in column_mapping.items():
                if old_col in self.df.columns:
                    self.df = self.df.rename(columns={old_col: new_col})
            
            # Ensure required columns exist
            required_cols = ['job_title', 'location', 'skills', 'job_description']
            missing_cols = [col for col in required_cols if col not in self.df.columns]
            if missing_cols:
                for col in missing_cols:
                    self.df[col] = 'Not specified'
            
            # Clean and preprocess data
            self.df = self.df.dropna(subset=['job_title'])
            self.df = self.df.fillna('Not specified')
            
            # Clean text data
            text_columns = ['job_title', 'skills', 'job_description', 'location']
            for col in text_columns:
                if col in self.df.columns:
                    self.df[col] = self.df[col].astype(str).str.lower().str.strip()
            
            # Create enhanced features
            self.df['combined_text'] = (
                self.df['job_title'].fillna('') + ' ' + 
                self.df['skills'].fillna('') + ' ' + 
                self.df['job_description'].fillna('')
            )
            
            # Extract skill categories
            self.df['skill_category'] = self.df['combined_text'].apply(self._categorize_skills)
            
            # Extract experience level
            self.df['experience_level'] = self.df['combined_text'].apply(self._extract_experience_level)
            
            # Extract work type (remote/onsite/hybrid)
            self.df['work_type'] = self.df['combined_text'].apply(self._extract_work_type)
            
            # Create location clusters for better matching
            self.df['location_cluster'] = self._create_location_clusters()
            
            return True
            
        except Exception as e:
            print(f"Error loading dataset: {str(e)}")
            return False
    
    def _create_sample_data(self):
        """Create sample job data if CSV doesn't exist"""
        sample_jobs = [
            {'job_title': 'Software Developer', 'location': 'Mumbai', 'skills': 'Python, JavaScript, React', 'job_description': 'Develop web applications using modern technologies'},
            {'job_title': 'Data Analyst', 'location': 'Bangalore', 'skills': 'Excel, SQL, Python', 'job_description': 'Analyze business data and create reports'},
            {'job_title': 'Customer Support Executive', 'location': 'Delhi', 'skills': 'Communication, Customer Service', 'job_description': 'Handle customer queries and provide support'},
            {'job_title': 'Graphic Designer', 'location': 'Pune', 'skills': 'Photoshop, Illustrator, Creative Design', 'job_description': 'Create visual content for marketing campaigns'},
            {'job_title': 'Sales Representative', 'location': 'Chennai', 'skills': 'Sales, Communication, Negotiation', 'job_description': 'Promote products and achieve sales targets'},
            {'job_title': 'Content Writer', 'location': 'Hyderabad', 'skills': 'Writing, Research, SEO', 'job_description': 'Create engaging content for websites and blogs'},
            {'job_title': 'Teaching Assistant', 'location': 'Kolkata', 'skills': 'Teaching, Communication, Subject Knowledge', 'job_description': 'Assist teachers in classroom activities'},
            {'job_title': 'Delivery Executive', 'location': 'Mumbai', 'skills': 'Driving, Time Management', 'job_description': 'Deliver packages and maintain delivery schedules'},
            {'job_title': 'Healthcare Assistant', 'location': 'Bangalore', 'skills': 'Patient Care, Medical Knowledge', 'job_description': 'Assist medical professionals in patient care'},
            {'job_title': 'Digital Marketing Specialist', 'location': 'Delhi', 'skills': 'Social Media, SEO, Analytics', 'job_description': 'Manage digital marketing campaigns and social media'}
        ]
        
        df = pd.DataFrame(sample_jobs)
        df.to_csv(self.csv_file, index=False)
    
    def _categorize_skills(self, text):
        """Categorize skills based on job description"""
        categories = []
        text = text.lower()
        
        for category, keywords in self.skill_categories.items():
            if any(keyword in text for keyword in keywords):
                categories.append(category)
        
        return categories[0] if categories else 'general'
    
    def _extract_experience_level(self, text):
        """Extract experience level from job description"""
        text = text.lower()
        if any(word in text for word in ['fresher', 'entry', 'beginner', '0-1 year']):
            return 'entry'
        elif any(word in text for word in ['2-3 year', '2-4 year', 'intermediate']):
            return 'intermediate'
        elif any(word in text for word in ['senior', '5+ year', 'experienced']):
            return 'senior'
        else:
            return 'entry'
    
    def _extract_work_type(self, text):
        """Extract work type from job description"""
        text = text.lower()
        if any(word in text for word in ['remote', 'work from home', 'wfh']):
            return 'remote'
        elif any(word in text for word in ['hybrid', 'flexible']):
            return 'hybrid'
        else:
            return 'onsite'
    
    def _create_location_clusters(self):
        """Create location clusters for better matching"""
        if 'location' not in self.df.columns:
            return ['general'] * len(self.df)
        
        major_cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'pune', 'hyderabad']
        clusters = []
        
        for location in self.df['location']:
            location = str(location).lower()
            matched_city = next((city for city in major_cities if city in location), 'other')
            clusters.append(matched_city)
        
        return clusters
    
    def build_recommendation_models(self):
        """Build TF-IDF and ML models for recommendations"""
        try:
            self.tfidf = TfidfVectorizer(
                max_features=5000,
                stop_words='english',
                ngram_range=(1, 2),
                min_df=1,
                max_df=0.95
            )
            
            self.tfidf_matrix = self.tfidf.fit_transform(self.df['combined_text'])
            self._build_collaborative_features()
            
            return True
            
        except Exception as e:
            print(f"Error building models: {str(e)}")
            return False
    
    def _build_collaborative_features(self):
        """Build features for collaborative filtering"""
        feature_data = []
        for _, row in self.df.iterrows():
            features = {
                'skill_category': row['skill_category'],
                'location_cluster': row['location_cluster'],
                'experience_level': row['experience_level'],
                'work_type': row['work_type']
            }
            feature_data.append(features)
        
        self.feature_df = pd.DataFrame(feature_data)
    
    def recommend_career_path(self, user_profile):
        """Generate comprehensive career path recommendations"""
        # Content-based filtering using TF-IDF
        content_scores = self._content_based_recommendation(user_profile)
        
        # Collaborative filtering based on similar profiles
        collaborative_scores = self._collaborative_filtering(user_profile)
        
        # Knowledge-based filtering for constraints
        constraint_scores = self._knowledge_based_filtering(user_profile)
        
        # Hybrid scoring
        final_scores = self._hybrid_scoring(content_scores, collaborative_scores, constraint_scores, user_profile)
        
        # Generate recommendations
        recommendations = self._generate_final_recommendations(final_scores, user_profile)
        
        return recommendations
    
    def _content_based_recommendation(self, user_profile):
        """Content-based recommendations using TF-IDF"""
        user_query = f"{user_profile['primary_interest']} {user_profile['aptitude_areas']} {user_profile['career_goal']}"
        user_vector = self.tfidf.transform([user_query])
        similarity_scores = cosine_similarity(user_vector, self.tfidf_matrix).flatten()
        return similarity_scores
    
    def _collaborative_filtering(self, user_profile):
        """Collaborative filtering based on similar user profiles"""
        user_features = {
            'skill_category': user_profile['primary_interest'],
            'location_cluster': self._get_location_cluster(user_profile['location']),
            'experience_level': self._get_experience_level(user_profile['experience_years']),
            'work_type': user_profile['preferred_work_type'] if user_profile['preferred_work_type'] != 'any' else 'onsite'
        }
        
        similarity_scores = []
        for _, row in self.feature_df.iterrows():
            score = 0
            if row['skill_category'] == user_features['skill_category']:
                score += 0.4
            if row['location_cluster'] == user_features['location_cluster']:
                score += 0.3
            if row['experience_level'] == user_features['experience_level']:
                score += 0.2
            if row['work_type'] == user_features['work_type']:
                score += 0.1
            
            similarity_scores.append(score)
        
        return np.array(similarity_scores)
    
    def _knowledge_based_filtering(self, user_profile):
        """Knowledge-based filtering for constraints and barriers"""
        constraint_scores = np.ones(len(self.df))
        
        for barrier in user_profile['barriers']:
            if barrier in self.barrier_impact:
                preferred_types = self.barrier_impact[barrier]
                for i, row in self.df.iterrows():
                    job_text = row['combined_text'].lower()
                    
                    if any(pref_type in job_text for pref_type in preferred_types):
                        constraint_scores[i] *= 1.5
                    
                    if barrier == 'transport' and 'onsite' in job_text and 'remote' not in job_text:
                        constraint_scores[i] *= 0.7
                    elif barrier == 'childcare' and 'full_time' in job_text and 'flexible' not in job_text:
                        constraint_scores[i] *= 0.8
        
        user_edu_level = self.education_levels.get(user_profile['education'], 3)
        for i, row in self.df.iterrows():
            job_text = row['combined_text'].lower()
            
            if 'graduate' in job_text and user_edu_level < 5:
                constraint_scores[i] *= 0.6
            elif 'postgraduate' in job_text and user_edu_level < 6:
                constraint_scores[i] *= 0.4
            elif '10th' in job_text and user_edu_level >= 2:
                constraint_scores[i] *= 1.2
        
        return constraint_scores
    
    def _hybrid_scoring(self, content_scores, collaborative_scores, constraint_scores, user_profile):
        """Combine all scoring methods"""
        content_scores = (content_scores - content_scores.min()) / (content_scores.max() - content_scores.min() + 1e-8)
        collaborative_scores = (collaborative_scores - collaborative_scores.min()) / (collaborative_scores.max() - collaborative_scores.min() + 1e-8)
        constraint_scores = (constraint_scores - constraint_scores.min()) / (constraint_scores.max() - constraint_scores.min() + 1e-8)
        
        weights = {'content': 0.4, 'collaborative': 0.3, 'constraint': 0.3}
        
        final_scores = (
            weights['content'] * content_scores +
            weights['collaborative'] * collaborative_scores +
            weights['constraint'] * constraint_scores
        )
        
        return final_scores
    
    def _generate_final_recommendations(self, scores, user_profile):
        """Generate final career path recommendations"""
        top_indices = np.argsort(scores)[::-1][:10]
        
        recommendations = {
            'primary_recommendations': [],
            'learning_path': [],
            'mentorship_suggestions': [],
            'barrier_solutions': []
        }
        
        location_matches = []
        general_matches = []
        
        for idx in top_indices:
            job_data = self.df.iloc[idx]
            score = scores[idx]
            
            rec = {
                'job_title': job_data['job_title'],
                'location': job_data['location'],
                'skills_required': job_data['skills'],
                'match_score': round(score * 100, 1),
                'work_type': job_data['work_type'],
                'experience_level': job_data['experience_level'],
                'reasoning': self._generate_reasoning(job_data, user_profile, score)
            }
            
            if user_profile['location'].lower() in job_data['location'].lower():
                location_matches.append(rec)
            else:
                general_matches.append(rec)
        
        recommendations['primary_recommendations'] = location_matches[:3] + general_matches[:2]
        recommendations['learning_path'] = self._generate_learning_path(user_profile)
        recommendations['mentorship_suggestions'] = self._generate_mentorship_suggestions(user_profile)
        recommendations['barrier_solutions'] = self._generate_barrier_solutions(user_profile)
        
        return recommendations
    
    def _generate_reasoning(self, job_data, user_profile, score):
        """Generate reasoning for why a job was recommended"""
        reasons = []
        
        if user_profile['primary_interest'] in job_data['combined_text']:
            reasons.append(f"matches your {user_profile['primary_interest']} interest")
        
        if user_profile['location'].lower() in job_data['location'].lower():
            reasons.append("available in your location")
        
        if job_data['experience_level'] == self._get_experience_level(user_profile['experience_years']):
            reasons.append("suitable for your experience level")
        
        if not reasons:
            reasons.append("good overall match based on your profile")
        
        return " and ".join(reasons)
    
    def _generate_learning_path(self, user_profile):
        """Generate learning path suggestions"""
        primary_skill = user_profile['primary_interest']
        
        learning_path = [
            {
                'stage': 1,
                'title': f'Foundation in {primary_skill.title()}',
                'duration': '2-4 weeks',
                'description': f'Basic concepts and fundamentals of {primary_skill}',
                'type': 'online_course'
            },
            {
                'stage': 2,
                'title': f'Practical {primary_skill.title()} Skills',
                'duration': '4-8 weeks',
                'description': f'Hands-on practice and project-based learning in {primary_skill}',
                'type': 'workshop'
            },
            {
                'stage': 3,
                'title': 'Industry Certification',
                'duration': '2-4 weeks',
                'description': f'Get certified in relevant {primary_skill} technologies',
                'type': 'certification'
            },
            {
                'stage': 4,
                'title': 'Job Placement Preparation',
                'duration': '2-3 weeks',
                'description': 'Interview preparation and portfolio building',
                'type': 'placement_prep'
            }
        ]
        
        return learning_path
    
    def _generate_mentorship_suggestions(self, user_profile):
        """Generate mentorship suggestions"""
        return [
            {
                'type': 'Industry Expert',
                'description': f'Senior professional in {user_profile["primary_interest"]} field',
                'location': 'Local/Online',
                'availability': 'Weekly sessions'
            },
            {
                'type': 'Career Counselor',
                'description': 'Guidance on career transitions and skill development',
                'location': 'Local/Online',
                'availability': 'Bi-weekly sessions'
            }
        ]
    
    def _generate_barrier_solutions(self, user_profile):
        """Generate solutions for user barriers"""
        solutions = []
        
        for barrier in user_profile['barriers']:
            if barrier == 'transport':
                solutions.append({
                    'barrier': 'Transport',
                    'solutions': ['Remote work opportunities', 'Local employment options', 'Public transport assistance programs']
                })
            elif barrier == 'childcare':
                solutions.append({
                    'barrier': 'Childcare',
                    'solutions': ['Flexible working hours', 'Part-time opportunities', 'Employer childcare support', 'Local childcare programs']
                })
            elif barrier == 'language':
                solutions.append({
                    'barrier': 'Language',
                    'solutions': ['Local language job opportunities', 'Basic English courses', 'Translation support services']
                })
        
        return solutions
    
    def _get_location_cluster(self, location):
        """Get location cluster for a given location"""
        location = location.lower()
        major_cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'pune', 'hyderabad']
        return next((city for city in major_cities if city in location), 'other')
    
    def _get_experience_level(self, years):
        """Convert years to experience level"""
        if years <= 1:
            return 'entry'
        elif years <= 4:
            return 'intermediate'
        else:
            return 'senior'

# Initialize the recommender system
recommender = CareerPathRecommender()

@app.route('/api/initialize', methods=['POST'])
def initialize_system():
    """Initialize the recommendation system"""
    try:
        if recommender.load_and_preprocess_data() and recommender.build_recommendation_models():
            return jsonify({'success': True, 'message': 'System initialized successfully'})
        else:
            return jsonify({'success': False, 'message': 'Failed to initialize system'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/skill-categories', methods=['GET'])
def get_skill_categories():
    """Get available skill categories"""
    return jsonify({
        'skill_categories': list(recommender.skill_categories.keys()),
        'education_levels': list(recommender.education_levels.keys()),
        'work_types': ['onsite', 'remote', 'hybrid', 'any'],
        'barriers': ['transport', 'childcare', 'language', 'disability', 'none']
    })

@app.route('/api/recommend', methods=['POST'])
def get_recommendations():
    """Get career path recommendations"""
    try:
        user_profile = request.json
        
        # Validate required fields
        required_fields = ['name', 'age', 'location', 'education', 'primary_interest', 'experience_years']
        for field in required_fields:
            if field not in user_profile:
                return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
        
        # Process barriers - ensure it's a list
        if 'barriers' not in user_profile:
            user_profile['barriers'] = []
        elif isinstance(user_profile['barriers'], str):
            user_profile['barriers'] = [b.strip() for b in user_profile['barriers'].split(',') if b.strip()]
        
        # Set defaults for optional fields
        user_profile.setdefault('gender', 'not_specified')
        user_profile.setdefault('aptitude_areas', '')
        user_profile.setdefault('career_goal', 'stable job')
        user_profile.setdefault('preferred_work_type', 'any')
        
        # Generate recommendations
        recommendations = recommender.recommend_career_path(user_profile)
        
        return jsonify({
            'success': True,
            'user_profile': user_profile,
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Career Recommendation API is running'})

if __name__ == '__main__':
    # Initialize the system on startup
    if recommender.load_and_preprocess_data() and recommender.build_recommendation_models():
        print("✅ Career Recommendation System initialized successfully")
    else:
        print("❌ Failed to initialize system")
    
    app.run(debug=True, host='0.0.0.0', port=5000)