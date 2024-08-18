from flask import Flask, request, jsonify
import os
from step2 import resumeReader
from step1 import getJDData
from step3 import Word2VecModel, plot
from step1 import dataPreparation
from step3 import vectorizers
import nltk
import string
from sklearn.metrics.pairwise import cosine_distances
import numpy as np
import spacy
from step3 import finalDataPreparation
nlp = spacy.load("en_core_web_sm")
import pymongo
import requests
from apscheduler.schedulers.background import BackgroundScheduler
import time


app = Flask(__name__)


Word2VecModel.initialize_model()


def extract_keywords(text):
    doc = nlp(text)
    keywords = [token.text for token in doc if not token.is_stop and not token.is_punct and token.pos_ in ['NOUN', 'PROPN', 'ADJ', 'VERB']]
    return keywords

def get_the_resume():
    try:
        with open(r'C:\Users\Ionut\Desktop\LoginSignupNativeMern-main\LICENTACV - PROIECT\matchingCV\step2\resume.txt', 'r', encoding='utf-8') as file:
            resume = file.read()
        return resume
    except UnicodeDecodeError as e:
        print(f"Error decoding file: {e}")
        raise


def process_similarity(keywords):
    try:
        print("Starting process_similarity function")

        cleaned_dataframe = dataPreparation.clean_the_jobs_data()
        if cleaned_dataframe is None or cleaned_dataframe.empty:
            raise Exception("No data has been found!")
        print("Cleaned job data")

        if 'description' not in cleaned_dataframe.columns:
            raise ValueError("'description' column not found in the cleaned data")

        jd = cleaned_dataframe["description"].tolist() 
        print("Job descriptions extracted")

        resume = get_the_resume()
        print("Got the resume")

        jd.append(resume)  
        print("Resume added to job descriptions")

        myvec = vectorizers.MyTfIdfVectorizer(jd)
        print("TF-IDF vectorizer created")
        
        myvec.make_matrix()
        print("TF-IDF matrix created")

        word2vec_model = Word2VecModel.get_word2vec_model()
        print("Loaded Word2Vec model")

        important_words = keywords.split(' ')
        stopwords = nltk.corpus.stopwords.words('english')

        p = string.punctuation
        d = string.digits
        table_p = str.maketrans(p, len(p) * " ")
        table_d = str.maketrans(d, len(d) * " ")
        vec = []
        for i, j in enumerate(jd):
            x = j.translate(table_p)
            y = x.translate(table_d)
            jd_vector = []
            for word in y.split():
                if word.lower() not in stopwords and len(word)>1 and word not in important_words:
                    try:
                        mod = word2vec_model[word]
                        idx = myvec.get_features().index(word)
                        z = myvec.get_matrix()[i][idx]
                        lst = [a * z for a in mod]
                        jd_vector.append(lst)
                    except:
                        continue
                else:
                    try:
                        x = word2vec_model[word]
                        lst = [a * 2 for a in x]
                        jd_vector.append(lst)
                    except:
                        continue
            vec.append(jd_vector)

        mean_vec = []
        for j in vec:
            mean = []
            for i in range(300):
                accum = 0
                for word in j:
                    accum += word[i]
                mean.append(1.0*accum/len(word))
            mean_vec.append(mean)

        data = mean_vec
        # plot.plot_pca(data)

        cos_dist =[]
        for vec in data[:-1]:
            vec_reshaped = np.array(vec).reshape(1, -1)
            last_vec_reshaped = np.array(data[-1]).reshape(1, -1)
            distance = cosine_distances(vec_reshaped, last_vec_reshaped)
            cos_dist.append(float(distance[0][0]))

        return cos_dist, cleaned_dataframe
    except Exception as e:
        print(f"Error in process_similarity function: {e}")
        raise


def fetch_and_send_recommendations():
    try:
        mongo_uri = "mongodb+srv://nituantonia21:VXY93szCKh@cluster0.odni9oh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        db_name = "test"
        collection_name = "pdf_collection"
        node_service_url = "http://localhost:3000/send-email"
        client = pymongo.MongoClient(mongo_uri)
        db = client[db_name]
        collection = db[collection_name]

        users = collection.find({})
        for user in users:
            user_email = user['user_token']
            keywords = user.get('keywords', '')
            location_country = user.get('location', '')
            location = location_country.split(",")
            _id = str(user['_id'])
            
            getJDData.execute_scripts(keywords=keywords, location=location[0], country=location[1])

            cos_dist, cleaned_dataframe = process_similarity(keywords)
            final_results = finalDataPreparation.finalDataPreparation(cos_dist, cleaned_dataframe)
            print(final_results)
            email_content = {
                "email": user_email,
                "_id": _id,
                "results": final_results.to_dict(orient='records')
            }

            response = requests.post(node_service_url, json=email_content)
            if response.status_code != 200:
                print(f"Failed to send email to {user_email}: {response.text}")

    except Exception as e:
        print(f"Error fetching and sending recommendations: {e}")



@app.route('/model-status', methods=['GET'])
def model_status():
    try:
        model = Word2VecModel.get_word2vec_model()
        return jsonify({"message": "Model is loaded"})
    except Exception as e:
        return jsonify({"message": "Model failed to load or not loaded yet", "error": str(e)})


@app.route('/process-pdf', methods=['POST'])
def process_pdf():
    file = request.files['file']
    user_email = request.form['user_email']
    db_name = request.form['db_name']
    collection_name = request.form['collection_name']
    mongo_uri = request.form['mongo_uri']
    wants_to_be_in_db = request.form['wants_to_be_in_db'].lower() == 'true'
    print(wants_to_be_in_db)

    save_directory = os.path.join(os.getcwd(), 'uploads')
    os.makedirs(save_directory, exist_ok=True)

    file_path = os.path.join(save_directory, file.filename)
    file.save(file_path)

    try:
        resumeReader.insert_pdf_data_into_mongodb(file_path, user_email, db_name, collection_name, mongo_uri, wants_to_be_in_db)
    except Exception as e:
        print(e)
        return jsonify({"message": "Error processing PDF", "error": str(e)}), 500

    return jsonify({"message": "File processed and data inserted successfully"}), 200


@app.route('/process-filters', methods=['POST'])
def process_filters():
    data = request.json
    if 'filters' not in data or 'email' not in data or 'wants_to_be_in_db' not in data:
        return jsonify({"message": "Invalid request payload"}), 400

    selected_filters = data['filters']
    user_email = data['email']
    keywords = selected_filters.get('keywords', '')
    location = selected_filters.get('location', '')
    country = selected_filters.get('country', '')
    wants_to_be_in_db = data['wants_to_be_in_db']
    location_country = f"{location}, {country}"

    if wants_to_be_in_db:
        try:
            mongo_uri = "mongodb+srv://nituantonia21:VXY93szCKh@cluster0.odni9oh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
            db_name = "test"
            collection_name = "pdf_collection"
            resumeReader.update_also_user_filters(user_email, keywords, location_country, mongo_uri, db_name, collection_name)
        except Exception as e:
            return jsonify({"message": "An error occurred while saving filters", "error": str(e)}), 500

    try:
        script_outputs = getJDData.execute_scripts(keywords, location, country)
        print("Scripts executed successfully")

        error_occurred = any(output['stderr'] or 'error' in output['stdout'].lower() for output in script_outputs)

        if error_occurred:
            response = {
                "message": "An error occurred during script execution",
                "script_outputs": script_outputs
            }
            return jsonify(response), 500

        try:
            cos_dist, cleaned_dataframe = process_similarity(keywords)
            print("Similarity processing completed")
            final_results = finalDataPreparation.finalDataPreparation(cos_dist, cleaned_dataframe)
            print(final_results)
            response = {
                "message": "Filters processed and data inserted successfully",
                "script_outputs": script_outputs,
                "results": final_results.to_dict(orient='records')
            }

            return jsonify(response), 200
        except Exception as e:
            print(f"Error in similarity processing: {e}")
            return jsonify({"message": "An error occurred during similarity processing", "error": str(e)}), 500
    except Exception as e:
        print(f"Unknown error: {e}")
        return jsonify({"message": "An unknown error occurred", "error": str(e)}), 500


scheduler = BackgroundScheduler()
scheduler.add_job(fetch_and_send_recommendations, 'interval', weeks=1, max_instances=5)
scheduler.start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
