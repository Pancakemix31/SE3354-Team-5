# Author: Dylan Nguyen
# Use Cases: Register Account & Login

from flask import Flask, request, jsonify

app = Flask(__name__)

# These modules simulate the backend logic for user registration and login using Firebase Authentication and Cloud Firestore.
# Module: FirebaseAuthManager
# Handles secure communication with Firebase Authentication.
class FirebaseAuthManager:
    def create_user(self, email, password):
        """
        Registers a new user in Firebase. 
        Satisfies TC-01.
        Satisfies NTC-01.
        Firebase Authentication automatically hashes and salts passwords before storage.
        No plaintext password is ever written to the database.
        """
        # In a real environment, this calls: auth.create_user(email=email, password=password)
        # We simulate the response here
        if email == "existing@example.com":
            raise Exception("Email already in use") # Satisfies TC-02
        
        # Simulate returning a unique Firebase UID
        return "mock_firebase_uid_789"

    def verify_credentials(self, email, password):
        """
        Verifies user login credentials via Firebase.
        Satisfies TC-03.
        """
        # In a real environment, this calls Firebase client SDK to verify the token/password
        if password != "CorrectPassword123!":
            raise Exception("Invalid credentials") # Satisfies TC-04
            
        return "mock_firebase_uid_789"

# Module: FirestoreDatabaseManager
# Handles data persistence for user profiles in Cloud Firestore.
class FirestoreDatabaseManager:
    def initialize_profile(self, uid):
        """
        Creates a blank preference document in Firestore for a brand new user.
        Satisfies database initialization for TC-01.
        """
        # In a real environment: db.collection("users").document(uid).set({"topics": [], "regions": []})
        print(f"Firestore: Initialized new profile for UID {uid}")
        return True

    def fetch_preferences(self, uid):
        """
        Retrieves the user's saved news topics and regions for the Dashboard.
        Satisfies database retrieval for TC-03.
        """
        # In a real environment: db.collection("users").document(uid).get().to_dict()
        print(f"Firestore: Fetched preferences for UID {uid}")
        return {"topics": ["Technology", "Finance"], "regions": ["North America"]}

# Instantiate our managers
auth_manager = FirebaseAuthManager()
db_manager = FirestoreDatabaseManager()

# UC1: Register Account (Dylan)
@app.route('/register', methods=['POST'])
def register_account():
    """
    Route to handle new user registration.
    Expects JSON payload with 'email' and 'password'.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    try:
        # Create the secure account in Firebase
        uid = auth_manager.create_user(email, password)
        
        # Initialize their profile document in Cloud Firestore
        db_manager.initialize_profile(uid)
        
        # Return success so the Front-End can redirect to Preferences
        return jsonify({
            "status": "success", 
            "message": "Account created successfully.", 
            "uid": uid
        }), 201
        
    except Exception as e:
        # Handle errors (Duplicate Email TC-02)
        return jsonify({"status": "error", "message": str(e)}), 400

# UC2: Login (Dylan)
@app.route('/login', methods=['POST'])
def login_user():
    """
    Route to handle existing user authentication.
    Expects JSON payload with 'email' and 'password'.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    try:
        # Verify credentials with Firebase Auth
        uid = auth_manager.verify_credentials(email, password)
        
        # Fetch the user's tailored news preferences from Firestore
        preferences = db_manager.fetch_preferences(uid)
        
        # Return success and preferences so Front-End can load the Dashboard
        return jsonify({
            "status": "success", 
            "message": "Login successful.", 
            "uid": uid,
            "preferences": preferences
        }), 200
        
    except Exception as e:
        # Handle errors like TC-04 and NTC-03
        return jsonify({"status": "error", "message": str(e)}), 401

# Additional UC: Logout (Dylan)
# Note: In production, the token would be validated before revoking.
# Here we only check for header presence as Firebase validation is mocked.
@app.route('/logout', methods=['POST'])
def logout_user():
    """
    Route to handle user session termination.
    Satisfies TC-05.
    """
    # In a real environment, we would extract the session token from the header
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        # Return an error if the user isn't actually logged in
        return jsonify({"status": "error", "message": "No active session found."}), 401

    try:
        # Invalidate the Firebase session token server-side
        # (Mocked: firebase_auth.revoke_refresh_tokens(uid))
        print(f"Server: Revoking session for token... {auth_header[:10]}***")
        
        # Clear any local session data if using Flask sessions
        # session.clear() 

        return jsonify({
            "status": "success", 
            "message": "Logged out successfully. Session invalidated."
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": "Logout failed."}), 500

if __name__ == '__main__':
    app.run(debug=True)