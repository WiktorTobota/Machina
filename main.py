import datetime
from flask import Flask, jsonify, render_template, request
from utils import get_current_date_dict
from Data_getters.dashboard_tasks import get_task_for_dashboard
from Data_getters.get_tags_and_statuses import get_tag_list
from Data_getters.get_tags_and_statuses import get_status_list


app = Flask(__name__)

#to mi znajdzie html
@app.route('/')
def serve_dashboard():
    return render_template('dashboard.html')

@app.route('/api/current-date')
def get_current_date():
    data = get_current_date_dict()
    return jsonify(data)

@app.route('/api/tasks', methods=['GET'])
def get_current_tasks():

    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)

    if not month or not year:
        return jsonify({"error": "Brak parametrow month lub year"}), 400
    data = get_task_for_dashboard(year, month)
    return jsonify(data)


#statusy i tagi do zadan
@app.route('/api/statuses')
def get_status():
    data = get_status_list()

    return jsonify(data)

@app.route('/api/tags')
def get_tag():
    data = get_tag_list()

    return jsonify(data)



if __name__ == '__main__':
    app.run(debug=True, port=5000) 