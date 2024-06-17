<a href="https://www.python.org/downloads/release/python-3101/"><img src="https://img.shields.io/badge/python-3.10-green.svg"></a>
<a href="https://www.npmjs.com/package/npm/v/10.2.3"><img src="https://img.shields.io/badge/npm-10.2.3-blue.svg"></a>

# Key Features
- Session control (session token & refresh token)
- Real time notification
- Authorization implementation on every route and websocket
- Customizable display settings



# Setting up
## Configuring Poetry
1. Install [poetry](https://python-poetry.org/docs/master/#installing-with-the-official-installer)

2. Change the directory to backend using `cd backend`

3. Run `poetry install` to install dependencies.

4. [optional] Change the `venv` and `venvPath` in `pyrightconfig.json` to be the venv name and absolute path (info displayed before install starts)

5. Modify `config.json` in the backend directory, an example configuration:
```json
{
    "ORIGINS": ["http://192.168.1.13:3000", "http://localhost:3000"],
    "DB_NAME": "core",
    "HOST": "192.168.1.13",
    "PORT": 8000,
    "JWT_PRIVATE_KEY": "YOUR_PRIVATE_KEY_HERE",
    "JWT_PUBLIC_KEY" : "YOUR_PUBLIC_KEY_HERE",
    "JWT_ALGORITHM": "RS256"
}
```

6. Start the API by using `poetry run backend` (It will run on port 8000)


## Configuring React
1. Install [node.js](https://nodejs.org/en/download)

2. Change the directory to frontend using `cd frontend`

3. Install all the required packages using `npm install`

4. Create `.env` package inside the `./frontend` directory and set these configurations:
```
REACT_APP_BASE_API_URL = ...      # For example: https://example.com:8000/api
REACT_APP_BASE_WS_URL = ...       # For example: ws://example.com:8000/ws
REACT_APP_BASE_CLIENT_ROUTE = ... # For example: /sma/tutor
```

5. Build the web app using `npm run build` (It will run on port 3000)

6. Start the web app using `serve -s build` (run `npm install -g serve` if it hasn't been installed)


## Configuring MySQL Database
1. Connect to a MySQL database, you should already have MySQL database properly configured. (Using MySQL workbench is recommended)

2. Create schema named `core`
```sql
CREATE SCHEMA `core` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```


3. Create table `notifications` with this query:
```sql
CREATE TABLE `core`.`notifications` (
  `id` binary(16) default (uuid_to_bin(uuid())) NOT NULL PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `content` VARCHAR(500) NOT NULL,
  `from` VARCHAR(45) NOT NULL,
  `to` VARCHAR(45) NOT NULL,
  `timestamp` INT UNSIGNED NOT NULL,
  `type` TINYINT(20) NOT NULL
);
```

4. Create table `meetings` with this query:
```sql
CREATE TABLE `core`.`meetings` (
  `id` binary(16) default (uuid_to_bin(uuid())) NOT NULL PRIMARY KEY,
  `group_id` BINARY(16) NOT NULL,
  `meeting_timestamp` INT UNSIGNED NOT NULL,
  `teacher` VARCHAR(100) NULL,
  `student` VARCHAR(100) NOT NULL,
  `topic` VARCHAR(150) NOT NULL,
  `realization` VARCHAR(45) NOT NULL,
  `meeting_class` VARCHAR(20) NULL,
  `arrangement_timestamp` INT UNSIGNED NOT NULL,
  `evaluation` VARCHAR(250) NULL,
  `description` VARCHAR(250) NULL,
  `created_by` VARCHAR(100) NOT NULL,
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE);
```

5. Create table `students` with this query:
```sql
CREATE TABLE `core`.`accounts` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `class` VARCHAR(25) NOT NULL,
  `password` BINARY(64) NULL,
  `type` ENUM("student", "teacher", "other") NOT NULL,
  PRIMARY KEY (`id`));
```