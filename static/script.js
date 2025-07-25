let allMovies = [];

document.addEventListener('DOMContentLoaded', function() {
    loadMoviesList();
    setupEventListeners();
});

function setupEventListeners() {
    const movieInput = document.getElementById('movieInput');
    movieInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getRecommendations();
        }
    });

    movieInput.addEventListener('input', function() {
        showSuggestions();
    });

   document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-section')) {
            hideSuggestions();
        }
    });
}

async function loadMoviesList() {
    try {
        const response = await fetch('/api/movies');
        const data = await response.json();
        if (data.success) {
            allMovies = data.movies;
        }
    } catch (error) {
        console.error('Error loading movies list:', error);
    }
}

function showSuggestions() {
    const input = document.getElementById('movieInput');
    const suggestionsDiv = document.getElementById('suggestions');
    const query = input.value.toLowerCase().trim();

    if (query.length < 2) {
        suggestionsDiv.innerHTML = '';
        suggestionsDiv.style.display = 'none';
        return;
    }

    const matches = allMovies
        .filter(movie => movie.toLowerCase().includes(query))
        .slice(0, 5);

    if (matches.length > 0) {
        const suggestionsHTML = matches
            .map(movie => `<div class="suggestion-item" onclick="selectMovie('${movie.replace(/'/g, "\\'")}')">${movie}</div>`)
            .join('');
        
        suggestionsDiv.innerHTML = suggestionsHTML;
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.innerHTML = '';
        suggestionsDiv.style.display = 'none';
    }
}

function selectMovie(movieName) {
    document.getElementById('movieInput').value = movieName;
    hideSuggestions();
    getRecommendations();
}

function hideSuggestions() {
    document.getElementById('suggestions').style.display = 'none';
}

async function getRecommendations() {
    const movieName = document.getElementById('movieInput').value.trim();
    
    if (!movieName) {
        showError('Please enter a movie name');
        return;
    }

    showLoading();
    hideError();
    hideResults();

    try {
        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ movie_name: movieName })
        });

        const data = await response.json();

        if (data.success) {
            displayRecommendations(data.recommended_movies, data.message);
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('An error occurred while fetching recommendations. Please try again.');
    } finally {
        hideLoading();
    }
}

async function getRandomMovie() {
    try {
        const response = await fetch('/api/random-movie');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('movieInput').value = data.movie;
            getRecommendations();
        }
    } catch (error) {
        console.error('Error getting random movie:', error);
        showError('Error getting random movie. Please try again.');
    }
}

function displayRecommendations(movies, message) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsTitle = document.getElementById('resultsTitle');
    const moviesGrid = document.getElementById('moviesGrid');

    resultsTitle.textContent = message;
    
    const moviesHTML = movies
        .map((movie, index) => `
            <div class="movie-card">
                <h3>${index + 1}. ${movie}</h3>
                <button onclick="selectMovie('${movie.replace(/'/g, "\\'")}')" class="secondary-btn">
                    Get Similar Movies
                </button>
            </div>
        `)
        .join('');

    moviesGrid.innerHTML = moviesHTML;
    resultsSection.style.display = 'block';
    
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

function hideResults() {
    document.getElementById('resultsSection').style.display = 'none';
}

function clearResults() {
    document.getElementById('movieInput').value = '';
    hideResults();
    hideError();
    hideSuggestions();
}
