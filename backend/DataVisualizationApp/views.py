# DataVisualizationApp/views.py
import plotly.express as px
import plotly.io as pio
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io
import re
import os
from django.db import connection
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from django.conf import settings
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

@csrf_exempt
def fetch_axis_data(request):
    if request.method == "POST":
        data = json.loads(request.body)
        table_name = data.get("table_name")
        x_axis = data.get("x_axis")
        y_axis = data.get("y_axis")

        # Fetch data for the specified x and y columns
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT {x_axis}, {y_axis} FROM {table_name};")
            rows = cursor.fetchall()
        
        # Extract x_data and y_data separately
        x_data, y_data = zip(*rows)
        
        return JsonResponse({"x_data": list(x_data), "y_data": list(y_data)})
    
    return JsonResponse({"error": "Invalid request"}, status=400)


# Generate chart based on user selection
@csrf_exempt
def generate_chart(request):
    if request.method == "POST":
        data = json.loads(request.body)
        table_name = data.get("table_name")
        x_axis = data.get("x_axis")
        y_axis = data.get("y_axis")
        chart_type = data.get("chart_type")

        with connection.cursor() as cursor:
            cursor.execute(f"SELECT {x_axis}, {y_axis} FROM {table_name};")
            rows = cursor.fetchall()

        df = pd.DataFrame(rows, columns=[x_axis, y_axis])

        # Ensure sorting based on x and y axes
        if pd.api.types.is_numeric_dtype(df[x_axis]):
            df = df.sort_values(by=[x_axis, y_axis])
        else:
            df = df.sort_values(by=[x_axis, y_axis], ascending=[True, True])

        x_data = df[x_axis]
        y_data = df[y_axis]

        # Generate the selected chart type using Plotly
        fig = None
        if chart_type == "bar":
            fig = px.bar(df, x=x_axis, y=y_axis)
        elif chart_type == "line":
            fig = px.line(df, x=x_axis, y=y_axis)
        elif chart_type == "scatter":
            fig = px.scatter(df, x=x_axis, y=y_axis)
        elif chart_type == "histogram":
            fig = px.histogram(df, x=x_axis, y=y_axis)
        elif chart_type == "box":
            fig = px.box(df, x=x_axis, y=y_axis)

        # Save the chart to static/charts directory
        charts_dir = os.path.join(settings.BASE_DIR, 'static', 'charts')
        if not os.path.exists(charts_dir):
            os.makedirs(charts_dir)

        chart_file_path = os.path.join(charts_dir, "chart.html")
        pio.write_html(fig, chart_file_path)

        # Construct the URL for the saved chart
        chart_path = "charts/chart.html"
        chart_url = f"{settings.STATIC_URL}{chart_path}"  # Full static URL for the frontend
        
        print(f'DIR: {chart_url}')

        return JsonResponse({"message": "Chart generated successfully", "chart_url": chart_url})
    
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
