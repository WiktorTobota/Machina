import datetime
from flask import Flask, jsonify, render_template
from utils import get_current_date_dict

app = Flask(__name__)

#to mi znajdzie html
@app.route('/')
def serve_dashboard():
    return render_template('dashboard.html')

@app.route('/api/current-date')
def get_current_date():
    data = get_current_date_dict()
    return jsonify(data)






if __name__ == '__main__':
    app.run(debug=True, port=5000) 