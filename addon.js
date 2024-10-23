const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configurazione del logger
const log = require('debug')('streamingcommunity-addon');
log.enabled = true;

const builder = new addonBuilder({
    id: 'org.stremio.streamingcommunity',
    version: '1.0.0',
    name: 'StreamingCommunity Addon',
    description: 'Addon for StreamingCommunity to stream content',
    resources: ['stream', 'meta'],
    types: ['movie', 'series'],
    catalogs: [] // Nessun catalogo da definire
});

// URL base dell'API Python (aggiusta il dominio quando deployato su Heroku)
const PYTHON_API_BASE_URL = process.env.PYTHON_API_BASE_URL || 'http://localhost:8000';

// Funzione per pulire il link m3u8
function cleanM3u8Link(url) {
    const cleanedUrl = url.replace('b=1?', '').replace('?', '');
    log(`Link m3u8 pulito: ${cleanedUrl}`);
    return cleanedUrl;
}

// Funzione per ottenere il link m3u8 da un file JSON
function getM3u8LinkFromJson(jsonFilePath) {
    try {
        const fileData = fs.readFileSync(jsonFilePath, 'utf8');
        const episodeInfo = JSON.parse(fileData);

        if (episodeInfo && episodeInfo.m3u8_playlist) {
            log(`Link m3u8 trovato nel file JSON: ${episodeInfo.m3u8_playlist}`);
            return cleanM3u8Link(episodeInfo.m3u8_playlist);
        } else {
            log('Nessun link m3u8 trovato nel file JSON.');
            return null;
        }
    } catch (error) {
        log(`Errore durante la lettura del file JSON: ${error.message}`);
        return null;
    }
}

// MetaHandler per fornire dettagli del titolo
builder.defineMetaHandler(async (args) => {
    log(`Richiesta MetaHandler per titolo: ${args.id}`);
    const imdbId = args.id;

    try {
        const response = await axios.get(`${PYTHON_API_BASE_URL}/get_title_info`, {
            params: { imdb_id: imdbId },
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        if (response.data) {
            const titleInfo = response.data;
            return {
                meta: {
                    id: imdbId,
                    name: titleInfo.title,
                    type: titleInfo.type,
                    poster: titleInfo.poster,
                    background: titleInfo.background,
                    description: titleInfo.description,
                    releaseInfo: titleInfo.year,
                }
            };
        } else {
            return { meta: null };
        }
    } catch (error) {
        log(`Errore durante l'ottenimento delle informazioni del titolo: ${error.message}`);
        return { meta: null };
    }
});

// StreamHandler per fornire il link di streaming
builder.defineStreamHandler(async (args) => {
    log(`Richiesta StreamHandler per titolo: ${args.id}`);

    const imdbId = args.id.split(':')[0];
    const season = args.id.split(':')[1];
    const episode = args.id.split(':')[2];

    if (!season || !episode) {
        log(`StreamHandler non ha trovato stagione o episodio per il titolo: ${imdbId}`);
        return { streams: [] };
    }

    try {
        await axios.get(`${PYTHON_API_BASE_URL}/get_episode_info`, {
            params: { imdb_season_episode: `${imdbId}:${season}:${episode}` },
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        const jsonFilePath = path.join('/app/results/serietv', `episode_${imdbId}_s${season}_e${episode}.json`);

        if (fs.existsSync(jsonFilePath)) {
            const m3u8Link = getM3u8LinkFromJson(jsonFilePath);

            if (m3u8Link) {
                return {
                    streams: [
                        {
                            name: 'StreamingCommunity',
                            description: 'Streaming tramite StreamingCommunity',
                            url: m3u8Link,
                            behaviorHints: { notWebReady: true }
                        }
                    ]
                };
            }
        } else {
            log(`File JSON non trovato: ${jsonFilePath}`);
        }
    } catch (error) {
        log(`Errore durante la richiesta all'API Python o lettura del file JSON: ${error.message}`);
    }

    return { streams: [] };
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000, address: '0.0.0.0' });

log('Addon is listening on port ' + (process.env.PORT || 7000));
