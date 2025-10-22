# String Analyzer Service

A RESTful API service built with NestJS and PostgreSQL that analyzes strings and stores their computed properties.

## 🚀 Features

- **String Analysis**: Computes length, palindrome check, unique characters, word count, SHA-256 hash, and character frequency
- **RESTful API**: Full CRUD operations with proper HTTP status codes
- **Advanced Filtering**: Query strings by multiple criteria
- **Natural Language Queries**: Filter using human-readable queries like "all single word palindromic strings"
- **PostgreSQL Storage**: Efficient storage using JSONB for flexible property queries
- **Validation**: Comprehensive request validation using class-validator
- **Type Safety**: Full TypeScript implementation

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose (for PostgreSQL)

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd string-analyzer-service
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start PostgreSQL**

```bash
docker-compose up -d
```

5. **Run the application**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📖 Interactive API Documentation (Swagger)

Once the application is running, access the interactive Swagger documentation at:

**`http://localhost:3000/api/docs`**

The Swagger UI provides:

- 🎯 Interactive API testing interface
- 📝 Complete request/response examples
- 🔍 Schema definitions for all DTOs and entities
- 💡 Try-it-out functionality for all endpoints
- 📥 Export OpenAPI spec (JSON/YAML)

For detailed Swagger documentation guide, see [SWAGGER.md](./SWAGGER.md)

## 📚 API Documentation

### 1. Create/Analyze String

**Endpoint:** `POST /strings`

**Request:**

```json
{
  "value": "string to analyze"
}
```

**Response:** `201 Created`

```json
{
  "id": "sha256_hash_value",
  "value": "string to analyze",
  "properties": {
    "length": 17,
    "is_palindrome": false,
    "unique_characters": 12,
    "word_count": 3,
    "sha256_hash": "abc123...",
    "character_frequency_map": {
      "s": 2,
      "t": 3,
      "r": 2
    }
  },
  "created_at": "2025-10-21T10:00:00Z"
}
```

**Error Responses:**

- `400 Bad Request`: Invalid request body or missing "value" field
- `409 Conflict`: String already exists in the system
- `422 Unprocessable Entity`: Invalid data type for "value"

### 2. Get Specific String

**Endpoint:** `GET /strings/{string_value}`

**Response:** `200 OK`

```json
{
  "id": "sha256_hash_value",
  "value": "requested string",
  "properties": { ... },
  "created_at": "2025-10-21T10:00:00Z"
}
```

**Error Response:**

- `404 Not Found`: String does not exist in the system

### 3. Get All Strings with Filtering

**Endpoint:** `GET /strings?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a`

**Query Parameters:**

- `is_palindrome`: boolean (true/false)
- `min_length`: integer (minimum string length)
- `max_length`: integer (maximum string length)
- `word_count`: integer (exact word count)
- `contains_character`: string (single character)

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "hash1",
      "value": "string1",
      "properties": { ... },
      "created_at": "2025-10-21T10:00:00Z"
    }
  ],
  "count": 15,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5,
    "max_length": 20,
    "word_count": 2,
    "contains_character": "a"
  }
}
```

### 4. Natural Language Filtering

**Endpoint:** `GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings`

**Example Queries:**

- "all single word palindromic strings" → `word_count=1, is_palindrome=true`
- "strings longer than 10 characters" → `min_length=11`
- "palindromic strings that contain the letter z" → `is_palindrome=true, contains_character=z`
- "strings containing the letter a" → `contains_character=a`

**Response:** `200 OK`

```json
{
  "data": [ ... ],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

**Error Responses:**

- `400 Bad Request`: Unable to parse natural language query
- `422 Unprocessable Entity`: Query parsed but resulted in conflicting filters

### 5. Delete String

**Endpoint:** `DELETE /strings/{string_value}`

**Response:** `204 No Content` (empty response body)

**Error Response:**

- `404 Not Found`: String does not exist in the system

## 🧪 Example Requests

### Using cURL

```bash
# Create a string
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "hello world"}'

# Get a specific string
curl http://localhost:3000/strings/hello%20world

# Filter strings (palindromes with min length 5)
curl "http://localhost:3000/strings?is_palindrome=true&min_length=5"

# Natural language query
curl "http://localhost:3000/strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings"

# Delete a string
curl -X DELETE http://localhost:3000/strings/hello%20world
```

### Using JavaScript/Fetch

```javascript
// Create a string
const response = await fetch('http://localhost:3000/strings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: 'racecar' }),
});
const data = await response.json();
console.log(data);
```

## 🗂️ Project Structure

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application entry point
└── strings/
    ├── strings.module.ts      # Strings feature module
    ├── strings.controller.ts  # HTTP endpoints
    ├── strings.service.ts     # Business logic
    ├── dto/
    │   ├── create-string.dto.ts
    │   ├── filter-strings.dto.ts
    │   └── natural-language-query.dto.ts
    ├── entities/
    │   └── analyzed-string.entity.ts
    └── interfaces/
        └── string-properties.interface.ts
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=string_analyzer
DB_SSL=false
```

### Database Management

Access pgAdmin at `http://localhost:5050`:

- Email: `admin@admin.com`
- Password: `admin`

Connect to the database:

- Host: `postgres` (or `localhost` if connecting from host machine)
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `string_analyzer`

## 🧹 Development Commands

```bash
# Start development server with hot reload
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Format code
npm run format

# Lint code
npm run lint
```

## 🏗️ Technology Stack

- **Framework**: NestJS 10
- **Database**: PostgreSQL 15
- **ORM**: TypeORM 0.3
- **Validation**: class-validator & class-transformer
- **Language**: TypeScript 5
- **Runtime**: Node.js 18+

## 📝 Notes

- The SHA-256 hash is used as the primary key for efficient lookups
- String values have a unique constraint to prevent duplicates
- The `properties` field uses JSONB for flexible querying
- Natural language parsing supports common patterns but can be extended
- Database synchronization is enabled in development (disable in production)

## 🚨 Error Handling

The API returns appropriate HTTP status codes:

- `200 OK`: Successful GET request
- `201 Created`: Resource successfully created
- `204 No Content`: Resource successfully deleted
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Invalid data type

## 🔐 Security Considerations

For production deployment:

- Set `NODE_ENV=production`
- Disable `synchronize` in TypeORM
- Use environment variables for sensitive data
- Enable SSL for database connections
- Implement rate limiting
- Add authentication/authorization
- Use HTTPS

## 📄 License

MIT
