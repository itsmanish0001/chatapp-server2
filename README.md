VRV  backend developer internship assignment video explanation.
 ```bash
  https://drive.google.com/file/d/1HDoe2AwsgrYcjYgGHQjH9cFN-eNHlw4A/view?usp=drive_link
 ```




-------------------------------------------------------## Authentication ----------------------------------------------------------------------------

This application uses **JWT (JSON Web Token)** for secure user authentication. JWT is a compact, URL-safe means of representing claims between two parties. In our case, JWT is used to authenticate users and maintain their session without requiring server-side session storage.

### Authentication Flow:

1. **User Login:**
   - Users authenticate by submitting their username and password.
   - If the credentials are correct, the server issues a JWT token.
   - The JWT token is stored as an **HTTP cookie** in the user's browser.

2. **Token Storage:**
   - The token is sent with every subsequent request to the server, allowing the user to stay authenticated across multiple requests.

3. **Token Expiration:**
   - JWT tokens come with an expiration time, after which the user will need to re-authenticate (log in again).



-------------------------------------------------------------------------------## Authorization-------------------------------------------------------------------------------------------------------------------

In addition to authentication, **authorization** determines what a user is allowed to do within the application. For example, in the chat application, there are special access controls for managing groups. While any authenticated user can create a group, only the **group admin** has certain privileges, such as renaming the group, adding new members, or removing existing members.

### Group Management Authorization Flow

1. **Group Creation**:
   - Any authenticated user can create a group.
   - Once the group is created, the user becomes the **admin** of the group by default.

2. **Group Admin Privileges**:
   The admin of a group is granted special privileges, including:
   - **Rename Group**: Only the **group admin** can change the group's name.
   - **Add Members**: Only the **group admin** can add new members to the group.
   - **Remove Members**: Only the **group admin** can remove members from the group.

3. **Other Users' Permissions**:
   - Non-admin users can participate in the group chat, but they cannot perform administrative actions like renaming the group or modifying its membership.

### Example Authorization Flow

- **Create Group**: Any authenticated user can create a group.









------------------------------------------------------------------------------------## Role-Based Authentication--------------------------------------------------------------------------------------------------

## Role-Based Authentication

In addition to user authentication, this application also implements **role-based authentication** to differentiate the privileges of regular users and the admin. The system recognizes multiple roles, with each role having different access rights. This ensures that the application behaves differently depending on the logged-in user's role.

### Admin Authentication

1. **Admin Login:**
   - The admin of the application has a special role that allows them to perform higher-level operations.
   - The admin logs in with a **secret key** (a unique key only known to the admin) instead of a regular username/password combination.
   - Upon successful authentication, the server issues a **JWT token** with the **admin** role.

2. **Admin Privileges:**
   The admin has elevated permissions and can access all aspects of the application, including:
   - **View all users**: Admin can view the list of all users on the platform.
   - **Monitor all activity**: Admin can see everything happening across the application, such as group activity, user messages, etc.
   - **Modify any user data**: Admin can manage user accounts, including deleting accounts or modifying their data.

### Regular User Login

1. **Regular User Login:**
   - Regular users authenticate using their **username** and **password**.
   - Upon successful login, they are issued a **JWT token** with the **user** role.
   - This limits their access to only their own data and activities within the application (e.g., messaging, group participation).

### Routes

1. **Regular User Route:**
   - The normal user can access the main chat application via the following route:
   
     ```bash
     https://chatapp-frontend-2.vercel.app/
     ```

   - Regular users can use this route to participate in the chat, create groups, and perform other user-level actions.

2. **Admin Route:**
   - The admin can access the admin panel via the following route:
   
     ```bash
     https://chatapp-frontend-2.vercel.app/admin
     ```
     secret key -- MANISHBHARTI

   - This route is accessible only to admins. Admins have elevated privileges to manage users, monitor activities, and perform administrative tasks across the application.

### Example Role-Based Authorization

1. **Admin Request:**
   Admins have access to special routes that regular users cannot access. For example, to see all users in the application, the admin can make a request like this:



