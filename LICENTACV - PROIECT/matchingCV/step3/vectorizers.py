from __future__ import unicode_literals
import string
import math
import nltk

class MyCountVectorizer:
    def __init__(self, docs):
        self.corpus = self.normalize_corpus(docs)
        self.make_features()
        self.make_matrix()

    def normalize_corpus(self, docs):
        table = str.maketrans('', '', string.punctuation)
        norm_docs = []
        for doc_raw in docs:
            if not isinstance(doc_raw, str):
                doc_raw = str(doc_raw)
            if doc_raw == 'nan':
                doc_raw = '' 
            doc = doc_raw.translate(table).lower()
            norm_docs.append(doc)
        return norm_docs

    def make_features(self):
        stopwords = nltk.corpus.stopwords.words('english')
        self.features = set()
        for doc in self.corpus:
            for word in doc.split():
                if word not in stopwords:
                    self.features.add(word)
        self.features = sorted(list(self.features))

    def make_matrix(self):
        self.matrix = []
        for doc in self.corpus:
            doc_vec = []
            for word in self.features:
                tf = self.term_freq(word, doc)
                doc_vec.append(tf)
            self.matrix.append(doc_vec)

    def term_freq(self, term, document):
        words = document.split()
        count = 0
        for word in words:
            if word == term:
                count += 1
        print(f"Processed term frequency for term '{term}'") 
        return count

    def print_matrix(self):
        for vec in self.matrix:
            print(vec)

    def get_matrix(self):
        return self.matrix

    def get_features(self):
        return self.features

    def get_density(self):
        counter = 0
        total = 0
        for row in self.matrix:
            for item in row:
                if item != 0:
                    counter += 1
                total += 1
        return 1.0 * counter / total

        
class MyTfIdfVectorizer(MyCountVectorizer):
    def make_matrix(self):
        term_frequencies = []
        for doc in self.corpus:
            freq_dict = {}
            words = doc.split()
            for word in words:
                if word in self.features: 
                    if word not in freq_dict:
                        freq_dict[word] = 0
                    freq_dict[word] += 1
            term_frequencies.append(freq_dict)

        self.matrix = []
        for freq_dict in term_frequencies:
            doc_vec = []
            for feature in self.features:
                tf = freq_dict.get(feature, 0)
                idf = self.inverse_document_freq(feature, term_frequencies) 
                tf_idf = tf * idf
                doc_vec.append(tf_idf)
            total = sum(doc_vec)
            doc_vec_norm = [x / total if total > 0 else 0 for x in doc_vec]
            self.matrix.append(doc_vec_norm)

    def inverse_document_freq(self, term, term_frequencies):
        doc_count = 0
        for freq_dict in term_frequencies:
            if term in freq_dict:
                doc_count += 1
        return math.log(1 + (1.0 * (len(self.corpus) + 1) / (doc_count + 1)))