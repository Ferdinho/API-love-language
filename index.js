const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');  // We need fs to load JSON files
const path = require('path'); // Import the path module
const winston = require('winston'); // Winston for structured logging
const dotenv = require('dotenv'); // Environment variables
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const client = require('prom-client');
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 8080

// Enable default metrics collection (e.g., HTTP request duration, response size)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// Graceful shutdown logic
let activeConnections = 0;
// This variable must be defined at the top level so it is accessible in the shutdown function
let server;

const answersDir = path.join(__dirname, 'answers');
fs.readdir(answersDir, (err, files) => {
    if (err) {
        logger.error(`Unable to read answers directory: ${err.message}`);
    } else {
        logger.info(`Files in answers directory: ${files}`);
    }
});

function gracefulShutdown(signal) {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    
    // Close the server, but wait for ongoing requests to finish
    server.close(() => {
        logger.info('Closed out remaining connections.');
        process.exit(0);
    });

    // Log the number of active connections during shutdown
    logger.info(`Active connections during shutdown: ${activeConnections}`);

    // If connections are still open after 30 seconds, force shutdown
    setTimeout(() => {
        logger.error('Forcing shutdown due to hanging connections.');
        process.exit(1);
    }, 60000); // Increased the timeout to 60 seconds for testing
}

// Listen for termination signals (SIGTERM, SIGINT)
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Create a custom counter metric
const counter = new client.Counter({
    name: 'API_custom_metric_total',
    help: 'Custom metric to count the total number of requests',
});

// Middleware to check for API key
app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key']; // Look for 'x-api-key' in request headers
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
    }
    next();
});

// Increment the counter for each request
app.use((req, res, next) => {
    counter.inc();
    next();
});

// Create an endpoint for Prometheus to scrape metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// Define the rate limiting rules
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 300, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});

// Set up Winston logger for structured logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(), // Output logs to the console
        new winston.transports.File({ filename: 'app.log' }) // Save logs to a file
    ],
});

// Add a love language translation map
const loveLanguageTranslations = {
    en: {
        "Quality Time": "Quality Time",
        "Physical Touch": "Physical Touch",
        "Words of Affirmation": "Words of Affirmation",
        "Acts of Service": "Acts of Service",
        "Receiving Gifts": "Receiving Gifts"
    },
    es: {
        "Quality Time": "Tiempo de Calidad",
        "Physical Touch": "Toque Físico",
        "Words of Affirmation": "Palabras de Afirmación",
        "Acts of Service": "Actos de Servicio",
        "Receiving Gifts": "Recibir Regalos"
    },
    pt: {
        "Quality Time": "Tempo de Qualidade",
        "Physical Touch": "Toque Físico",
        "Words of Affirmation": "Palavras de Afirmação",
        "Acts of Service": "Atos de Serviço",
        "Receiving Gifts": "Receber Presentes"
    },
    fr: {
        "Quality Time": "Temps de Qualité",
        "Physical Touch": "Toucher Physique",
        "Words of Affirmation": "Paroles d'Affirmation",
        "Acts of Service": "Actes de Service",
        "Receiving Gifts": "Recevoir des Cadeaux"
    },
    ar: {
        "Quality Time": "وقت ممتع",
        "Physical Touch": "اللمس الجسدي",
        "Words of Affirmation": "كلمات التأكيد",
        "Acts of Service": "أفعال الخدمة",
        "Receiving Gifts": "تلقي الهدايا"
    }
};

// Add a conflict management translation map
const styleTranslations = {
    en: {
        "Avoidance": "Avoidance",
        "Accommodation": "Accommodation",
        "Compromise": "Compromise",
        "Collaboration": "Collaboration",
        "Competition": "Competition"
    },
    es: {
        "Avoidance": "Evitación",
        "Accommodation": "Acomodación",
        "Compromise": "Compromiso",
        "Collaboration": "Colaboración",
        "Competition": "Competencia"
    },
    pt: {
        "Avoidance": "Evasão",
        "Accommodation": "Acomodação",
        "Compromise": "Compromisso",
        "Collaboration": "Colaboração",
        "Competition": "Competição"
    },
    fr: {
        "Avoidance": "Évitement",
        "Accommodation": "Accommodement",
        "Compromise": "Compromis",
        "Collaboration": "Collaboration",
        "Competition": "Compétition"
    },
    ar: {
        "Avoidance": "التجنب",
        "Accommodation": "التكيف",
        "Compromise": "التسوية",
        "Collaboration": "التعاون",
        "Competition": "المنافسة"
    }
};

dotenv.config(); // Initialize environment variables
app.use(bodyParser.json());
// Apply rate limiting globally
app.use(limiter);
// Use Helmet to enhance security
app.use(helmet());
// A middleware to log incoming requests
app.use((req, res, next) => {
    logger.info({
        message: 'Incoming request',
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
    });
    next();
});

function loadDetails(fullPath) {
    logger.info(`Loading file from: ${fullPath}`);  // The full path is already passed

    if (!fs.existsSync(fullPath)) {
        const errorMessage = `File not found at path: ${fullPath}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }

    try {
        const data = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        const errorMessage = `Failed to load or parse the file at ${fullPath}: ${error.message}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
}

// Helper function to load questions from a file
function loadQuestions(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

app.get('/debug/questions', (req, res) => {
    const questionsDir = path.join(__dirname, 'questions');
    fs.readdir(questionsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read questions directory.' });
        }
        res.json({ files });
    });
});

// Route to get love language questions
app.get('/v1/:languageCode/love-language', (req, res) => {
    const { languageCode } = req.params;
    const filePath = `./questions/loveLanguage_${languageCode}.json`;

    try {
        const questions = loadQuestions(filePath);
        res.json(questions);
    } catch (error) {
        logger.error(`Error loading file for language: ${languageCode}`, error);
        res.status(404).json({ error: `Questions not found for language: ${languageCode}` });
    }
});


// Route to get conflict management questions
app.get('/v1/:languageCode/conflict-management', (req, res) => {
    const { languageCode } = req.params;
    const filePath = `./questions/conflictManagement_${languageCode}.json`;

    try {
        const questions = loadQuestions(filePath);
        res.json(questions);
    } catch (error) {
        logger.error(`Error loading file for language: ${languageCode}`, error);
        res.status(404).json({ error: `Questions not found for language: ${languageCode}` });
    }
});

// Love Language Route for submitting answers
app.post('/v1/:languageCode/submit-love-language-answers', (req, res) => {
    const { answers } = req.body;  // Expecting answers in the request body
    const { languageCode } = req.params;  // Extract the language code from the URL

    try {
        // Define valid answers
        const questionIds = new Set();  // To track the unique questions IDs (avoid duplicates)
        const validAnswers = ['A', 'B', 'C', 'D', 'E'];  // Valid answer range
        const missingQuestions = [];  // To track missing question IDs

        // Initialize the missing questions list from 1 to 25
        for (let i = 1; i <= 25; i++) {
            missingQuestions.push(i);
        }

        // Validate that we have exactly 25 unique questionIds and valid answers (A-E)
        for (let i = 0; i < answers.length; i++) {
            const { questionId, answer } = answers[i];

            // Ensure questionId is a valid number
            if (typeof questionId !== 'number' || isNaN(questionId)) {
                logger.error(`Invalid questionId: ${questionId}. QuestionId must be a valid number.`);
                return res.status(400).json({ error: `Invalid questionId: ${questionId}. QuestionId must be a valid number.` });
            }

            // Check if questionId is between 1 and 25
            if (questionId < 1 || questionId > 25) {
                logger.error(`Invalid questionId: ${questionId}. Must be between 1 and 25.`);
                return res.status(400).json({ error: `Invalid questionId: ${questionId}. Must be between 1 and 25.` });
            }

            // Check for duplicate questionId
            if (questionIds.has(questionId)) {
                logger.error(`Duplicate questionId: ${questionId}. Each questionId must be unique.`);
                return res.status(400).json({ error: `Duplicate questionId: ${questionId}. Each questionId must be unique.` });
            }
            questionIds.add(questionId);  // Add the questionId to the set

            // Remove the questionId from missingQuestions list if found
            const index = missingQuestions.indexOf(questionId);
            if (index !== -1) {
                missingQuestions.splice(index, 1);  // Remove the found question from missingQuestions
            }

            // Validate that the answer is a valid letter (A-E)
            if (typeof answer !== 'string' || answer.length !== 1 || !/^[a-eA-E]$/.test(answer)) {
                logger.error(`Invalid answer: ${answer}. Answer must be a single letter between A and E.`);
                return res.status(400).json({ error: `Invalid answer: ${answer}. Answer must be a single letter between A and E.` });
            }

            // Normalize the answer to uppercase for processing
            const normalizedAnswer = answer.trim().toUpperCase();
            if (!validAnswers.includes(normalizedAnswer)) {
                logger.error(`Invalid answer: ${answer}. Answer must be one of A, B, C, D, E.`);
                return res.status(400).json({ error: `Invalid answer: ${answer}. Answer must be one of A, B, C, D, E.` });
            }
        }

        // Check if there are any missing questions
        if (missingQuestions.length > 0) {
            logger.error(`Missing questions: ${missingQuestions.join(', ')}. All questions from 1 to 25 are required.`);
            return res.status(400).json({ error: `Missing questions: ${missingQuestions.join(', ')}. All questions from 1 to 25 are required.` });
        }

        // Get the appropriate mapping based on the languageCode
        const loveLanguageMapping = require('./loveLanguageMapping')(languageCode);
        logger.info(`Loaded mapping for language: ${languageCode}`);

        // Dynamically set the path based on language code
        const detailsFilePath = path.join(__dirname, 'answers', `conflictManagement_${languageCode}.json`);
        logger.info(`Loading file from: ${detailsFilePath}`);

        // Load the corresponding language file
        let loveLanguageDetails;
        try {
            loveLanguageDetails = loadDetails(detailsFilePath);
            logger.info(`Loaded love language details for language: ${languageCode}`);
        } catch (error) {
            logger.error(`Error loading or parsing file for language ${languageCode}:`, error);
            return res.status(400).json({ error: `Language ${languageCode} is not supported.` });
        }

        // Score tracking for Love Languages
        const score = {
            "Quality Time": 0,
            "Physical Touch": 0,
            "Words of Affirmation": 0,
            "Acts of Service": 0,
            "Receiving Gifts": 0
        };

        // Process the answers and calculate scores
        answers.forEach(({ questionId, answer }) => {
            const normalizedAnswer = answer.trim().toUpperCase();
            const loveLanguage = loveLanguageMapping[questionId][normalizedAnswer];  // Look up the correct style from mapping

            if (loveLanguage) {
                // Map the translated style back to English for scoring
                const englishStyle = Object.keys(loveLanguageTranslations['en']).find(
                    key => loveLanguageTranslations[languageCode][key].toLowerCase() === loveLanguage.toLowerCase()
                );
                if (englishStyle) {
                    score[englishStyle]++;
                } else {
                    logger.warn(`No mapping found for style ${loveLanguage} in language ${languageCode}`);
                }
            } else {
                logger.warn(`No mapping found for question ${questionId} and answer ${normalizedAnswer}`);
            }
        });

        // Sort the scores from highest to lowest
        const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);

        // Create a lookup map between style names and their numerical keys in the JSON file
        const styleLookup = {};
        Object.keys(loveLanguageDetails).forEach(key => {
            const normalizedStyleName = loveLanguageDetails[key].style
                .replace(/[’']/g, "")  // Remove any apostrophes or special characters
                .toLowerCase();
            styleLookup[normalizedStyleName] = key;
        });
        logger.info(`Style lookup map for language: ${languageCode}`, styleLookup);

        // Translate the styles from English to the appropriate language
        const translatedStyles = loveLanguageTranslations[languageCode] || loveLanguageTranslations['en'];

        // Create the ranked response including all the details
        const rankedDetails = ranked.map(([style, score], index) => {
            const translatedStyle = translatedStyles[style].replace(/[’']/g, "").toLowerCase();
            const styleKey = styleLookup[translatedStyle];
            const styleDetails = loveLanguageDetails[styleKey];

            // Handle missing details in the file
            if (!styleDetails) {
                return {
                    rank: index + 1,
                    style: translatedStyles[style],
                    score,
                    error: `Details for style ${translatedStyles[style]} not found in the language file.`
                };
            }

            return {
                rank: index + 1,
                style: translatedStyles[style],
                score,
                description: styleDetails.description,
                dos: styleDetails.dos,
                donts: styleDetails.donts,
                howToCommunicate: styleDetails.howToCommunicate,
                commonMisunderstandings: styleDetails.commonMisunderstandings,
                tips: styleDetails.tips,
                examples: styleDetails.examples
            };
        });

        // Return the final ranked details
        res.json({
            rankedLoveLanguages: rankedDetails
        });

    } catch (error) {
        logger.error('Error processing love language answers:', error);
        res.status(500).json({ error: 'An error occurred while processing your answers. Please try again.' });
    }
});

// Conflict Management Route for submitting answers
app.post('/v1/:languageCode/submit-conflict-answers', (req, res) => {
    const { answers } = req.body;  // Expecting answers in the request body
    const { languageCode } = req.params;  // Extract the language code from the URL

    try {
        // Define valid answers
        const questionIds = new Set();  // To track the unique questions IDs (avoid duplicates)
        const validAnswers = ['A', 'B', 'C', 'D', 'E'];  // Valid answer range
        const missingQuestions = [];  // To track missing question IDs

        // Initialize the missing questions list from 1 to 25
        for (let i = 1; i <= 25; i++) {
            missingQuestions.push(i);
        }

        // Validate that we have exactly 25 unique questionIds and valid answers (A-E)
        for (let i = 0; i < answers.length; i++) {
            const { questionId, answer } = answers[i];

            // Ensure questionId is a valid number
            if (typeof questionId !== 'number' || isNaN(questionId)) {
                logger.error(`Invalid questionId: ${questionId}. QuestionId must be a valid number.`);
                return res.status(400).json({ error: `Invalid questionId: ${questionId}. QuestionId must be a valid number.` });
            }

            // Check if questionId is between 1 and 25
            if (questionId < 1 || questionId > 25) {
                logger.error(`Invalid questionId: ${questionId}. Must be between 1 and 25.`);
                return res.status(400).json({ error: `Invalid questionId: ${questionId}. Must be between 1 and 25.` });
            }

            // Check for duplicate questionId
            if (questionIds.has(questionId)) {
                logger.error(`Duplicate questionId: ${questionId}. Each questionId must be unique.`);
                return res.status(400).json({ error: `Duplicate questionId: ${questionId}. Each questionId must be unique.` });
            }
            questionIds.add(questionId);  // Add the questionId to the set

            // Remove the questionId from missingQuestions list if found
            const index = missingQuestions.indexOf(questionId);
            if (index !== -1) {
                missingQuestions.splice(index, 1);  // Remove the found question from missingQuestions
            }

            // Validate that the answer is a valid letter (A-E)
            if (typeof answer !== 'string' || answer.length !== 1 || !/^[a-eA-E]$/.test(answer)) {
                logger.error(`Invalid answer: ${answer}. Answer must be a single letter between A and E.`);
                return res.status(400).json({ error: `Invalid answer: ${answer}. Answer must be a single letter between A and E.` });
            }

            // Normalize the answer to uppercase for processing
            const normalizedAnswer = answer.trim().toUpperCase();
            if (!validAnswers.includes(normalizedAnswer)) {
                logger.error(`Invalid answer: ${answer}. Answer must be one of A, B, C, D, E.`);
                return res.status(400).json({ error: `Invalid answer: ${answer}. Answer must be one of A, B, C, D, E.` });
            }
        }

        // Check if there are any missing questions
        if (missingQuestions.length > 0) {
            logger.error(`Missing questions: ${missingQuestions.join(', ')}. All questions from 1 to 25 are required.`);
            return res.status(400).json({ error: `Missing questions: ${missingQuestions.join(', ')}. All questions from 1 to 25 are required.` });
        }

        // Get the appropriate mapping based on the languageCode
        const conflictManagementMapping = require('./conflictManagementMapping')(languageCode);
        logger.info(`Loaded mapping for language: ${languageCode}`);

        // Dynamically set the path based on language code
        const detailsFilePath = `./answers/conflictManagement_${languageCode}.json`;
        //const detailsFilePath = path.join(__dirname, 'answers', `conflictManagement_${languageCode}.json`);
        logger.info(`Loading file from: ${detailsFilePath}`);

        // Load the corresponding language file
        let conflictManagementDetails;
        try {
            conflictManagementDetails = loadDetails(detailsFilePath);
            logger.info(`Loaded conflict management details for language: ${languageCode}`);
        } catch (error) {
            logger.error(`Error loading or parsing file for language ${languageCode}:`, error);
            return res.status(400).json({ error: `Language ${languageCode} is not supported.` });
        }

        // Score tracking for Conflict Management Styles
        const score = {
            "Avoidance": 0,
            "Accommodation": 0,
            "Compromise": 0,
            "Collaboration": 0,
            "Competition": 0
        };

        // Process the answers and calculate scores, normalize input to upper case for consistency
        answers.forEach(({ questionId, answer }) => {
            const normalizedAnswer = answer.trim().toUpperCase();  // Normalize the answer to uppercase
            const conflictStyle = conflictManagementMapping[questionId][normalizedAnswer];  // Look up the correct style from mapping

            if (conflictStyle) {
                // Map the translated style back to English for scoring
                const englishStyle = Object.keys(styleTranslations['en']).find(
                    key => styleTranslations[languageCode][key] === conflictStyle
                );
                if (englishStyle) {
                    score[englishStyle]++;
                } else {
                    logger.warn(`No mapping found for style ${conflictStyle} in language ${languageCode}`);
                }
            } else {
                logger.warn(`No mapping found for question ${questionId} and answer ${normalizedAnswer}`);
            }
        });

        // Sort the scores from highest to lowest
        const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);

        // Create a lookup map between style names and their numerical keys in the JSON file
        const styleLookup = {};
        Object.keys(conflictManagementDetails).forEach(key => {
            const styleName = conflictManagementDetails[key].style; // Keep the original style case here
            styleLookup[styleName] = key;
        });
        logger.info(`Style lookup map for language: ${languageCode}`, styleLookup);

        // Translate the styles from English to the appropriate language
        const translatedStyles = styleTranslations[languageCode] || styleTranslations['en'];

        // Create the ranked response including all the details
        const rankedDetails = ranked.map(([style, score], index) => {
            const translatedStyle = translatedStyles[style]; // Direct style translation
            const styleKey = styleLookup[translatedStyle];  // Use the translated style to get the key
            const styleDetails = conflictManagementDetails[styleKey];

            // Handle missing details in the file
            if (!styleDetails) {
                return {
                    rank: index + 1,
                    style: translatedStyle || style, // Fallback to the original style if translation fails
                    score,
                    error: `Details for style ${translatedStyle || style} not found in the language file.`
                };
            }

            return {
                rank: index + 1,
                style: translatedStyle || style, // Fallback to the original style if translation fails
                score,
                description: styleDetails.description,
                dos: styleDetails.dos,
                donts: styleDetails.donts,
                howToCommunicate: styleDetails.howToCommunicate,
                commonMisunderstandings: styleDetails.commonMisunderstandings,
                tips: styleDetails.tips,
                examples: styleDetails.examples
            };
        });

        // Return the final ranked details
        res.json({
            rankedConflictManagementStyles: rankedDetails
        });

    } catch (error) {
        logger.error('Error processing conflict management answers:', error);
        res.status(500).json({ error: 'An error occurred while processing your answers. Please try again.' });
    }
});

// Error handler for unhandled routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Server startup
server = app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
});

// Track active connections to the server
server.on('connection', (conn) => {
    activeConnections++;
    logger.info(`New connection established. Active connections: ${activeConnections}`);

    conn.on('close', () => {
        activeConnections--;
        logger.info(`Connection closed. Active connections: ${activeConnections}`);
    });
});