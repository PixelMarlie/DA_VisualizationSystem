# DataVisualizationApp/views.py
import pandas as pd
import re
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
# View for uploading CSV and creating dynamic tables
def upload_csv(request):
    if request.method == "POST" and request.FILES.get("csv_file"):
        csv_file = request.FILES["csv_file"]

        # Extract table name from the file name (remove file extension and any non-alphanumeric characters)
        table_name = re.sub(r'\W+', '_', csv_file.name.split('.')[0])

        # Read the CSV file using pandas
        df = pd.read_csv(csv_file)

        # Generate SQL to create the table dynamically based on CSV columns
        with connection.cursor() as cursor:
            # Drop the table if it already exists
            cursor.execute(f"DROP TABLE IF EXISTS {table_name};")

            # Define table schema with column names and set a max length for varchar fields
            columns = ', '.join([f"{re.sub(r'\\W+', '_', col)} VARCHAR(255)" for col in df.columns])
            create_table_query = f"CREATE TABLE {table_name} ({columns});"
            cursor.execute(create_table_query)

            # Insert each row of CSV data into the newly created table
            for _, row in df.iterrows():
                values = ', '.join([f"'{str(value).replace('\'', '\'\'')}'" for value in row])
                insert_query = f"INSERT INTO {table_name} VALUES ({values});"
                cursor.execute(insert_query)

        return JsonResponse({"message": f"Uploaded and saved to table {table_name} successfully."})
    
    return JsonResponse({"error": "Invalid request"}, status=400)

# View for fetching a list of uploaded tables
def list_uploaded_tables(request):
    with connection.cursor() as cursor:
        # Query to get all table names 
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
        tables = cursor.fetchall()
    
    # Return the list of table names as JSON
    table_names = [table[0] for table in tables]
    return JsonResponse({"tables": table_names})

# Fetch columns for a selected table to be used for X and Y axes
def fetch_columns(request, table_name):
    with connection.cursor() as cursor:
        query = """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = %s AND table_schema = 'public';
        """
        cursor.execute(query, [table_name])
        columns = [col[0] for col in cursor.fetchall()]  # Retrieves only column names
    return JsonResponse({"columns": columns})

# Generate chart based on user selection
@csrf_exempt
def generate_chart(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        table_name = data.get('table_name')
        x_axis = data.get('x_axis')
        y_axis = data.get('y_axis')
        chart_type = data.get('chart_type')

        # Fetch data from the database for the specified columns
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT {x_axis}, {y_axis} FROM {table_name};")
            rows = cursor.fetchall()

        # Generate chart using Matplotlib or Plotly here and save the chart to a static path, e.g., '/static/charts/chart.png'

        return JsonResponse({"message": "Chart generated successfully", "chart_url": "/static/charts/chart.png"})

    return JsonResponse({"error": "Invalid request"}, status=400)

# View for fetching data from a specific table
def view_table(request, table_name):
    with connection.cursor() as cursor:
        # Query to fetch the data from the selected table
        cursor.execute(f"SELECT * FROM {table_name};")
        rows = cursor.fetchall()

        # Fetch column names
        cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table_name}';")
        columns = [col[0] for col in cursor.fetchall()]

    # Return the data in a structured format
    table_data = {
        "columns": columns,
        "rows": rows
    }
    return JsonResponse(table_data)
