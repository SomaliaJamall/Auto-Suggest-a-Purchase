

# Auto Suggest a Purchase

A system for managing patron holds that assist with collecting a filtering material suggestions and tracking purchase status.

Automatically places holds for patrons once a material is acqiured.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Support](#support)
- [Contributing](#contributing)

## Installation Using Docker

### Choose your deployment environment

Decide where you will host ASAP. ASAP works great either in the cloud or on your internal servers. ASAP plays nicely on a linux server, and works on Windows IIS as well. Clone the repository. You can use the [Github Command Line interface](https://cli.github.com/) for this with:

```
gh repo clone SomaliaJamall/Auto-Suggest-a-Purchase
```

The Patron form needs to be publically accessible, the staff side you may chose to only have accessible on your staff network.

### 1. Define your environement 

Create a .staff.ini in the project root with the following information

```ini
[API]
ASAP_HOST = ... ;The server url where you are hosting ASAP
API_ACCESS_ID = ... ;Polaris API access ID
API_KEY = ... ;Polaris API Key
HOST = ... ;Polaris LEAP host url, if hosted normally ends in polarislibrary.com
TEST_HOST = ...;Test/Training Polaris LEAP host
STAFF_DOMAIN = ... ;Polaris domain
ADMIN_USER = ... ;Admin user - ASAP will act as this user
ADMIN_PASSWORD = ... ;Admin password - ASAP will act as this user

[EMAIL]
SMTP_SERVER = ...
SMTP_PORT = ...
SMTP_PASSWORD = ... ;(if not needed leave blank '')
SMTP_EMAIL = ... ;Sender email and authentication Username

; Polaris LEAP authorized staff usernames (no domain)
[Users]
user[0] = ...
user[1] = ...
user[2] = ...
; Add or delete users as needed, make sure the numbers in the  "[]" start at 0 and are seqential
```

### 2. Install docker or docker desktop and python3

See the [docker website](https://docs.docker.com/get-started/get-docker/) for install directions

See the [python website](https://www.python.org/downloads/) for install directions

### 3. Start the docker container

From the root project directory, run 
```
docker-compose up --build -d
```

### 4. Install python libraries with install script

From the root directory on Windows Powershell:
```
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\install_script.ps1
```

From the root directory on Linux:
```
sh install_script.sh
```

## Usage

### Staff Dashboard
The staff dashboard will be served on port 80 (standard) of the host. Only the staff users defined in staff.ini will have access.

### Patron form
The patron form lives at HOSTADDRESS/patron. This form is made to be inserted as an iframe into your existing library website, so make sure the host is publically accessible.

### Automate script to check when hold can be placed
Schedule python3 [ROOT_DIR]/check_list_for_purchase.py

## Support

Please [open an issue](https://github.com/SomaliaJamall/Auto-Suggest-a-Purchase/issues/new) for support.

## Contributing

Please contribute using [Github Flow](https://guides.github.com/introduction/flow/). Create a branch, add commits, and [open a pull request](https://github.com/SomaliaJamall/Auto-Suggest-a-Purchase/compare/).
