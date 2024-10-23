import logging
from flask import Flask, request, jsonify
from scuapi import API
import requests
import json
import re
import os
import threading
import time
import difflib  # Per calcolare la somiglianza tra titoli
from googletrans import Translator  # Libreria per la traduzione

# Configurazione del logger
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s %(message)s')

app = Flask(__name__)

# Imposta il dominio StreamingCommunity da usare
sc = API('streamingcommunity.computer')

# Directory dei file JSON (modificato per essere compatibile con Heroku)
RESULTS_DIR = '/app/results/serietv'

# Creazione della directory results se non esiste
if not os.path.exists(RESULTS_DIR):
    os.makedirs(RESULTS_DIR)
    logging.info(f"Creata la directory dei risultati: {RESULTS_DIR}")

# TMDb API key (aggiungi qui la tua chiave API di TMDb, utilizza variabili d'ambiente su Heroku)
TMDB_API_KEY = os.environ.get('TMDB_API_KEY')
TMDB_API_URL = 'https://api.themoviedb.org/3/'

# Funzione per ottenere il titolo da IMDb tramite TMDb API
def get_title_from_imdb(imdb_id):
    try:
        response = requests.get(
            f"{TMDB_API_URL}find/{imdb_id}",
            params={"api_key": TMDB_API_KEY, "external_source": "imdb_id"},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            logging.info(f"Risposta da TMDb per IMDb ID {imdb_id}: {data}")
            if data.get("movie_results"):
                return {
                    "title": data["movie_results"][0]["title"].lower(),
                    "year": data["movie_results"][0]["release_date"].split("-")[0],
                    "type": "movie"
                }
            elif data.get("tv_results"):
                return {
                    "title": data["tv_results"][0]["name"].lower(),
                    "year": data["tv_results"][0]["first_air_date"].split("-")[0],
                    "type": "tv"
                }
        logging.error(f"Errore durante l'ottenimento dei metadati da IMDb ID '{imdb_id}' con TMDb: {response.status_code}")
    except requests.exceptions.RequestException as e:
        logging.error(f"Richiesta TMDb fallita: {e}")
    return None

# Funzione per tradurre il titolo di TMDb in italiano e convertirlo in minuscolo
def translate_title_to_italian(title):
    translator = Translator()
    try:
        translated = translator.translate(title, src='en', dest='it')
        translated_lower = translated.text.lower()
        logging.info(f"Titolo tradotto in italiano (minuscolo): {translated_lower}")
        return translated_lower
    except Exception as e:
        logging.error(f"Errore durante la traduzione del titolo: {e}")
        return title.lower()

# Funzione per normalizzare il testo
def normalize(text):
    return re.sub(r'[^a-zA-Z0-9]', '', text).lower()

# Funzione per calcolare la somiglianza tra i titoli
def calculate_title_similarity(title1, title2):
    return difflib.SequenceMatcher(None, normalize(title1), normalize(title2)).ratio()

# Funzione per trovare il best match tra i risultati
def find_best_match(search_results, tmdb_data):
    best_match = None
    max_score = 0

    min_similarity_threshold = 0.3

    tmdb_title_original = tmdb_data.get('title', '').lower()
    tmdb_title_translated = translate_title_to_italian(tmdb_title_original)

    if isinstance(search_results, dict):
        search_results = list(search_results.values())

    if isinstance(search_results, list):
        for result in search_results[:3]:
            score = 0

            title_similarity = calculate_title_similarity(result.get('name', '').lower(), tmdb_title_translated)

            if title_similarity < min_similarity_threshold:
                logging.debug(f"Titolo tradotto scartato per somiglianza bassa: {result.get('name', '')} (Somiglianza: {title_similarity})")
                title_similarity = calculate_title_similarity(result.get('name', '').lower(), tmdb_title_original)

            if title_similarity < min_similarity_threshold:
                continue

            score += title_similarity * 5

            if 'last_air_date' in result and result['last_air_date']:
                result_year = result['last_air_date'].split('-')[0]
                if result_year == tmdb_data.get('year', ''):
                    score += 3

            if result.get('type') == tmdb_data.get('type'):
                score += 2

            if score > max_score:
                max_score = score
                best_match = result

    return best_match

# Endpoint per ottenere le informazioni dell'episodio tramite IMDb ID, stagione e episodio
@app.route('/get_episode_info', methods=['GET'])
def get_episode_info():
    imdb_season_episode = request.args.get('imdb_season_episode')
    if not imdb_season_episode:
        return jsonify({"error": "IMDb ID, stagione o episodio non forniti"}), 400

    imdb_id, season, episode = parse_imdb_season_episode(imdb_season_episode)
    if not imdb_id or season is None or episode is None:
        return jsonify({"error": "Formato IMDb ID, stagione o episodio non valido"}), 400

    title_info = get_title_from_imdb(imdb_id)
    if not title_info or title_info['type'] != 'tv':
        return jsonify({"error": "Titolo non trovato o non è una serie TV"}), 404

    try:
        results = sc.search(title_info['title'])
        best_match = find_best_match(results, title_info)

        if not best_match:
            return jsonify({"error": "Nessuna corrispondenza trovata"}), 404

        sc_data = sc.load(best_match['url'])
        if not sc_data or 'episodeList' not in sc_data:
            return jsonify({"error": "Dettagli dell'episodio non trovati"}), 404

        episode_info = next((ep for ep in sc_data['episodeList'] if ep['season'] == season and ep['episode'] == episode), None)
        if not episode_info:
            return jsonify({"error": f"Episodio {episode} della stagione {season} non trovato"}), 404

        # Ottenere il link m3u8
        iframe, m3u8_playlist = sc.get_links(episode_info['url'])
        if not m3u8_playlist:
            return jsonify({"error": "Playlist M3U8 non trovata"}), 404

        # Restituire le informazioni sull'episodio insieme al link m3u8
        episode_info['m3u8_playlist'] = m3u8_playlist
        episode_info_path = os.path.join(RESULTS_DIR, f'episode_{imdb_id}_s{season}_e{episode}.json')
        with open(episode_info_path, 'w') as f:
            json.dump(episode_info, f, indent=2)
        logging.info(f"File episode_{imdb_id}_s{season}_e{episode}.json creato correttamente: {episode_info_path}")

        return jsonify(episode_info), 200

    except Exception as e:
        logging.error(f"Errore durante la ricerca dell'episodio '{imdb_season_episode}': {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))  # Porta impostata per Heroku
    app.run(host='0.0.0.0', port=port)
