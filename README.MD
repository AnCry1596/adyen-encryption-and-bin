# API Encrypted

Encryption and utility API service.

> **Disclaimer:** This project is for educational and testing purposes only. Do not use for any illegal activities.

## ⚠️ Disclaimers

**Educational Purpose Only**
This project is intended solely for educational, research, and testing purposes. It is not intended to be used in production environments or for any commercial activity.

**No Affiliation with Adyen**
This project is **not affiliated with, endorsed by, or associated with Adyen N.V.** in any way. "Adyen" is a registered trademark of Adyen N.V. Any reference to Adyen or its services is purely for descriptive and educational purposes.

**No Warranty**
This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability arising from the use of this software.

**Legal Compliance**
Users are solely responsible for ensuring that their use of this software complies with all applicable local, national, and international laws and regulations. The author(s) of this project accept no responsibility or liability for any misuse, illegal use, or any damages resulting from the use of this software.

**No Cardholder Data**
This tool must **never** be used to process, store, or transmit real cardholder data. Using this software against real payment systems without explicit authorization is illegal and unethical.

## Installation

```bash
npm install
npm start
```

Server runs on port 5000 by default.

## Endpoints

### GET /randomdatav2

Generate random user data (flat format).

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

### GET /randomdatav2/new

Generate random user data (structured format with metadata).

**Response:**
```json
{
  "success": true,
  "personal": {
    "first": "John",
    "last": "Doe",
    "fullname": "John Doe",
    "email": "johndoe@example.com",
    "phone": "5551234567",
    "phoneFormatted": {
      "parentheses": "(555) 123-4567",
      "dashes": "555-123-4567",
      "dots": "555.123.4567",
      "international": "+1 555 123 4567"
    }
  },
  "security": {
    "password": "xK9#mL2$pQ"
  },
  "browser": {
    "userAgent": "Mozilla/5.0...",
    "language": "en-US",
    "colorDepth": 24,
    "screen": {
      "width": 1920,
      "height": 1080,
      "type": "desktop"
    }
  },
  "location": {
    "timeZone": "America/New_York",
    "offset": -300,
    "address": {
      "address1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001"
    }
  },
  "metadata": {
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "processingTime": "15ms"
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

## License

[WTFPL](http://www.wtfpl.net/) - Do What The Fuck You Want To Public License

For educational purposes only.
