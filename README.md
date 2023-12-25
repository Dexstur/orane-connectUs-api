# orane-connectUs-api

### Documentation

---

#### Operation: Admin registration

- The correct adminKey must be provided for admin registration
- **URL:** "/users/signup"
- **Method:** POST
- **Example:**
  ```json
  {
    "email": "exampleadmin@email.com",
    "fullname": "Name Example",
    "password": "enterPassword",
    "gender": "M or F",
    "adminKey": "company admin key"
  }
  ```

---

#### Operation: Verify email for admins

- Admins must verify their emails to complete registration. Verification links would be sent via mail
- **URL:** "/admin/verify?token={token-sent-to-mail}"
- **Method:** GET

---

#### Operation: Create registration link

- Admins can create links for users to register. Registration link would be sent to the email provided.
- **URL:** "/admin/registration"
- **Method:** POST
- **Example:**
  ```json
  {
    "email": "example@email.com"
  }
  ```

---

#### Operation: User Registration

- Regular users can sign up using tokens generated by admins. Token should be provided as a query, adminKey should not be provided. Tokens are single use.
- **URL:** "/users/signup?token={token-generated-by-admin}"
- **Method:** POST
- **Example:**
  ```json
  {
    "email": "example@email.com",
    "fullname": "Name Example",
    "gender": "M or F",
    "password": "enterPassword"
  }
  ```

---

#### Operation: User Login

- **URL:** "/users/login"
- **Method:** POST
- **Example:**
  ```json
  {
    "email": "example@email.com",
    "password": "enterPassword"
  }
  ```

---

#### Operation: User Logout

- **URL:** "/users/logout"
- **Method:** POST

---

#### Operation: View Regular Staff

- **URL:** "/users/regular?page={page}"
- **Method:** GET
- **Query:** page: number eg 1 (optional and defaults to 1)

---

#### Operation: View Staff on Leave

- **URL:** "/users/leave?page={page}"
- **Method:** GET
- **Query:** page: number eg 1 (optional and defaults to 1)

---

#### Operation: View Admin Staff

- Restricted to admin users
- **URL:** "/users/admin?page={page}"
- **Method:** GET
- **Query:** page: number eg 1 (optional and defaults to 1)

---

#### Operation: View All Staff

- **URL:** "/users/all?s={string}&page={page}"
- **Method:** GET
- **Query:** page: number eg 1 (optional and defaults to 1); s: string (optional, finds user with name or email matching string pattern. Defaults to '')

---

#### Operation: View All Notifications

- **URL:** "/notice?page={page}"
- **Method:** GET
- **Query:** page: number eg 1 (optional and defaults to 1)

---

#### Operation: View One Notification

- **URL:** "/notice/{id}"
- **Method:** GET
- View single notification

---

#### Operation: Create a Notification

- Restricted to admin users
- **URL:** "/notice"
- **Method:** POST
- **Example:**
  ```json
  {
    "title": "Title example",
    "content": "Content example"
  }
  ```

---

#### Operation: Notify Leave of absence

- Restricted to admin users
- **URL:** "/notice/leave"
- **Method:** PUT
- **Example:**
  ```json
  {
    "email": "example@email.com"
  }
  ```
- Grants user with given email leave status

---

#### Operation: Notify Return from leave

- Restricted to admin users
- **URL:** "/notice/leave/{id}"
- **Method:** PUT
- Notify return of user with given id from leave

---

#### Operation: Update Notification

- Restricted to admin users
- **URL:** "/notice/{id}"
- **Method:** PUT
- **Example:**
  ```json
  {
    "title": "Updated Title",
    "content": "Updated Content"
  }
  ```
- Update a notification. Note: System notifications cannot be updated.

---

#### Operation: Message a user

- **URL:** "/chat/{id}"
- **Method:** POST
- **Example:**
  ```json
  {
    "content": "Message example"
  }
  ```
- Sends a message to user with given id

---

#### Operation: Read Messages

- **URL:** "/chat/{id}?page={page}"
- **Method:** GET
- **Query:** page: number eg 1 (optional and defaults to 1)
- Read messages between user with given id

---

#### Operation: Respond to notification

- **URL:** "/response/{id}"
- **Method:** POST
- **Example:**
  ```json
  {
    "content": "Response example"
  }
  ```
- Respond to a notification with given id. Note: id refers to notification's id

---

#### Operation: View notification responses

- **URL:** "/response/{id}"
- **Method:** GET
- View all responses for a notification. Note: id refers to notification's id

---

#### Operation: Update response

- **URL:** "/response/{id}"
- **Method:** PUT
- **Example:**
  ```json
  {
    "content": "Response update"
  }
  ```
- Update a response. Note: id refers to response's id

---

#### Operation: Give feedback

- **URL:** "/feedback"
- **Method:** POST
- **Example:**
  ```json
  {
    "content": "Feedback example"
  }
  ```
- Drop anonymous feedback.

---

#### Operation: Read all feedback

- **URL:** "/feedback?page={page}"
- **Method:** GET
- **Query:** page: number eg 1 (optional and defaults to 1)

---

#### Operation: Delete feedback

- Restricted to only admin users
- **URL:** "/feedback/{id}"
- **Method:** DELETE
- Delete feedback of given ID

---
