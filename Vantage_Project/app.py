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

@app.route('/signin', methods=['GET', 'POST'])
def signin():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

    if username == USER['username'] and password == USER['password']:
        session['username'] = username
        return redirect(url_for('home'))
    else:
        return render_template('signin.html', error='Invalid username or password')
    
    return render_template('signin.html')

@app.route('/dashboard')
def dashboard():
    if 'username' in session:
        return render_template('dashboard.html', photos=UPLOADED_PHOTOS)
    else:
        return redirect(url_for('signin'))

@app.route('/upload', methods=['POST'])
def upload_photo():
    if 'username' not in session:
        return redirect(url_for('signin'))

    file = request.files.get('photo')
    caption = request.form.get('caption', 'Little Rock photo')

    if file and file.filename != '':
        filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        UPLOADED_PHOTOS.append({'filename': filename, 'caption': caption})
        return redirect(url_for('dashboard'))

    return redirect(url_for('dashboard'))

@app.route('/signout')
def signout():
    session.pop('username', None)
    return redirect(url_for('home'))

if __name__== '__main__':
    app.run(debug=True, port=5000)