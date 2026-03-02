import os
from dotenv import load_dotenv

load_dotenv()

INSFORGE_BASE_URL = os.getenv(
    "INSFORGE_BASE_URL",
    "https://3vi8v8xw.us-east.insforge.app",
)
INSFORGE_ANON_KEY = os.getenv(
    "INSFORGE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTk1Njh9.plmWhqwtBROQTlHaBOmMS4qYh8Z2wK0z_AY92HkCeS0",
)
