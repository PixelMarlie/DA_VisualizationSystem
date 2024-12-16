DELETE ENV FILE
Then Create your env
python -m venv env
ACTIVATE
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
->pip install plotly kaleido
->pip install django-crispy-forms
->pip install scikit-learn
->pip install weasyprint


Frontend Installations (DA_VisualizationSystem/frontend)
->npm install axios
->npm install bootstrap
->npm install js-cookie
->npm install -g orca
->npm install react-router-dom
->npm install @fortawesome/fontawesome-free



