import pandas as pd
import re
import sys
from . import getJDData


def load_data():
    dataframeIndeed, dataframeLinkedIn = getJDData.check_for_no_registrations()
    if dataframeIndeed is not None and dataframeLinkedIn is not None:
        dataframes = [dataframeIndeed, dataframeLinkedIn]
        dataframes_merged = pd.concat(dataframes, ignore_index=True)
        dataframes_merged_sorted = dataframes_merged.sort_values(by="ID")
        return dataframes_merged_sorted
    elif dataframeIndeed is not None:
        return dataframeIndeed
    elif dataframeLinkedIn is not None:
        return dataframeLinkedIn
    else:
        return None

def preprocess_data(df):
    df = df.dropna(subset=['url', 'description'])
    df = df[df['url'].str.strip() != '']
    df = df[df['description'].str.strip() != '']

    df = df.drop_duplicates()

    df['title'] = " " + df['title'].str.strip()
    df['company'] = " " + df['company'].str.strip()
    df['location'] = " " + df['location'].str.strip()
    df['location'] = df['location'].apply(lambda x: ','.join(set(x.split(','))))
    df['description'] = " " + df['description'].str.lower().str.strip()

    df['location'] = df['location'].apply(lambda x: re.sub(r'\s*,\s*', ', ', x))

    df['description'] = df['description'].apply(lambda x: re.sub(r'<.*?>', '', x))

    return df


def clean_the_jobs_data():
    dataframe = load_data()
    if dataframe is None or dataframe.empty:
        return None
    else:
        cleaned_dataframe = preprocess_data(dataframe)
        cleaned_dataframe.to_csv(r"C:\Users\Ionut\Desktop\LoginSignupNativeMern-main\LICENTACV - PROIECT\matchingCV\step3\CleanedJobData.csv")
        return cleaned_dataframe