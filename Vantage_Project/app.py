from flask import Flask, render_template, request, redirect, url_for, session
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'Vantage_secret_key'  # Change this to a random secret key

UPLOAD_FOLDER = os.path.join('static', 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

#memory storage for demonstration purposes
USER = {
    'username': 'JohnDoe',
    'password': 'password123'   #For demo purposes only will store password in plain text
}
UPLOADED_PHOTOS = []  # List to store uploaded file names

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            file.save(os.path.join(app.config['UPLOAD_FLODER'], file.filename))
            return redirect(url_for('home'))
    return redirect(url_for('home'))

if __name__== '__main__':
    app.run(debug=True, port=5000)