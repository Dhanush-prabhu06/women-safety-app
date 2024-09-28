# ML/Dockerfile

# Use the official Python image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port that your ML service runs on
EXPOSE 5000

# Command to run the ML service
CMD ["python", "app.py"]
