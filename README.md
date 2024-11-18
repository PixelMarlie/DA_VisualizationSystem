ACTIVATE ENV 
python -m venv env
source sampleenv/bin/activate  # On Windows, use env\Scripts\activate

Setup your DB in Settings.py (where CSV Files will be stored)
Optionally run migrations (prefer not to)

Backend Installations (DA_VisualizationSystem/backend)
->pip install djangorestframework
->pip install psycopg or psycopg2
->pip install django-cors-headers
->pip install pandas
->pip install plotly
->pip install matplotlib
->pip install seaborn

Frontend Installations (DA_VisualizationSystem/frontend)
->npm install axios
->npm install bootstrap

