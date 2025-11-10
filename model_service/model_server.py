#!/usr/bin/env python3
"""
BP Recommender Model Server
Serves the machine learning model for BP recommendations via REST API
"""

import os
import pickle
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import warnings

# Try to use joblib for better scikit-learn compatibility
try:
    import joblib
    USE_JOBLIB = True
except ImportError:
    USE_JOBLIB = False
    print("⚠ joblib not available, using pickle (may have compatibility issues)")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variable to store the loaded model
model = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'bp_recommender.pkl')

def load_model():
    """Load the trained model from pickle file"""
    global model
    try:
        if not os.path.exists(MODEL_PATH):
            print(f"⚠ Warning: Model file not found at {MODEL_PATH}")
            return False
        
        # Try joblib first (better for scikit-learn models)
        if USE_JOBLIB:
            try:
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    model = joblib.load(MODEL_PATH)
                print(f"✓ Model loaded successfully using joblib from {MODEL_PATH}")
                print(f"  Model type: {type(model).__name__}")
                return True
            except Exception as joblib_error:
                print(f"⚠ joblib loading failed: {joblib_error}")
                print("  Trying pickle instead...")
        
        # Fallback to pickle
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
        print(f"✓ Model loaded successfully using pickle from {MODEL_PATH}")
        print(f"  Model type: {type(model).__name__}")
        return True
        
    except Exception as e:
        print(f"✗ Error loading model: {type(e).__name__}: {e}")
        print(f"  This might be due to version incompatibility.")
        print(f"  Model was likely created with a different Python/scikit-learn version.")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """Predict BP recommendations based on input features"""
    try:
        if model is None:
            return jsonify({
                'error': 'Model not loaded',
                'message': 'The ML model is not available. Please check server logs.'
            }), 503

        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Request body must be JSON'
            }), 400

        # Extract features from request
        # Adjust these based on your actual model's expected input features
        features = data.get('features', [])
        
        if not features:
            return jsonify({
                'error': 'Invalid input',
                'message': 'Features array is required'
            }), 400

        # Convert to numpy array and reshape if needed
        features_array = np.array(features)
        
        # Handle different model types
        if hasattr(model, 'predict'):
            # Scikit-learn style model
            prediction = model.predict(features_array.reshape(1, -1) if len(features_array.shape) == 1 else features_array)
            
            # If model returns probabilities, include them
            result = {
                'prediction': prediction.tolist() if isinstance(prediction, np.ndarray) else prediction,
                'status': 'success'
            }
            
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba(features_array.reshape(1, -1) if len(features_array.shape) == 1 else features_array)
                result['probabilities'] = probabilities.tolist()
        else:
            # Custom model or function
            result = {
                'prediction': 'Model format not recognized',
                'status': 'error'
            }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if model is None:
        return jsonify({
            'error': 'Model not loaded'
        }), 503

    info = {
        'model_type': type(model).__name__,
        'model_loaded': True
    }

    # Add model-specific information if available
    if hasattr(model, 'feature_names_in_'):
        info['feature_names'] = model.feature_names_in_.tolist()
    if hasattr(model, 'n_features_in_'):
        info['n_features'] = model.n_features_in_

    return jsonify(info), 200

if __name__ == '__main__':
    print("Starting BP Recommender Model Server...")
    print(f"Model path: {MODEL_PATH}")
    
    # Load model on startup
    load_model()
    
    # Get port from environment or use default
    port = int(os.environ.get('MODEL_SERVER_PORT', 5001))
    host = os.environ.get('MODEL_SERVER_HOST', '0.0.0.0')
    
    print(f"Server starting on {host}:{port}")
    print("Available endpoints:")
    print("  GET  /health - Health check")
    print("  POST /predict - Make predictions")
    print("  GET  /model/info - Model information")
    
    app.run(host=host, port=port, debug=False)

