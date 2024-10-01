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
https://powerful-retreat-86658-466b4fc02c02.herokuapp.com

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
GET https://powerful-retreat-86658-466b4fc02c02.herokuapp.com/v1/en/love-language
Headers: { "x-api-key": "<your_api_key>" }
```
***Response*** : 
```bash
{
  "questions": [
    {
      "questionId": 1,
      "questionText": "Which of the following would make you feel most loved?",
      "options": [
        { "option": "A", "text": "Spending quality time together" },
        { "option": "B", "text": "Receiving a thoughtful gift" },
        { "option": "C", "text": "A heartfelt compliment" },
        { "option": "D", "text": "A warm hug" },
        { "option": "E", "text": "Having something done for you" }
      ]
    },
    {
      "questionId": 2,
      "questionText": "How would you most enjoy spending time with a loved one?",
      "options": [
        { "option": "A", "text": "Talking about your day" },
        { "option": "B", "text": "Receiving a small surprise gift" },
        { "option": "C", "text": "Being told how much you are appreciated" },
        { "option": "D", "text": "Physical touch, like a pat on the back" },
        { "option": "E", "text": "Having chores done for you" }
      ]
    }
    // 23 more questions...
  ]
}

```
### 2. Get Conflict Management Questions

**Description**: Retrieves the conflict management style questions in the specified language.

- **URL**: `/v1/:languageCode/conflict-management`
- **Method**: `GET`
- **Headers**: `x-api-key: <your_api_key>`
- **Response**: Returns 25 conflict management questions in the specified language.

**Example**:
```bash
GET https://powerful-retreat-86658-466b4fc02c02.herokuapp.com/v1/en/conflict-management
Headers: { "x-api-key": "<your_api_key>" }
```
***Response*** : 
```bash
{
  "questions": [
    {
      "questionId": 1,
      "questionText": "Which of the following would make you feel most loved?",
      "options": [
        { "option": "A", "text": "Spending quality time together" },
        { "option": "B", "text": "Receiving a thoughtful gift" },
        { "option": "C", "text": "A heartfelt compliment" },
        { "option": "D", "text": "A warm hug" },
        { "option": "E", "text": "Having something done for you" }
      ]
    },
    {
      "questionId": 2,
      "questionText": "How would you most enjoy spending time with a loved one?",
      "options": [
        { "option": "A", "text": "Talking about your day" },
        { "option": "B", "text": "Receiving a small surprise gift" },
        { "option": "C", "text": "Being told how much you are appreciated" },
        { "option": "D", "text": "Physical touch, like a pat on the back" },
        { "option": "E", "text": "Having chores done for you" }
      ]
    }
    // 23 more questions...
  ]
}

```

### 3. Submit Love Language Answers

**Description**: Submits the user's answers for the love language test and returns ranked results.

- **URL**: `/v1/:languageCode/submit-love-language-answers`
- **Method**: `POST`
- **Headers**: `x-api-key: <your_api_key>`
- **Body**: JSON array of answers, each containing a questionId and answer (A-E).

**Example**:
```bash
POST https://powerful-retreat-86658-466b4fc02c02.herokuapp.com/v1/en/submit-love-language-answers
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

***Response*** : 
```bash
{
  "rankedLoveLanguages": [
    {
      "rank": 1,
      "style": "Quality Time",
      "score": 10,
      "description": "You feel most loved when spending uninterrupted time with those you care about.",
      "dos": ["Plan meaningful one-on-one time", "Be present during conversations"],
      "donts": ["Be distracted during conversations", "Break plans last minute"],
      "howToCommunicate": "Express your desire to spend time together in a calm manner.",
      "commonMisunderstandings": "People may think you are too needy when you ask for time.",
      "tips": "Make time to regularly connect without distractions."
    },
    {
      "rank": 2,
      "style": "Physical Touch",
      "score": 7,
      "description": "You feel most loved through touch, such as hugs, hand-holding, or other physical affection.",
      "dos": ["Give hugs", "Hold hands", "Offer comforting physical touch"],
      "donts": ["Avoid touch when they’re feeling down", "Be distant physically"],
      "howToCommunicate": "Let people know that physical touch is important to you.",
      "commonMisunderstandings": "People may think you are overly physical or intrusive.",
      "tips": "Ask for a hug or a comforting touch when you need it."
    }
    // 3 more styles ranked...
  ]
}

```

### 4. Submit Conflict Management Answers

**Description**: Submits the user's answers for the conflict management test and returns ranked results.
- **URL**: `/v1/:languageCode/submit-conflict-answers`
- **Method**: `POST`
- **Headers**: `x-api-key: <your_api_key>`
- **Body**: JSON array of answers, each containing a questionId and answer (A-E).

**Example**:
```bash
POST https://powerful-retreat-86658-466b4fc02c02.herokuapp.com/v1/en/submit-conflict-answers
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

***Response*** : 
```bash
{
  "rankedConflictManagementStyles": [
    {
      "rank": 1,
      "style": "Collaboration",
      "score": 9,
      "description": "You prefer working with others to find a solution that benefits both parties.",
      "dos": ["Encourage teamwork", "Listen to all viewpoints"],
      "donts": ["Dominate the conversation", "Ignore others' ideas"],
      "howToCommunicate": "Emphasize the need for a solution that works for everyone.",
      "commonMisunderstandings": "People might think you're too slow to make decisions.",
      "tips": "Clearly state the benefits of collaboration and work towards a shared goal."
    },
    {
      "rank": 2,
      "style": "Compromise",
      "score": 6,
      "description": "You are willing to give up something in exchange for resolving the conflict quickly.",
      "dos": ["Be open to giving up some things", "Find middle ground"],
      "donts": ["Hold onto everything", "Be too rigid"],
      "howToCommunicate": "Propose a compromise that allows both parties to win something.",
      "commonMisunderstandings": "People may think you give up too easily.",
      "tips": "Negotiate carefully, ensuring both sides benefit from the compromise."
    }
    // 3 more styles ranked...
  ]
}

```

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
GET https://powerful-retreat-86658-466b4fc02c02.herokuapp.com/metrics

```

### Roadmap

- `Add support for more languages.`
- `Implement API key revocation and generation via a dedicated admin panel.`
- `Improve caching for frequently requested resources.`

