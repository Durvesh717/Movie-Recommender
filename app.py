from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel
import pickle
from typing import List
import uvicorn

try:
    movies = pickle.load(open('movies.pkl', 'rb'))
    vectorizer = TfidfVectorizer(max_features=5000,stop_words='english')
    vectors = vectorizer.fit_transform(movies['tags']).toarray()
    similarity = cosine_similarity(vectors)
except FileNotFoundError as e:
    print(f"Error loading models: {e}")
    print("Please make sure movies.pkl is in the current directory")
    exit(1)

app = FastAPI(title="Movie Recommendation System")

app.mount("/static", StaticFiles(directory="static"), name="static")

class MovieRequest(BaseModel):
    movie_name: str

class RecommendationResponse(BaseModel):
    recommended_movies: List[str]
    success: bool
    message: str = ""

def recommend_movies(movie_name: str) -> List[str]:
    try:
        movie_matches = movies[movies['title'].str.contains(movie_name, case=False, na=False)]
        
        if movie_matches.empty:
            return []
        movie_index = movie_matches.index[0]
        distances = sorted(enumerate(similarity[movie_index]), key=lambda x: x[1], reverse=True)
        recommended_movies = [movies.iloc[i[0]]['title'] for i in distances[1:6]]        
        return recommended_movies
    
    except Exception as e:
        print(f"Error in recommendation: {e}")
        return []

@app.get("/")
async def serve_frontend():
    return FileResponse('static/index.html')

@app.get("/api/movies")
async def get_all_movies():
    try:
        movie_list = movies['title'].tolist()
        return {"movies": movie_list, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching movies: {str(e)}")

@app.post("/api/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: MovieRequest):
    try:
        movie_name = request.movie_name.strip()
        
        if not movie_name:
            return RecommendationResponse(
                recommended_movies=[],
                success=False,
                message="Please enter a movie name"
            )
        
        recommendations = recommend_movies(movie_name)
        
        if not recommendations:
            return RecommendationResponse(
                recommended_movies=[],
                success=False,
                message=f"Movie '{movie_name}' not found. Please try another movie."
            )
        
        return RecommendationResponse(
            recommended_movies=recommendations,
            success=True,
            message=f"Recommendations for '{movie_name}'"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.get("/api/random-movie")
async def get_random_movie():
    try:
        random_movie = movies.sample(1).iloc[0]['title']
        return {"movie": random_movie, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting random movie: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)