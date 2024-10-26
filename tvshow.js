// const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');

// // Configurazione del logger
// const log = require('debug')('streamingcommunity-addon');
// log.enabled = true;

// const builder = new addonBuilder({
//     id: 'org.stremio.streamingcommunity',
//     version: '1.0.0',
//     name: 'StreamingCommunity Addon',
//     description: 'Addon for StreamingCommunity to stream content',
//     resources: ['stream', 'meta'],
//     types: ['movie', 'series'],
//     catalogs: [] // Nessun catalogo da definire
// });

// // URL base dell'API Python
// const PYTHON_API_BASE_URL = 'http://localhost:8000';

// // Directory dove il file JSON verrà creato dall'API Python
// const RESULTS_DIR = '/home/peppe/Desktop/streamingcommunity-unofficialapi-1.0.2/results/serietv';

// // Funzione per pulire il link m3u8
// function cleanM3u8Link(url) {
//     // Rimuovi "b=1?" e sostituisci il primo ? con vuoto per eliminare il primo parametro vuoto
//     const cleanedUrl = url.replace('b=1?', '').replace('?', '');
//     log(`Link m3u8 pulito: ${cleanedUrl}`);
//     return cleanedUrl;
// }

// // Funzione per leggere il file JSON e restituire il link m3u8
// function getM3u8LinkFromJson(jsonFilePath) {
//     try {
//         const fileData = fs.readFileSync(jsonFilePath, 'utf8');
//         const episodeInfo = JSON.parse(fileData);

//         if (episodeInfo && episodeInfo.m3u8_playlist) {
//             log(`Link m3u8 trovato nel file JSON: ${episodeInfo.m3u8_playlist}`);
//             return cleanM3u8Link(episodeInfo.m3u8_playlist); // Pulisci e restituisci il link
//         } else {
//             log('Nessun link m3u8 trovato nel file JSON.');
//             return null;
//         }
//     } catch (error) {
//         log(`Errore durante la lettura del file JSON: ${error.message}`);
//         return null;
//     }
// }

// // MetaHandler per fornire dettagli del titolo
// builder.defineMetaHandler(async (args) => {
//     log(`Richiesta MetaHandler per titolo: ${args.id}`);
//     const imdbId = args.id;

//     // Richiesta al server Python per ottenere informazioni sul titolo
//     try {
//         const response = await axios.get(`${PYTHON_API_BASE_URL}/get_title_info`, {
//             params: { imdb_id: imdbId }
//         });

//         if (response.data) {
//             const titleInfo = response.data;
//             return {
//                 meta: {
//                     id: imdbId,
//                     name: titleInfo.title,
//                     type: titleInfo.type,
//                     poster: titleInfo.poster,
//                     background: titleInfo.background,
//                     description: titleInfo.description,
//                     releaseInfo: titleInfo.year,
//                 }
//             };
//         } else {
//             return { meta: null };
//         }
//     } catch (error) {
//         log(`Errore durante l'ottenimento delle informazioni del titolo: ${error.message}`);
//         return { meta: null };
//     }
// });

// // StreamHandler per fornire il link di streaming
// builder.defineStreamHandler(async (args) => {
//     log(`Richiesta StreamHandler per titolo: ${args.id}`);

//     const imdbId = args.id.split(':')[0];
//     const season = args.id.split(':')[1];
//     const episode = args.id.split(':')[2];

//     if (!season || !episode) {
//         log(`StreamHandler non ha trovato stagione o episodio per il titolo: ${imdbId}`);
//         return { streams: [] };
//     }

//     // Invia la richiesta all'API Python per generare il file JSON
//     try {
//         await axios.get(`${PYTHON_API_BASE_URL}/get_episode_info`, {
//             params: { imdb_season_episode: `${imdbId}:${season}:${episode}` }
//         });

//         // Costruisci il percorso del file JSON creato dall'API Python
//         const jsonFilePath = path.join(RESULTS_DIR, `episode_${imdbId}_s${season}_e${episode}.json`);

//         // Verifica se il file esiste e leggilo
//         if (fs.existsSync(jsonFilePath)) {
//             const m3u8Link = getM3u8LinkFromJson(jsonFilePath);

//             if (m3u8Link) {
//                 return {
//                     streams: [
//                         {
//                             name: 'StreamingCommunity',
//                             description: 'Streaming tramite StreamingCommunity',
//                             url: m3u8Link, // Restituisci il link preso dal JSON e pulito
//                             behaviorHints: {
//                                 notWebReady: true
//                             }
//                         }
//                     ]
//                 };
//             }
//         } else {
//             log(`File JSON non trovato: ${jsonFilePath}`);
//         }
//     } catch (error) {
//         log(`Errore durante la richiesta all'API Python o lettura del file JSON: ${error.message}`);
//     }

//     return { streams: [] };
// });

// // Avvia il server dell'addon
// serveHTTP(builder.getInterface(), { port: 7000, address: '0.0.0.0' });


// log('Addon is listening on port 7000');

// const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');

// // Configurazione del logger
// const log = require('debug')('streamingcommunity-addon');
// log.enabled = true;

// const builder = new addonBuilder({
//     id: 'org.stremio.streamingcommunity',
//     version: '1.0.0',
//     name: 'StreamingCommunity Addon',
//     description: 'Addon for StreamingCommunity to stream content',
//     resources: ['stream', 'meta'],
//     types: ['movie', 'series'],
//     catalogs: [], // Nessun catalogo da definire
//     idPrefixes: ["tt"]
// });

// // URL base dell'API Python
// const PYTHON_API_BASE_URL = 'https://pepigno884-scaddon.hf.space';


// // Directory dove il file JSON verrà creato dall'API Python
// const RESULTS_DIR = '/home/peppe/Desktop/streamingcommunity-unofficialapi-1.0.2/results/serietv';

// // Funzione per pulire il link m3u8
// function cleanM3u8Link(url) {
//     // Rimuovi "b=1?" e sostituisci il primo ? con vuoto per eliminare il primo parametro vuoto
//     const cleanedUrl = url.replace('b=1?', '').replace('?', '');
//     log(`Link m3u8 pulito: ${cleanedUrl}`);
//     return cleanedUrl;
// }

// // Funzione per leggere il file JSON e restituire il link m3u8
// function getM3u8LinkFromJson(jsonFilePath) {
//     try {
//         const fileData = fs.readFileSync(jsonFilePath, 'utf8');
//         const episodeInfo = JSON.parse(fileData);

//         if (episodeInfo && episodeInfo.m3u8_playlist) {
//             log(`Link m3u8 trovato nel file JSON: ${episodeInfo.m3u8_playlist}`);
//             return cleanM3u8Link(episodeInfo.m3u8_playlist); // Pulisci e restituisci il link
//         } else {
//             log('Nessun link m3u8 trovato nel file JSON.');
//             return null;
//         }
//     } catch (error) {
//         log(`Errore durante la lettura del file JSON: ${error.message}`);
//         return null;
//     }
// }

// // MetaHandler per fornire dettagli del titolo
// builder.defineMetaHandler(async (args) => {
//     log(`Richiesta MetaHandler per titolo: ${args.id}`);
//     const imdbId = args.id;

//     // Richiesta al server Python per ottenere informazioni sul titolo
//     try {
//         const response = await axios.get(`${PYTHON_API_BASE_URL}/get_title_info`, {
//             params: { imdb_id: imdbId },
//             headers: { 'ngrok-skip-browser-warning': 'true' }  // Aggiunto per bypassare l'avviso di ngrok
//         });

//         if (response.data) {
//             const titleInfo = response.data;
//             return {
//                 meta: {
//                     id: imdbId,
//                     name: titleInfo.title,
//                     type: titleInfo.type,
//                     poster: titleInfo.poster,
//                     background: titleInfo.background,
//                     description: titleInfo.description,
//                     releaseInfo: titleInfo.year,
//                 }
//             };
//         } else {
//             return { meta: null };
//         }
//     } catch (error) {
//         log(`Errore durante l'ottenimento delle informazioni del titolo: ${error.message}`);
//         return { meta: null };
//     }
// });

// // StreamHandler per fornire il link di streaming
// builder.defineStreamHandler(async (args) => {
//     log(`Richiesta StreamHandler per titolo: ${args.id}`);

//     const imdbId = args.id.split(':')[0];
//     const season = args.id.split(':')[1];
//     const episode = args.id.split(':')[2];

//     if (!season || !episode) {
//         log(`StreamHandler non ha trovato stagione o episodio per il titolo: ${imdbId}`);
//         return { streams: [] };
//     }

//     // Invia la richiesta all'API Python per generare il file JSON
//     try {
//         await axios.get(`${PYTHON_API_BASE_URL}/get_episode_info`, {
//             params: { imdb_season_episode: `${imdbId}:${season}:${episode}` },
//             headers: { 'ngrok-skip-browser-warning': 'true' }  // Aggiunto per bypassare l'avviso di ngrok
//         });

//         // Costruisci il percorso del file JSON creato dall'API Python
//         const jsonFilePath = path.join(RESULTS_DIR, `episode_${imdbId}_s${season}_e${episode}.json`);

//         // Verifica se il file esiste e leggilo
//         if (fs.existsSync(jsonFilePath)) {
//             const m3u8Link = getM3u8LinkFromJson(jsonFilePath);

//             if (m3u8Link) {
//                 return {
//                     streams: [
//                         {
//                             name: 'StreamingCommunity',
//                             description: 'Streaming tramite StreamingCommunity',
//                             url: m3u8Link, // Restituisci il link preso dal JSON e pulito
//                             behaviorHints: {
//                                 notWebReady: true
//                             }
//                         }
//                     ]
//                 };
//             }
//         } else {
//             log(`File JSON non trovato: ${jsonFilePath}`);
//         }
//     } catch (error) {
//         log(`Errore durante la richiesta all'API Python o lettura del file JSON: ${error.message}`);
//     }

//     return { streams: [] };
// });

// // Avvia il server dell'addon
// serveHTTP(builder.getInterface(), { port: 7000, address: '0.0.0.0' });


// log('Addon is listening on port 7000');

const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const axios = require('axios');
const log = require('debug')('streamingcommunity-addon');
log.enabled = true;

const builder = new addonBuilder({
    id: 'org.stremio.streamingcommunity',
    version: '1.0.0',
    name: 'StreamingCommunity Addon',
    description: 'Addon for StreamingCommunity to stream content',
    resources: ['stream', 'meta'],
    types: ['movie', 'series'],
    catalogs: [],
    idPrefixes: ["tt"]
});

const PYTHON_API_BASE_URL = 'https://pepigno884-scaddon.hf.space';

// Funzione per pulire il link m3u8
function cleanM3u8Link(url) {
    const cleanedUrl = url.replace('b=1?', '').replace('?', '');
    log(`Link m3u8 pulito: ${cleanedUrl}`);
    return cleanedUrl;
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

    const [imdbId, season, episode] = args.id.split(':');
    if (!season || !episode) {
        log(`StreamHandler non ha trovato stagione o episodio per il titolo: ${imdbId}`);
        return { streams: [] };
    }

    try {
        const response = await axios.get(`${PYTHON_API_BASE_URL}/get_episode_info`, {
            params: { imdb_season_episode: `${imdbId}:${season}:${episode}` },
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        if (response.data && response.data.m3u8_playlist) {
            const m3u8Link = cleanM3u8Link(response.data.m3u8_playlist);
            return {
                streams: [
                    {
                        name: 'StreamingCommunity',
                        description: 'Streaming tramite StreamingCommunity',
                        url: m3u8Link,
                        behaviorHints: {
                            notWebReady: true
                        }
                    }
                ]
            };
        } else {
            log('Nessun link m3u8 trovato nella risposta API.');
        }
    } catch (error) {
        log(`Errore durante la richiesta all'API Python: ${error.message}`);
    }

    return { streams: [] };
});

serveHTTP(builder.getInterface(), { port: 7000, address: '0.0.0.0' });
log('Addon is listening on port 7000');
