# API Encrypted

Encryption and utility API service.

## Installation

```bash
npm install
npm start
```

Server runs on port 5000 by default.

## Endpoints

### GET /randomdatav2

Generate random user data.

**Response:**
```json
{
  "success": true,
  "first": "John",
  "last": "Doe",
  "fullname": "John Doe",
  "email": "johndoe@example.com",
  "password": "xK9#mL2$pQ",
  "phone": "5551234567",
  "formatedphone": "(555) 123-4567",
  "userAgent": "Mozilla/5.0...",
  "language": "en-US",
  "timeZone": "America/New_York",
  "offset": -300,
  "address": {
    "address1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001"
  }
}
```

### GET /realaddress?country=us

Get a real address for specified country.

**Parameters:**
- `country` - Country code: `us`, `uk`, `ca`, `it`

**Example:**
```
GET /realaddress?country=us
GET /realaddress/us
```

### GET /bin/:BIN

Lookup BIN (Bank Identification Number) information.

**Example:**
```
GET /bin/424242
```

**Response:**
```json
{
  "success": true,
  "bin": "424242",
  "cardInfo": {
    "type": "VISA",
    "subType": "CREDIT",
    "category": "CLASSIC"
  },
  "issuer": {
    "bank": "BANK NAME",
    "country": "United States"
  }
}
```

### POST /adyen

Adyen encryption (legacy version).

**Body:**
```json
{
  "key": "ADYEN_PUBLIC_KEY",
  "ver": "18",
  "cc": "4242424242424242",
  "month": "03",
  "year": "2030",
  "cvv": "123"
}
```

### POST /adyenv4

Adyen v4 encryption.

**Body:**
```json
{
  "key": "10001|...",
  "referrer": "https://example.com/.../securedFields.html",
  "cc": "4242424242424242",
  "month": "03",
  "year": "2030",
  "cvv": "123"
}
```

### POST /adyenv5

Adyen v5 encryption.

**Body:**
```json
{
  "key": "ADYEN_PUBLIC_KEY",
  "cc": "4242424242424242",
  "month": "03",
  "year": "2030",
  "cvv": "123"
}
```

### POST /adyenv450

Adyen v4.5.0 encryption.

**Body:**
```json
{
  "key": "ADYEN_PUBLIC_KEY",
  "referrer": "https://example.com/.../securedFields.html",
  "cc": "4242424242424242",
  "month": "03",
  "year": "2030",
  "cvv": "123"
}
```
