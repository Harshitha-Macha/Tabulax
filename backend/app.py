from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ctransformers import AutoModelForCausalLM
import pandas as pd
import numpy as np
from scipy.optimize import curve_fit
from sklearn.metrics import mean_squared_error
import re
from datetime import datetime
import io
import os
import mysql.connector
from pymongo import MongoClient
import threading
import time
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Load Mistral 7B GGUF model
model_path = "C:/Users/hrush/OneDrive/Documents/Project/backend/models/mistral-7b-instruct-v0.1.Q8_0.gguf"
try:
    llm = AutoModelForCausalLM.from_pretrained(model_path, model_type="mistral", gpu_layers=0)
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# --- Gemini API Key Setup ---
# Set your Gemini API key as an environment variable before running:
#   export GEMINI_API_KEY='your-gemini-api-key-here'
GEMINI_API_KEY = "AIzaSyAvaZMqGztkUucVixDTzauwsdy4pj5hmVY"
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def numeric_module(train_df):
    try:
        X = pd.to_numeric(train_df["source"], errors="raise")
        y = pd.to_numeric(train_df["target"], errors="raise")
    except Exception as e:
        raise ValueError(f"Non-numeric data found in 'source' or 'target': {e}")

    def linear(x, a): return a * x
    def linear_with_intercept(x, a, b): return a * x + b
    def quadratic(x, a, b, c): return a * x**2 + b * x + c
    def exponential(x, a, b): return a * np.exp(b * x)
    def rational(x, a, b, c): return (a * x + b) / (x + c)
    def logarithmic(x, a, b): return a * np.log(x) + b
    def powerlaw(x, a, b): return a * x**b

    funcs = {
        "Simple Multiplication": linear,
        "Linear": linear_with_intercept,
        "Quadratic": quadratic,
        "Exponential": exponential,
        "Rational": rational,
        "Logarithmic": logarithmic,
        "Power Law": powerlaw,
    }

    models = {}
    for name, func in funcs.items():
        try:
            if name in ["Logarithmic", "Power Law"] and np.any(X <= 0):
                continue
                
            if name == "Simple Multiplication":
                ratios = y / X
                if np.allclose(ratios, ratios[0], rtol=0.01):
                    a = np.mean(ratios)
                    popt = [a]
                    y_pred = func(X, *popt)
                    mse = mean_squared_error(y, y_pred)
                    r2 = 1 - np.sum((y - y_pred) ** 2) / np.sum((y - np.mean(y)) ** 2)
                    models[name] = (func, popt, mse, r2)
                    continue

            popt, _ = curve_fit(func, X, y, maxfev=5000)
            y_pred = func(X, *popt)
            mse = mean_squared_error(y, y_pred)
            r2 = 1 - np.sum((y - y_pred) ** 2) / np.sum((y - np.mean(y)) ** 2)
            models[name] = (func, popt, mse, r2)
        except:
            continue

    if not models:
        raise ValueError("No valid numeric model could be fitted.")

    best_name, (best_func, best_params, best_mse, best_r2) = min(models.items(), key=lambda x: (x[1][2], -x[1][3]))

    param_names = ['a', 'b', 'c']
    func_desc = f"Function type: {best_name}\n"
    if best_name == "Simple Multiplication":
        func_desc += f"Formula: y = {best_params[0]:.4f} * x"
    elif best_name == "Linear":
        func_desc += f"Formula: y = {best_params[0]:.4f} * x + {best_params[1]:.4f}"
    elif best_name == "Quadratic":
        func_desc += f"Formula: y = {best_params[0]:.4f} * x² + {best_params[1]:.4f} * x + {best_params[2]:.4f}"
    elif best_name == "Exponential":
        func_desc += f"Formula: y = {best_params[0]:.4f} * e^({best_params[1]:.4f} * x)"
    elif best_name == "Rational":
        func_desc += f"Formula: y = ({best_params[0]:.4f} * x + {best_params[1]:.4f}) / (x + {best_params[2]:.4f})"
    elif best_name == "Logarithmic":
        func_desc += f"Formula: y = {best_params[0]:.4f} * ln(x) + {best_params[1]:.4f}"
    elif best_name == "Power Law":
        func_desc += f"Formula: y = {best_params[0]:.4f} * x^{best_params[1]:.4f}"

    func_desc += f"\nMean Squared Error: {best_mse:.6f}"
    func_desc += f"\nR-squared Score: {best_r2:.6f}"

    print(f"✅ Selected Numeric Model: {best_name}")
    print(func_desc)

    return best_func, best_params, func_desc

def call_with_timeout(func, args=(), kwargs=None, timeout=60):
    """Run func with timeout. If it doesn't finish, raise TimeoutError."""
    if kwargs is None:
        kwargs = {}
    result = {}
    def target():
        try:
            result['value'] = func(*args, **kwargs)
        except Exception as e:
            result['error'] = e
    thread = threading.Thread(target=target)
    thread.start()
    thread.join(timeout)
    if thread.is_alive():
        raise TimeoutError('Local model timed out')
    if 'error' in result:
        raise result['error']
    return result.get('value')

def gemini_generate(prompt, max_tokens=200):
    if not GEMINI_API_KEY:
        raise RuntimeError('Gemini API key not set')
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt, generation_config={"max_output_tokens": max_tokens})
    return response.text.strip()

def robust_llm_call(prompt, max_new_tokens=200, temperature=0.0):
    # Try local model with timeout, fallback to Gemini if needed
    try:
        return call_with_timeout(lambda: llm(prompt, max_new_tokens=max_new_tokens, temperature=temperature), timeout=60)
    except Exception as e:
        print(f"[LLM Fallback] Local model failed: {e}. Switching to Gemini API.")
        return gemini_generate(prompt, max_tokens=max_new_tokens)

def classify_transformation_type(train_df):
    import re
    # If any value in source or target contains both digits and letters, classify as algorithmic
    def has_digit_and_letter(val):
        val = str(val)
        return bool(re.search(r'[A-Za-z]', val)) and bool(re.search(r'\d', val))
    # If any value contains both digits and any special character, classify as algorithmic
    def has_digit_and_special(val):
        val = str(val)
        # Special character: any non-alphanumeric character
        return bool(re.search(r'\d', val)) and bool(re.search(r'[^A-Za-z0-9]', val))
    if (
        train_df['source'].apply(has_digit_and_letter).any() or
        train_df['target'].apply(has_digit_and_letter).any() or
        train_df['source'].apply(has_digit_and_special).any() or
        train_df['target'].apply(has_digit_and_special).any()
    ):
        return 'algorithmic'
    # If the data is a mix of numbers and strings, classify as 'algorithmic'
    def is_number(val):
        try:
            float(val)
            return True
        except Exception:
            return False
    sources = train_df['source'].astype(str)
    targets = train_df['target'].astype(str)
    source_is_num = sources.apply(is_number)
    target_is_num = targets.apply(is_number)
    # If both columns have a mix of numeric and non-numeric values, classify as algorithmic
    if (not source_is_num.all() and not (~source_is_num).all()) or (not target_is_num.all() and not (~target_is_num).all()):
        return 'algorithmic'
    # Otherwise, use LLM to classify
    example = train_df.iloc[0]
    prompt = f"""You are a transformation classifier. Based on the examples, classify the transformation as one of the following types:
- String: simple formatting or case changes
- Numeric: mathematical or formula-based transformations
- Algorithmic: involves parsing, extracting, reordering, or logic
- General: mappings or lookups
Source: \"{example['source']}\"
Target: \"{example['target']}\"
Transformation Type:
""".strip()
    response = robust_llm_call(prompt, max_new_tokens=20, temperature=0.0)
    result = response.strip()
    return result.split("Transformation Type:")[-1].strip().split("\n")[0]

def normalize_transformation_type(raw_type):
    raw_type = raw_type.lower()
    if "string" in raw_type or "case" in raw_type or "format" in raw_type:
        return "string"
    elif "numeric" in raw_type or "number" in raw_type:
        return "numeric"
    elif "algorithmic" in raw_type or "rule" in raw_type or "logic" in raw_type:
        return "algorithmic"
    elif "general" in raw_type or "lookup" in raw_type:
        return "general"
    else:
        return "string"

def is_numeric_dataframe(df):
    try:
        pd.to_numeric(df['source'])
        pd.to_numeric(df['target'])
        return True
    except Exception:
        return False

def generate_llm_function(train_df, task_type, force_gemini=False):
    # Always use Gemini for algorithmic and general
    if task_type in ["algorithmic", "general"]:
        force_gemini = True
    prompt_head = {
        "string": "Generate a Python function named `transform` that performs string formatting based on the examples below.",
        "algorithmic": "Generate a Python function named `transform` to apply logic-based transformations (e.g., date parsing).",
        "general": "Generate a Python function named `transform` that maps inputs to outputs using dictionary logic."
    }
    prompt = prompt_head[task_type] + "\n\n"
    for _, row in train_df.iterrows():
        prompt += f"Input: {row['source']}\nOutput: {row['target']}\n"
    prompt += "\nReturn a complete, runnable Python function named transform, including any necessary import statements. Do not explain anything."
    if force_gemini:
        response = gemini_generate(prompt, max_tokens=200)
    else:
        try:
            response = call_with_timeout(lambda: llm(prompt, max_new_tokens=200, temperature=0.0), timeout=60)
        except Exception as e:
            print(f"[LLM Fallback] Local model failed: {e}. Switching to Gemini API.")
            response = gemini_generate(prompt, max_tokens=200)
    result = response.strip()
    # Try to extract a valid Python function block
    fn_code = None
    # 1. Try to extract code block if present
    code_block = re.search(r'```(?:python)?\n(.*?)```', result, re.DOTALL)
    if code_block:
        candidate = code_block.group(1).strip()
        if candidate.startswith('def transform'):
            fn_code = candidate
    # 2. If not found, try to extract function definition directly
    if not fn_code:
        match = re.search(r'(def\s+transform\s*\([^)]*\):(?:\n(?:[ ]{4}|\t)[^\n]*)*)', result)
        if not match:
            match = re.search(r'(def\s+transform.*?(?:\n\s+.*?)*?)(?:\n\s*\n|$)', result, re.DOTALL)
        if match:
            fn_code = match.group(1).strip()
    # 3. If still not found, try to auto-indent lines after def
    if not fn_code and 'def transform' in result:
        lines = result.splitlines()
        start = None
        for i, line in enumerate(lines):
            if line.strip().startswith('def transform'):
                start = i
                break
        if start is not None:
            body = []
            for l in lines[start+1:]:
                if l.strip() == '' or l.startswith('def '):
                    break
                # Ensure indentation
                if not l.startswith('    '):
                    l = '    ' + l
                body.append(l)
            if body:
                fn_code = lines[start] + '\n' + '\n'.join(body)
    if not fn_code:
        raise ValueError("⚠️ No valid function block found in LLM output.")
    # 4. Try to compile, if fails, try to auto-indent all lines after def
    try:
        compile(fn_code, '<string>', 'exec')
    except SyntaxError as e:
        # Try to auto-indent all lines after def
        lines = fn_code.splitlines()
        if lines:
            def_line = lines[0]
            body_lines = ['    ' + l.lstrip() for l in lines[1:]]
            fixed_code = def_line + '\n' + '\n'.join(body_lines)
            try:
                compile(fixed_code, '<string>', 'exec')
                fn_code = fixed_code
            except SyntaxError:
                raise ValueError(f"⚠️ Generated function has syntax errors (even after auto-fix): {str(e)}\nCode:\n{fn_code}")
        else:
            raise ValueError(f"⚠️ Generated function has syntax errors: {str(e)}\nCode:\n{fn_code}")
    print(f"🔧 Generated Python Function:\n{fn_code}")
    return fn_code

def apply_llm_function(function_code, inputs):
    """
    Given a string of Python code defining a function 'transform',
    execute it and apply 'transform' to each element in 'inputs'.
    'inputs' can be a pandas Series or a list.
    Returns a list of outputs.
    """
    import datetime
    global_scope = {'datetime': datetime}
    exec(function_code, global_scope)
    if 'transform' not in global_scope:
        raise ValueError("No 'transform' function defined in the provided function code")
    transform = global_scope['transform']
    return [transform(x) for x in inputs]

@app.route('/preview-transform', methods=['POST'])
def preview_transform():
    try:
        if 'train_file' not in request.files:
            return jsonify({"error": "Train file is required."}), 400

        train_file = request.files['train_file']
        if not train_file.filename.endswith('.csv'):
            return jsonify({"error": "Only CSV files are allowed."}), 400

        try:
            train_df = pd.read_csv(train_file)
        except Exception as e:
            return jsonify({"error": f"Error reading CSV file: {str(e)}"}), 400

        if not {'source', 'target'}.issubset(train_df.columns):
            return jsonify({"error": "Train file must contain 'source' and 'target' columns."}), 400

        if is_numeric_dataframe(train_df):
            try:
                func, params, func_desc = numeric_module(train_df)
                examples = train_df.head(5)
                example_transformations = []
                for _, row in examples.iterrows():
                    result = func(float(row['source']), *params) if isinstance(row['source'], (int, float)) else func(row['source'], *params)
                    example_transformations.append({
                        "input": str(row['source']),
                        "expected": str(row['target']),
                        "predicted": f"{result:.4f}" if isinstance(result, (int, float)) else str(result)
                    })
                return jsonify({
                    "type": "numeric",
                    "description": func_desc,
                    "examples": example_transformations,
                    "transformation_type": "numeric",
                    "func_name": func.__name__,
                    "params": params.tolist() if hasattr(params, 'tolist') else list(params)  # Always return a list
                })
            except Exception as e:
                return jsonify({"error": f"Error in numeric preview: {str(e)}"}), 500
        else:
            try:
                raw_type = classify_transformation_type(train_df)
                transformation_type = normalize_transformation_type(raw_type)
                # 1. Generate function with local model only
                fn_code = generate_llm_function(train_df, transformation_type.lower(), force_gemini=False)
                transformed = apply_llm_function(fn_code, train_df['source'].head(5))
                # 2. Check if all predictions match targets
                targets = train_df['target'].head(5)
                if not all(str(predicted) == str(expected) for predicted, expected in zip(transformed, targets)):
                    # 3. If not, regenerate with Gemini
                    fn_code = generate_llm_function(train_df, transformation_type.lower(), force_gemini=True)
                    transformed = apply_llm_function(fn_code, train_df['source'].head(5))
                    used_fallback = True
                else:
                    used_fallback = False
                example_transformations = []
                for idx, (input_val, expected, predicted) in enumerate(zip(train_df['source'].head(5), targets, transformed)):
                    example_transformations.append({
                        "input": str(input_val),
                        "expected": str(expected),
                        "predicted": str(predicted)
                    })
                return jsonify({
                    "type": "llm",
                    "description": fn_code,
                    "examples": example_transformations,
                    "transformation_type": transformation_type,
                    "used_fallback": used_fallback
                })
            except Exception as e:
                return jsonify({"error": f"Error in LLM preview: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/preview-apply', methods=['POST'])
def preview_apply():
    try:
        if 'train_file' not in request.files or 'test_file' not in request.files:
            return jsonify({"error": "Both train.csv and test.csv are required."}), 400

        train_file = request.files['train_file']
        test_file = request.files['test_file']
        transformation_type = request.form.get('transformation_type')

        if not transformation_type:
            return jsonify({"error": "Transformation type is required."}), 400

        if not (train_file.filename.endswith('.csv') and test_file.filename.endswith('.csv')):
            return jsonify({"error": "Only CSV files are allowed."}), 400

        try:
            train_df = pd.read_csv(train_file)
            test_df = pd.read_csv(test_file)
        except Exception as e:
            return jsonify({"error": f"Error reading CSV files: {str(e)}"}), 400

        if not {'source', 'target'}.issubset(train_df.columns) or 'source' not in test_df.columns:
            return jsonify({"error": "CSV files must contain required columns: 'source' and 'target' for train, 'source' for test."}), 400

        if is_numeric_dataframe(train_df):
            try:
                func, params, _ = numeric_module(train_df)
                test_subset = test_df.head(5)
                test_subset["predicted"] = test_subset["source"].apply(lambda x: func(float(x), *params) if isinstance(x, (int, float)) else func(x, *params))
                examples = []
                for _, row in test_subset.iterrows():
                    examples.append({
                        "input": str(row['source']),
                        "predicted": f"{row['predicted']:.4f}" if isinstance(row['predicted'], (int, float)) else str(row['predicted'])
                    })
                return jsonify({"examples": examples})
            except Exception as e:
                return jsonify({"error": f"Error in numeric preview: {str(e)}"}), 500
        else:
            # Use same fallback logic as preview-transform
            raw_type = classify_transformation_type(train_df)
            transformation_type_norm = normalize_transformation_type(raw_type)
            fn_code = generate_llm_function(train_df, transformation_type_norm.lower(), force_gemini=False)
            test_subset = test_df.head(5)
            test_subset["predicted"] = apply_llm_function(fn_code, test_subset["source"])
            # Check if all predictions match targets in train set
            targets = train_df['target'].head(5)
            transformed_train = apply_llm_function(fn_code, train_df['source'].head(5))
            if not all(str(predicted) == str(expected) for predicted, expected in zip(transformed_train, targets)):
                fn_code = generate_llm_function(train_df, transformation_type_norm.lower(), force_gemini=True)
                test_subset["predicted"] = apply_llm_function(fn_code, test_subset["source"])
            examples = []
            for _, row in test_subset.iterrows():
                examples.append({
                    "input": str(row['source']),
                    "predicted": str(row['predicted'])
                })
            return jsonify({"examples": examples})
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/transform', methods=['POST'])
def transform():
    try:
        if 'train_file' not in request.files or 'test_file' not in request.files:
            return jsonify({"error": "Both train.csv and test.csv are required."}), 400

        train_file = request.files['train_file']
        test_file = request.files['test_file']
        transformation_type = request.form.get('transformation_type')

        if not transformation_type:
            return jsonify({"error": "Transformation type is required."}), 400

        if not (train_file.filename.endswith('.csv') and test_file.filename.endswith('.csv')):
            return jsonify({"error": "Only CSV files are allowed."}), 400

        try:
            train_df = pd.read_csv(train_file)
            test_df = pd.read_csv(test_file)
        except Exception as e:
            return jsonify({"error": f"Error reading CSV files: {str(e)}"}), 400

        if not {'source', 'target'}.issubset(train_df.columns) or 'source' not in test_df.columns:
            return jsonify({"error": "CSV files must contain required columns: 'source' and 'target' for train, 'source' for test."}), 400

        if is_numeric_dataframe(train_df):
            try:
                func, params, _ = numeric_module(train_df)
                test_df["predicted"] = test_df["source"].apply(lambda x: func(x, *params))
            except Exception as e:
                return jsonify({"error": f"Error in numeric transformation: {str(e)}"}), 500
        else:
            # Use same fallback logic as preview-transform
            raw_type = classify_transformation_type(train_df)
            transformation_type_norm = normalize_transformation_type(raw_type)
            fn_code = generate_llm_function(train_df, transformation_type_norm.lower(), force_gemini=False)
            # Check if all predictions match targets in train set
            targets = train_df['target'].head(5)
            transformed_train = apply_llm_function(fn_code, train_df['source'].head(5))
            if not all(str(predicted) == str(expected) for predicted, expected in zip(transformed_train, targets)):
                fn_code = generate_llm_function(train_df, transformation_type_norm.lower(), force_gemini=True)
            test_df["predicted"] = apply_llm_function(fn_code, test_df["source"])
        output_buffer = io.BytesIO()
        test_df.to_csv(output_buffer, index=False)
        output_buffer.seek(0)
        return send_file(output_buffer, download_name="transformed_output.csv", as_attachment=True)
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/mysql/databases', methods=['POST'])
def get_mysql_databases():
    data = request.json
    password = data.get('password')
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password=password
        )
        cursor = conn.cursor()
        cursor.execute("SHOW DATABASES")
        dbs = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify({'databases': dbs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mysql/tables', methods=['POST'])
def get_mysql_tables():
    data = request.json
    password = data.get('password')
    database = data.get('database')
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password=password,
            database=database
        )
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify({'tables': tables})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mysql/columns', methods=['POST'])
def get_mysql_columns():
    data = request.json
    password = data.get('password')
    database = data.get('database')
    table = data.get('table')
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password=password,
            database=database
        )
        cursor = conn.cursor()
        cursor.execute(f"SHOW COLUMNS FROM `{table}`")
        columns = [row[0] for row in cursor.fetchall()]
        cursor.close()
        conn.close()
        return jsonify({'columns': columns})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mysql/preview_table', methods=['POST'])
def preview_table():
    data = request.json
    password = data.get('password')
    database = data.get('database')
    table = data.get('table')
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password=password,
            database=database
        )
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM `{table}` LIMIT 5")
        rows = cursor.fetchall()
        colnames = [desc[0] for desc in cursor.description]
        cursor.close()
        conn.close()
        table_data = [dict(zip(colnames, row)) for row in rows]
        return jsonify({
            'headers': colnames,
            'data': table_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mysql/apply_transformation', methods=['POST'])
def mysql_apply_transformation():
    data = request.json
    password = data.get('password')
    database = data.get('database')
    table = data.get('table')
    column = data.get('column')
    transformation_type = data.get('transformation_type')
    function_code = data.get('function_code')
    func_name = data.get('func_name', None)
    params = data.get('params', [])

    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password=password,
            database=database
        )
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM `{table}`")
        rows = cursor.fetchall()
        colnames = [desc[0] for desc in cursor.description]
        col_index = colnames.index(column)

        if transformation_type == "numeric":
            numeric_funcs = {
                "linear": lambda x, a: a * x,
                "linear_with_intercept": lambda x, a, b: a * x + b,
                "quadratic": lambda x, a, b, c: a * x**2 + b * x + c,
                "exponential": lambda x, a, b: a * np.exp(b * x),
                "rational": lambda x, a, b, c: (a * x + b) / (x + c),
                "logarithmic": lambda x, a, b: a * np.log(x) + b,
                "powerlaw": lambda x, a, b: a * x**b,
            }
            if func_name not in numeric_funcs:
                return jsonify({'error': f"Invalid numeric function name: {func_name}"}), 400
            transform = lambda x: numeric_funcs[func_name](float(x), *params) if isinstance(x, (int, float, str)) else x
        else:
            if not function_code:
                return jsonify({'error': "Function code is required for LLM-based transformations"}), 400
            global_scope = {}
            exec(function_code, global_scope)
            if 'transform' not in global_scope:
                return jsonify({'error': "No 'transform' function defined in the provided function code"}), 400
            transform = global_scope['transform']

        new_rows = []
        for row in rows:
            row = list(row)
            try:
                row[col_index] = transform(row[col_index])
            except Exception as e:
                row[col_index] = row[col_index]
            new_rows.append(row)

        import csv
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(colnames)
        for row in new_rows:
            writer.writerow(row)
        output.seek(0)

        # --- Upload to MongoDB ---
        try:
            mongo_client = MongoClient('mongodb://127.0.0.1:27017/')
            mongo_db = mongo_client['transformations']
            mongo_collection = mongo_db[table]
            # Convert rows to dicts for MongoDB
            docs = [dict(zip(colnames, row)) for row in new_rows]
            mongo_collection.delete_many({})  # Clear previous data for this table
            if docs:
                mongo_collection.insert_many(docs)
        except Exception as mongo_exc:
            print(f"MongoDB upload error: {mongo_exc}")
        # --- End MongoDB upload ---

        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'{table}_transformed.csv'
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/mysql/apply_transformation_and_store', methods=['POST'])
def mysql_apply_transformation_and_store():
    data = request.json
    password = data.get('password')
    database = data.get('database')
    table = data.get('table')
    column = data.get('column')
    transformation_type = data.get('transformation_type')
    function_code = data.get('function_code')
    func_name = data.get('func_name', None)
    params = data.get('params', [])

    try:
        # Connect to source DB
        conn = mysql.connector.connect(
            host='localhost', user='root', password=password, database=database
        )
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM `{table}`")
        rows = cursor.fetchall()
        colnames = [desc[0] for desc in cursor.description]
        col_index = colnames.index(column)

        # Prepare transformation
        if transformation_type == "numeric":
            numeric_funcs = {
                "linear": lambda x, a: a * x,
                "linear_with_intercept": lambda x, a, b: a * x + b,
                "quadratic": lambda x, a, b, c: a * x**2 + b * x + c,
                "exponential": lambda x, a, b: a * np.exp(b * x),
                "rational": lambda x, a, b, c: (a * x + b) / (x + c),
                "logarithmic": lambda x, a, b: a * np.log(x) + b,
                "powerlaw": lambda x, a, b: a * x**b,
            }
            if func_name not in numeric_funcs:
                return jsonify({'error': f"Invalid numeric function name: {func_name}"}), 400
            transform = lambda x: numeric_funcs[func_name](float(x), *params) if isinstance(x, (int, float, str)) else x
        else:
            if not function_code:
                return jsonify({'error': "Function code is required for LLM-based transformations"}), 400
            global_scope = {}
            exec(function_code, global_scope)
            if 'transform' not in global_scope:
                return jsonify({'error': "No 'transform' function defined in the provided function code"}), 400
            transform = global_scope['transform']

        new_rows = []
        for row in rows:
            row = list(row)
            try:
                row[col_index] = transform(row[col_index])
            except Exception as e:
                row[col_index] = row[col_index]
            new_rows.append(row)

        # Connect to/create 'transformations' DB
        conn2 = mysql.connector.connect(
            host='localhost', user='root', password=password
        )
        cursor2 = conn2.cursor()
        cursor2.execute("CREATE DATABASE IF NOT EXISTS transformations")
        conn2.database = 'transformations'

        # Duplicate table schema
        cursor2.execute(f"DROP TABLE IF EXISTS `{table}`")
        cursor2.execute(f"CREATE TABLE `{table}` LIKE `{database}`.`{table}`")

        # Insert transformed data
        placeholders = ','.join(['%s'] * len(colnames))
        cursor2.executemany(
            f"INSERT INTO `{table}` ({','.join([f'`{c}`' for c in colnames])}) VALUES ({placeholders})",
            new_rows
        )
        conn2.commit()
        cursor2.close()
        conn.close()

        # Return preview of new table
        conn2 = mysql.connector.connect(
            host='localhost', user='root', password=password, database='transformations'
        )
        cursor2 = conn2.cursor()
        cursor2.execute(f"SELECT * FROM `{table}` LIMIT 5")
        preview_rows = cursor2.fetchall()
        preview_colnames = [desc[0] for desc in cursor2.description]
        preview_data = [dict(zip(preview_colnames, row)) for row in preview_rows]
        cursor2.close()
        conn2.close()
        return jsonify({'headers': preview_colnames, 'data': preview_data})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# --- MongoDB endpoints ---
@app.route('/api/mongo/databases', methods=['GET'])
def mongo_list_databases():
    try:
        client = MongoClient('mongodb://127.0.0.1:27017/')
        dbs = client.list_database_names()
        dbs = [db for db in dbs if db not in ('admin', 'local', 'config', 'transformations')]
        return jsonify({'databases': dbs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mongo/collections', methods=['GET'])
def mongo_list_collections():
    db = request.args.get('database')
    try:
        client = MongoClient('mongodb://127.0.0.1:27017/')
        collections = client[db].list_collection_names()
        return jsonify({'collections': collections})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mongo/preview', methods=['GET'])
def mongo_preview_collection():
    db = request.args.get('database')
    collection = request.args.get('collection')
    try:
        client = MongoClient('mongodb://127.0.0.1:27017/')
        docs = list(client[db][collection].find().limit(5))
        if not docs:
            return jsonify({'headers': [], 'data': []})
        headers = list(docs[0].keys())
        for d in docs:
            if '_id' in d:
                d['_id'] = str(d['_id'])
        return jsonify({'headers': headers, 'data': docs})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mongo/apply_transformation', methods=['POST'])
def mongo_apply_transformation():
    data = request.json
    database = data.get('database')
    collection = data.get('collection')
    column = data.get('column')
    transformation_type = data.get('transformation_type')
    function_code = data.get('function_code')
    func_name = data.get('func_name', None)
    params = data.get('params', [])
    try:
        client = MongoClient('mongodb://127.0.0.1:27017/')
        docs = list(client[database][collection].find())
        if not docs:
            return jsonify({'error': 'No documents found in collection'}), 400
        headers = list(docs[0].keys())
        if not column or column not in headers:
            return jsonify({'error': 'No valid column selected for transformation'}), 400
        # Prepare transformation
        if transformation_type == "numeric":
            numeric_funcs = {
                "linear": lambda x, a: a * x,
                "linear_with_intercept": lambda x, a, b: a * x + b,
                "quadratic": lambda x, a, b, c: a * x**2 + b * x + c,
                "exponential": lambda x, a, b: a * np.exp(b * x),
                "rational": lambda x, a, b, c: (a * x + b) / (x + c),
                "logarithmic": lambda x, a, b: a * np.log(x) + b,
                "powerlaw": lambda x, a, b: a * x**b,
            }
            if func_name not in numeric_funcs:
                return jsonify({'error': f"Invalid numeric function name: {func_name}"}), 400
            transform = lambda x: numeric_funcs[func_name](float(x), *params) if isinstance(x, (int, float, str)) else x
        else:
            if not function_code:
                return jsonify({'error': "Function code is required for LLM-based transformations"}), 400
            global_scope = {}
            exec(function_code, global_scope)
            if 'transform' not in global_scope:
                return jsonify({'error': "No 'transform' function defined in the provided function code"}), 400
            transform = global_scope['transform']
        new_docs = []
        for doc in docs:
            doc = dict(doc)
            try:
                doc[column] = transform(doc[column])
            except Exception as e:
                pass
            if '_id' in doc:
                doc['_id'] = str(doc['_id'])
            new_docs.append(doc)
        # Store in transformations DB
        tdb = client['transformations']
        tcol = tdb[collection]
        tcol.delete_many({})
        if new_docs:
            tcol.insert_many(new_docs)
        preview = {'headers': list(new_docs[0].keys()), 'data': new_docs[:5]} if new_docs else {'headers': [], 'data': []}
        return jsonify({'preview': preview})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)