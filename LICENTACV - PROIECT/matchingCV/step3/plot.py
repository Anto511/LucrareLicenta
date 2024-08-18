import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA


def plot_pca(mean_vec):
    pca = PCA(n_components=2)
    X = pca.fit_transform(mean_vec)
    xs, ys = X[:, 0], X[:, 1]
    plt.scatter(xs, ys)
    plt.scatter(xs[-1], ys[-1], c='Red', marker='+')
    plt.text(xs[-1], ys[-1], 'resume')
    plt.title('PCA')
    plt.grid(True)
    plt.savefig(r'C:\Users\Ionut\Desktop\LoginSignupNativeMern-main\LICENTACV - PROIECT\matchingCV\step3\distance_PCA.png')
    plt.show()
