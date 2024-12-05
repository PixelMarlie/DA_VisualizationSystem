# DataVisualizationApp/views.py
import plotly.express as px 
import plotly.io as pio
import plotly.graph_objects as go
import pandas as pd
import time
import numpy as np
from sklearn.impute import SimpleImputer
#import matplotlib.pyplot as plt
#import seaborn as sns
import io
import re
import os
from django.db import connection
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from django.conf import settings
import json
from django.core.mail import EmailMessage
from django.template.loader import render_to_string

#Clean Column Names for SQL Acceptance
def clean_column_name(name):
    name = re.sub(r'[^\w\s]', '', name)  # Remove punctuation
    name = re.sub(r'\s+', '_', name).strip()  # Replace spaces with underscores
    stop_words = {'a', 'the', 'and', 'or', 'to', 'for', 'on', 'in'}  # Define stop words
    name = '_'.join([word for word in name.split() if word.lower() not in stop_words])
    if name.lower() in {'order', 'select', 'create', 'table', 'drop', 'update', 'delete'}:  # Avoid SQL keywords
        name += '_col'  # Add a suffix to avoid conflicts
    return name

# 3. Text Data Cleaning
def clean_text(text):
    if isinstance(text, str):  # Only clean if the value is a string
        text = re.sub(r'[^\w\s]', '', text)  # Remove special characters
        text = re.sub(r'\s+', ' ', text).strip()  # Remove extra whitespace
        stop_words = {'a', 'the', 'and', 'or', 'to', 'for', 'on', 'in'}
        text = ' '.join([word for word in text.split() if word.lower() not in stop_words])
    else:
        text = str(text) if text else "Unknown"  # Handle non-string values
    return text

@csrf_exempt
# View for uploading CSV and creating dynamic tables
def upload_csv(request):
    if request.method == "POST" and request.FILES.get("csv_file"):
        outlier_action = request.POST.get("outlier_action", "cap")  # Default to 'cap'
        csv_file = request.FILES["csv_file"]

        # Extract table name from the file name (remove file extension and any non-alphanumeric characters)
        table_name = re.sub(r'\W+', '_', csv_file.name.split('.')[0])

        # Read the CSV file using pandas
        df = pd.read_csv(csv_file)
        
        # Start Auto Data Cleaning
        # 1. Handle Missing Values
        for column in df.columns:
            if df[column].dtype == 'object':  # Text columns
                most_frequent_value = df[column].mode()[0] if not df[column].mode().empty else "Unknown"
                df[column].fillna(most_frequent_value, inplace=True)
            elif np.issubdtype(df[column].dtype, np.number):  # Numeric columns
                median_value = df[column].median() if not df[column].dropna().empty else 0
                df[column].fillna(median_value, inplace=True)
            elif np.issubdtype(df[column].dtype, np.datetime64):  # Datetime columns
                df[column].fillna(pd.Timestamp.now(), inplace=True)
            else:
                df[column].fillna("Unknown", inplace=True)
        
        # 2. Data Type Conversion
        for column in df.columns:
            if pd.api.types.is_numeric_dtype(df[column]):
                # Check if all values are whole numbers (no decimals or just trailing zeroes)
                if df[column].apply(lambda x: isinstance(x, (int, float)) and x.is_integer()).all():
                    # If all values are whole numbers, convert to integer type
                    df[column] = df[column].apply(lambda x: int(x) if isinstance(x, float) else x)
                else:
                    # If the column contains decimal values, round them to 2 decimal places
                    df[column] = df[column].apply(lambda x: round(x, 2) if isinstance(x, float) else x)
            elif pd.api.types.is_datetime64_any_dtype(df[column]) or pd.to_datetime(df[column], errors="coerce").notnull().all():
                # Convert text representations of dates to datetime and extract only the date (no time)
                df[column] = pd.to_datetime(df[column], errors="coerce").dt.date.fillna(pd.Timestamp.now().date())
            else:
                # Clean text and ensure consistent formatting for non-numeric, non-datetime columns
                df[column] = df[column].astype(str).apply(clean_text)

        # Clean column names using the updated function
        df.columns = [clean_column_name(col) for col in df.columns]
        for column in df.select_dtypes(include=['object']).columns:
            df[column] = df[column].apply(clean_text)

        # Generate SQL to create the table dynamically based on CSV columns
        with connection.cursor() as cursor:
            # Drop the table if it already exists
            cursor.execute(f"DROP TABLE IF EXISTS {table_name};")

            # Define table schema with cleaned column names
            columns = ', '.join([f"{col} VARCHAR(255)" for col in df.columns])  # Columns already sanitized
            create_table_query = f"CREATE TABLE {table_name} ({columns});"
            cursor.execute(create_table_query)

            # Insert each row of CSV data into the newly created table
            for _, row in df.iterrows():
                values = ', '.join([f"'{str(value).replace('\'', '\'\'')}'" for value in row])
                insert_query = f"INSERT INTO {table_name} VALUES ({values});"
                cursor.execute(insert_query)

        return JsonResponse({
            "message": f"Uploaded and saved to table {table_name} successfully.",
            "total_rows": len(df),
            "sorted_columns": df.columns.tolist()
        })
    
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
        y_axes = data.get("y_axes", [])  # Fetch multiple Y-axes
        chart_type = data.get("chart_type")
        open_column = data.get("open_column")
        close_column = data.get("close_column")
        high_column = data.get("high_column")
        low_column = data.get("low_column")
        #sort_columns = data.get("sort_columns", False)  # Whether to sort by highest numeric row value

        if chart_type != "candle":
            with connection.cursor() as cursor:
                columns_to_fetch = ", ".join([x_axis] + y_axes)
                cursor.execute(f"SELECT {columns_to_fetch} FROM {table_name};")
                rows = cursor.fetchall()
        else:
            with connection.cursor() as cursor:
                # Ensure all necessary columns are included for candlestick chart
                columns_to_fetch = [x_axis, open_column, high_column, low_column, close_column]
                columns_to_fetch_str = ", ".join(columns_to_fetch)
                cursor.execute(f"SELECT {columns_to_fetch_str} FROM {table_name};")
                rows = cursor.fetchall()

        # Set the correct columns based on chart type
        if chart_type == "candle":
            columns = [x_axis, open_column, high_column, low_column, close_column]
        else:
            columns = [x_axis] + y_axes

        df = pd.DataFrame(rows, columns=columns)

        # Ensure sorting based on x-axis
        if pd.api.types.is_numeric_dtype(df[x_axis]):
            df = df.sort_values(by=[x_axis])
        else:
            df = df.sort_values(by=[x_axis])
    
        # Optional sorting based on the lowest numeric row value
        '''
        if sort_columns:
            df["row_max"] = df.apply(
                lambda row: max(
                    [val for val in row if isinstance(val, (int, float))], default=float('-inf')
                ),
                axis=1
            )
            df = df.sort_values(by="row_max", ascending=False).drop(columns=["row_max"])
        '''

        # Generate the selected chart type using Plotly
        fig = None
        
        #Charts (Unique)
        if chart_type == "bar":
            fig = px.bar(df, x=x_axis, y=y_axes[0])
        elif chart_type == "box":
            fig = px.box(df, x=x_axis, y=y_axes[0])
        elif chart_type == "candle":
            print(f"DataFrame columns: {df.columns}")
            # Generate candlestick chart using plotly.graph_objects
            fig = go.Figure(data=[go.Candlestick(
                x=df[x_axis],
                open=df[open_column],
                high=df[high_column],
                low=df[low_column],
                close=df[close_column]
            )])
        elif chart_type == "heat":
            fig = px.density_heatmap(df, x=x_axis, y=y_axes[0])
        #Single Area Chart
        elif chart_type == "s_area":
            fig = px.area(df, x=x_axis, y=y_axes[0], title="Single Area Chart")
        #Stacked Area Chart
        elif chart_type == "m_area":
            fig = px.area(df, x=x_axis, y=y_axes, title="Stacked Area Chart")
            
        #Charts (Not Unique)
        '''
        elif chart_type == "line":
            fig = px.line(df, x=x_axis, y=y_axis)
        elif chart_type == "scatter":
            fig = px.scatter(df, x=x_axis, y=y_axis)
        elif chart_type == "histogram":
            fig = px.histogram(df, x=x_axis, y=y_axis)
        '''

        # Save the chart to static/charts directory
        charts_dir = os.path.join(settings.BASE_DIR, 'static', 'charts')
        if not os.path.exists(charts_dir):
            os.makedirs(charts_dir)
        
        # Save the chart to static/charts directory with a unique filename
        unique_filename = f"chart_{int(time.time())}.html"
        unique_filename2 = f"chart_{int(time.time())}.png"
        chart_file_path = os.path.join(charts_dir, unique_filename)
        chart_file_path2 = os.path.join(charts_dir, unique_filename2)
        pio.write_html(fig, chart_file_path)
        pio.write_image(fig, chart_file_path2, width=1920, height=1080) #save as image

        # Construct the URL for the saved chart
        chart_path = f"charts/{unique_filename}"
        chart_path2 = f"charts/{unique_filename2}"
        chart_url = f"{settings.STATIC_URL}{chart_path}" #path that is passed to react
        chart_url2 = f"{settings.STATIC_URL}{chart_path2}" #path for png to send in email
        
        print(f'DIR: {chart_url}')

        return JsonResponse({"message": "Chart generated successfully", "chart_url": chart_url, "chart_url2": chart_url2})
    
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

# email handling
@csrf_exempt
def send_email(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")
        interpretation = data.get("interpretation")
        username = data.get("username")
        chart_png_url = data.get("chart_url2")  # URL of the chart PNG file
        
        # Construct the absolute file path
        chart_file_path = os.path.join(settings.BASE_DIR, chart_png_url.replace('http://localhost:8000/', ''))

        # Validate inputs
        if not email or not interpretation or not chart_png_url:
            return JsonResponse({"error": "Invalid data. Ensure all fields are filled."}, status=400)

        # Construct email content
        subject = "Chart Interpretation and Remarks"
        message = f"Dear {username},\n\nAttached within this email is the Data Report generated. Here is your interpretation from the generated Data Report:\n\n{interpretation}\n\nBest regards,\nDataAlchemy Team"
        
        # The email body, using HTML to format the signature
        body = render_to_string('email_template.html', {
            'message': message,  # Your email content
            'signature': render_to_string('email_signature.html')  
        })
        
        # Send email with the PNG attached
        try:
            email_message = EmailMessage(subject, body, 'foreverpixel16@gmail.com', [email])
            print(chart_file_path)
            email_message.attach_file(chart_file_path)
            email_message.content_subtype = "html"  # This tells Django to treat the email as HTML
            email_message.send()
            return JsonResponse({"message": "Email sent successfully."})
        except Exception as e:
            return JsonResponse({"error": f"Failed to send email: {str(e)}"}, status=500)
    
    return JsonResponse({"error": "Invalid request"}, status=400)


