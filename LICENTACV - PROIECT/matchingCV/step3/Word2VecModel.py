import gensim
import threading

class Word2VecModel:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, model_path):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(Word2VecModel, cls).__new__(cls)
                cls._instance.model = None
                cls._instance.status = "loading"
                cls._instance.error = None
                threading.Thread(target=cls._instance._load_model, args=(model_path,)).start()
        return cls._instance

    def _load_model(self, model_path):
        try:
            print("Loading Word2Vec model...")
            self.model = gensim.models.KeyedVectors.load_word2vec_format(model_path, binary=True)
            self.status = "loaded"
            print("Model loaded successfully.")
        except Exception as e:
            self.model = None
            self.status = "failed"
            self.error = str(e)
            print(f"Failed to load model: {self.error}")

    @classmethod
    def get_model(cls):
        if cls._instance is not None and cls._instance.status == "loaded":
            return cls._instance.model
        else:
            raise Exception("Model not loaded or failed to load")

def initialize_model():
    model_path = r'D:\LICENTACV - PROIECT\matchingCV\step3\GoogleNews-vectors-negative300.bin'
    Word2VecModel(model_path)

def get_word2vec_model():
    return Word2VecModel.get_model()
