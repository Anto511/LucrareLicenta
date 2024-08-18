from flask import Flask
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.pdfpage import PDFPage
from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams
import io
import pymongo
import os

app = Flask(__name__)

def pdfparser(data):
    try:
        with open(data, 'rb') as fp:
            rsrcmgr = PDFResourceManager()
            retstr = io.StringIO()
            laparams = LAParams()
            device = TextConverter(rsrcmgr, retstr, laparams=laparams)
            interpreter = PDFPageInterpreter(rsrcmgr, device)
            for page in PDFPage.get_pages(fp):
                interpreter.process_page(page)
            text = retstr.getvalue()
            device.close()
            retstr.close()
        return text
    except FileNotFoundError:
        raise FileNotFoundError(f"File {data} not found.")
    except Exception as e:
        raise Exception(f"Error parsing PDF: {str(e)}")

def insert_pdf_data_into_mongodb(pdf_path, user_email, db_name, collection_name, mongo_uri, wants_to_be_in_db):
    print(wants_to_be_in_db)

    if wants_to_be_in_db:
        try:
            client = pymongo.MongoClient(mongo_uri)
            db = client[db_name]
            collection = db[collection_name]
        except pymongo.errors.ConnectionError:
            raise ConnectionError(f"Could not connect to MongoDB at {mongo_uri}")
        except Exception as e:
            raise Exception(f"Error connecting to MongoDB: {str(e)}")

    try:
        pdf_text = pdfparser(pdf_path)
    except Exception as e:
        raise Exception(f"Error parsing PDF: {str(e)}")

    try:
        with open(r"C:\Users\Ionut\Desktop\LoginSignupNativeMern-main\LICENTACV - PROIECT\matchingCV\step2\resume.txt", 'w', encoding='utf-8') as txt_file:
            txt_file.write(pdf_text)
    except Exception as e:
        raise Exception(f"Error saving text content to file: {str(e)}")
    
    if wants_to_be_in_db:
        pdf_document = {
            "file_name": pdf_path,
            "content": pdf_text,
            "user_token": user_email
        }
        try:
            result = collection.update_one(
                {"user_token": user_email},
                {"$set": pdf_document},
                upsert=True
            )
            if result.matched_count:
                print(f"Document updated for user_token: {user_email}")
            else:
                print(f"New document inserted for user_token: {user_email}")
        except pymongo.errors.PyMongoError as e:
            raise Exception(f"Error inserting/updating document in MongoDB: {str(e)}")
    
def update_also_user_filters(user_email, keywords, location_country, mongo_uri, db_name, collection_name):
    try:
        client = pymongo.MongoClient(mongo_uri)
        db = client[db_name]
        collection = db[collection_name]

        filter_document = {
            "user_token": user_email,
            "keywords": keywords,
            "location": location_country
        }

        result = collection.update_one(
            {"user_token": user_email},
            {"$set": filter_document},
            upsert=True
        )

        if result.matched_count:
            print(f"Filters updated for user_token: {user_email}")
        else:
            print(f"New filters inserted for user_token: {user_email}")

    except pymongo.errors.PyMongoError as e:
        print(f"Error updating/inserting filters in MongoDB: {e}")
        raise Exception(f"Error updating/inserting filters in MongoDB: {str(e)}")


if __name__ == "__main__":
    app.run(debug=True)
