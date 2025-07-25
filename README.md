# Movie Recommendation System

This is a simple content-based movie recommendation system. The user can enter a movie title and get a list of similar movies.

## Features

-   Get movie recommendations based on a movie title.
-   Get a random movie suggestion.
-   Simple and clean user interface.

## Getting Started

### Prerequisites

-   Python 3.7+
-   pip

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repository.git
    cd your-repository
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install the dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run app.py:**


## Usage

1.  Open your web browser and navigate to `http://127.0.0.1:8000`.
2.  Enter a movie title in the search bar and click "Get Recommendations".
3.  The system will display a list of recommended movies.
4.  You can also click the "Try Random Movie" button to get a random movie suggestion.

## How It Works

The recommendation system uses a content-based filtering approach. It calculates the cosine similarity between movies based on their tags. The tags are generated from the movie's genre, keywords, and other metadata.

The front-end is built with HTML, CSS, and JavaScript. The back-end is a Python server using the FastAPI framework.
