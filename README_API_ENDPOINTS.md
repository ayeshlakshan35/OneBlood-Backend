# Donor Request Rejection API Endpoints

## New Endpoints Added

### 1. Reject Donor Request (Hospital Only)
- **URL**: `PUT /api/donors/reject-request/:requestId`
- **Method**: PUT
- **Access**: Private (Hospital authentication required)
- **Description**: Allows hospitals to reject a specific donor request
- **Parameters**:
  - `requestId` (path): The ID of the donor request to reject
  - `message` (body, optional): Custom rejection message
- **Response**:
  ```json
  {
    "message": "Donor request rejected successfully",
    "donorRequest": {
      // Updated donor request object
    }
  }
  ```

### 2. Get Rejected Requests (Hospital Only)
- **URL**: `GET /api/donors/rejected-requests`
- **Method**: GET
- **Access**: Private (Hospital authentication required)
- **Description**: Returns all rejected donor requests for the authenticated hospital
- **Response**:
  ```json
  [
    {
      "_id": "requestId",
      "donor": {
        "bloodType": "A+",
        "hospital": "hospitalId",
        "contactInfo": {
          "name": "Donor Name",
          "phone": "1234567890",
          "email": "donor@example.com"
        }
      },
      "status": "rejected",
      "hospitalResponse": {
        "accepted": false,
        "message": "Rejection message",
        "respondedAt": "2024-01-01T00:00:00.000Z"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

### 3. Get Rejected Requests by Phone (Donor)
- **URL**: `GET /api/donors/rejected-requests/:phone`
- **Method**: GET
- **Access**: Public
- **Description**: Returns all rejected requests for a specific donor phone number
- **Parameters**:
  - `phone` (path): Donor's phone number
- **Response**: Same as above but filtered by phone number

### 4. Enhanced Get My Requests (Donor)
- **URL**: `GET /api/donors/my-requests/:phone?status=rejected`
- **Method**: GET
- **Access**: Public
- **Description**: Get donor requests with optional status filter
- **Parameters**:
  - `phone` (path): Donor's phone number
  - `status` (query, optional): Filter by status ('pending', 'accepted', 'rejected', 'completed')
- **Example**: `GET /api/donors/my-requests/1234567890?status=rejected`

## Usage Examples

### Frontend Integration

#### For Hospital Dashboard:
```javascript
// Reject a request
const rejectRequest = async (requestId, message) => {
  const response = await fetch(`/api/donors/reject-request/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });
  return response.json();
};

// Get rejected requests
const getRejectedRequests = async () => {
  const response = await fetch('/api/donors/rejected-requests', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

#### For Donor Dashboard:
```javascript
// Get rejected requests for donor
const getMyRejectedRequests = async (phone) => {
  const response = await fetch(`/api/donors/rejected-requests/${phone}`);
  return response.json();
};

// Get all requests with status filter
const getMyRequests = async (phone, status = null) => {
  const url = status 
    ? `/api/donors/my-requests/${phone}?status=${status}`
    : `/api/donors/my-requests/${phone}`;
  const response = await fetch(url);
  return response.json();
};
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (not authorized for this request)
- `404`: Not Found (request not found)
- `500`: Internal Server Error

## Database Schema Updates

The `DonorRequest` model already supports rejection with:
- `status` field with 'rejected' enum value
- `hospitalResponse` object containing rejection details
- `respondedAt` timestamp for when the response was given
