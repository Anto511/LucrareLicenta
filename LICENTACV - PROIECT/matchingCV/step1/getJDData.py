from flask import Flask, request, jsonify
import threading
import subprocess
import os
import pandas as pd
from queue import Queue

app = Flask(__name__)

def run_script(script_path, args, output_queue):
    result = subprocess.run(
        ["python", script_path] + args,
        capture_output=True,
        text=True
    )
    output = {
        "script": script_path,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "returncode": result.returncode
    }
    output_queue.put(output)

def check_file_validity(file_path):
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read().strip()
            if content:
                return True
    return False

def check_for_no_registrations(output_queue=None):
    filenameIndeed = r'C:\Users\Ionut\Desktop\LoginSignupNativeMern-main\LICENTACV - PROIECT\matchingCV\step1\dataIndeed.csv'
    filenameLinkedIn = r'C:\Users\Ionut\Desktop\LoginSignupNativeMern-main\LICENTACV - PROIECT\matchingCV\step1\dataLinkedIn.csv'
    
    if check_file_validity(filenameIndeed) and check_file_validity(filenameLinkedIn):
        dataIndeed = pd.read_csv(filenameIndeed)
        dataLinkedIn = pd.read_csv(filenameLinkedIn)
        
        if dataIndeed.empty and dataLinkedIn.empty:
            output = {
                "script": '',
                "stdout": "No jobs were found",
                "stderr": 'An error occurred while looking for jobs',
                "returncode": ''
            }
            output_queue.put(output)
        elif dataLinkedIn.empty:
            return dataIndeed, None
        elif dataIndeed.empty:
            return None, dataLinkedIn
        return dataIndeed, dataLinkedIn
        
    elif check_file_validity(filenameIndeed):
        dataIndeed = pd.read_csv(filenameIndeed)
        if not dataIndeed.empty:
            return dataIndeed, None
        else:
            return None, None
    
    elif check_file_validity(filenameLinkedIn):
        dataLinkedIn = pd.read_csv(filenameLinkedIn)
        if not dataLinkedIn.empty:
            return None, dataLinkedIn
        else:
            return None, None
    
    else:
        output = {
            "script": '',
            "stdout": "No jobs were found",
            "stderr": 'No job data files found or files are empty',
            "returncode": ''
        }
        output_queue.put(output)
        return None, None

def execute_scripts(keywords, location, country):
    script_paths = [
        os.path.join(r'C:\Users\Ionut\Desktop\LoginSignupNativeMern-main\LICENTACV - PROIECT\matchingCV\step1', 'getJdFromIndeed.py'),
        os.path.join(r'C:\Users\Ionut\Desktop\LoginSignupNativeMern-main\LICENTACV - PROIECT\matchingCV\step1', 'getJdFromLlinkedInJobs.py')
    ]

    args = [keywords, location, country]

    output_queue = Queue()
    threads = []

    thread = threading.Thread(target=run_script, args=(script_paths[0], args, output_queue))
    threads.append(thread)
    thread.start()

    thread = threading.Thread(target=run_script, args=(script_paths[1], args, output_queue))
    threads.append(thread)
    thread.start()

    for thread in threads:
        thread.join()

    outputs = []
    
    dataIndeed, dataLinkedIn = check_for_no_registrations(output_queue)
    
    if dataIndeed is None and dataLinkedIn is None:
        while not output_queue.empty():
            outputs.append(output_queue.get())
        return outputs
    
    while not output_queue.empty():
        outputs.append(output_queue.get())

    if any(output['returncode'] != 0 for output in outputs) and (dataIndeed is not None or dataLinkedIn is not None):
        outputs = [output for output in outputs if output['returncode'] == 0]

    print(outputs)
    return outputs
