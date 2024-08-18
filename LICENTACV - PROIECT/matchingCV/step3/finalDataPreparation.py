import pandas as pd

def finalDataPreparation(cos_dist, cleaned_dataframe):
    print(f"Length of cos_dist: {len(cos_dist)}")
    print(f"Length of cleaned_dataframe: {len(cleaned_dataframe)}")
    
    if len(cos_dist) != len(cleaned_dataframe):
        raise ValueError("The length of cosine distances does not match the length of the DataFrame minus one for the resume entry.")
    
    cleaned_dataframe['cos_dist'] = cos_dist
    cleaned_dataframe = cleaned_dataframe.sort_values(by="cos_dist", ascending=False)
    cleaned_dataframe = cleaned_dataframe.drop(['description', 'ID'], axis=1)
    cleaned_dataframe['ID'] = range(1, len(cleaned_dataframe) + 1)
    return cleaned_dataframe