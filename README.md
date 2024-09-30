# Love Language and Conflict Management API

Welcome to the **Love Language and Conflict Management API**. This API helps users take love language and conflict management tests in five different languages and receive ranked results with detailed explanations. The API supports multiple languages and provides structured error handling and rate-limiting features.

## Features

- **Love Language and Conflict Management Tests**: The API supports both love language and conflict management tests.
- **Language Support**: Currently limited to **five languages**: English, Spanish, French, Portuguese, and Arabic.
- **API Key Authentication**: The API is secured using API keys. You can request one by contacting **dev@luminaway-solutions.tech**.
- **Rate Limiting**: Each IP is limited to **300 requests per 15 minutes**.
- **HTTPS**: The API uses HTTPS for secure communication.

## Getting Started

To use the API, you need an API key. You can request an API key by contacting **dev@luminaway-solutions.tech**.

### Base URL

The base URL for the API is:
https://love-language-api.vercel.app

### Authentication
Each request requires an `x-api-key` header with your API key. 
Example:Headers: { "x-api-key": "<your_api_key>" }


## Endpoints

### 1. Get Love Language Questions

**Description**: Retrieves the love language test questions in the specified language.

- **URL**: `/v1/:languageCode/love-language`
- **Method**: `GET`
- **Headers**: `x-api-key: <your_api_key>`
- **Response**: Returns 25 love language questions in the specified language.

**Example**:
```bash
GET https://love-language-api.vercel.app/v1/en/love-language
Headers: { "x-api-key": "<your_api_key>" }
```

### 2. Get Conflict Management Questions

**Description**: Retrieves the conflict management style questions in the specified language.

- **URL**: `/v1/:languageCode/conflict-management`
- **Method**: `GET`
- **Headers**: `x-api-key: <your_api_key>`
- **Response**: Returns 25 conflict management questions in the specified language.

**Example**:
```bash
GET https://love-language-api.vercel.app/v1/en/conflict-management
Headers: { "x-api-key": "<your_api_key>" }
```
### 3. Submit Love Language Answers

**Description**: Submits the user's answers for the love language test and returns ranked results.

- **URL**: `/v1/:languageCode/submit-love-language-answers`
- **Method**: `POST`
- **Headers**: `x-api-key: <your_api_key>`
- **Body**: JSON array of answers, each containing a questionId and answer (A-E).

**Example**:
```bash
POST https://love-language-api.vercel.app/v1/en/submit-love-language-answers
Headers: { "x-api-key": "<your_api_key>" }
Body: 
{
  "answers": [
    { "questionId": 1, "answer": "A" },
    { "questionId": 2, "answer": "C" },
    { "questionId": 3, "answer": "E" },
    // and so on up to question 25
  ]
}
```
- **Response**: Returns ranked love language results, each with a score and detailed descriptions (do’s, don’ts, tips, etc.).

### 4. Submit Conflict Management Answers

**Description**: Submits the user's answers for the conflict management test and returns ranked results.
- **URL**: `/v1/:languageCode/submit-conflict-answers`
- **Method**: `POST`
- **Headers**: `x-api-key: <your_api_key>`
- **Body**: JSON array of answers, each containing a questionId and answer (A-E).

**Example**:
```bash
POST https://love-language-api.vercel.app/v1/en/submit-conflict-answers
Headers: { "x-api-key": "<your_api_key>" }
Body: 
{
  "answers": [
    { "questionId": 1, "answer": "B" },
    { "questionId": 2, "answer": "D" },
    { "questionId": 3, "answer": "A" },
    // and so on up to question 25
  ]
}

```
- **Response**: Returns ranked conflict management results, each with a score and detailed descriptions (do’s, don’ts, tips, etc.).

### Error Handling
The API provides structured error handling. Common error responses include:

- **403 Forbidden**: `Invalid API key.`
- **404 Not Found**: `Invalid endpoint or missing resource.`
- **400 Bad Request**: `Invalid request format or missing parameters.`
- **500 Internal Server Error**: An error occurred while processing the request.


### API Key Management

To request an API key or for API-related support, email **dev@luminaway-solutions.tech**.

### Rate Limiting

This API is rate-limited to  **300 requests per 15 minutes per IP**.Exceeding this limit will result in a 429 Too Many Requests response.

### Security
The API provides structured error handling. Common error responses include:

- **HTTPS**: `The API is served over HTTPS to ensure secure communication.`
- **Helmet**: `The API uses Helmet for enhanced security by setting appropriate HTTP headers`
- **Rate Limiting**: `Rate limiting is implemented to protect the API from abuse.`

### Monitoring

Prometheus is integrated for collecting and monitoring API metrics, which include request count, request duration, and error rates. You can scrape the metrics from the **/metrics** endpoint:
```bash
GET https://love-language-api.vercel.app/metrics

```

### Roadmap

- `Add support for more languages.`
- `Implement API key revocation and generation via a dedicated admin panel.`
- `Improve caching for frequently requested resources.`

