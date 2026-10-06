# Development setup guide

This guide explains how to install everything you need and run the project on **Windows**, **macOS** or **Linux**. Follow only the section for your operating system, then continue with [Running the project](#running-the-project) and [Connecting with MongoDB Compass](#connecting-with-mongodb-compass).

The whole project runs inside **Docker**: MongoDB, the backend and the frontend. That means you do **not** need to install Node.js or MongoDB Server to work on the project. You only need:

| Tool | What it is for |
|---|---|
| **Docker Desktop** (Docker Engine on Linux) | Runs MongoDB, the backend and the frontend in containers |
| **Git** | Clones the repository and manages branches |
| **make** (optional) | Short commands such as `make up` and `make logs-back` |
| **MongoDB Compass** | Graphical tool to see and edit the data in MongoDB |

---

## Windows

All the commands below are typed in **PowerShell**. Steps 1 and 2 need PowerShell **as administrator**: open the Start menu, search for "PowerShell", right-click it and choose **Run as administrator**.

The commands use `winget`, the package manager included in Windows 10 (version 1809 or newer) and Windows 11. If `winget` doesn't work on your computer, each step has a link to download the installer instead.

### 1. Check that virtualization is enabled

Docker needs hardware virtualization.

1. Open the **Task Manager** (`Ctrl + Shift + Esc`).
2. Go to the **Performance** tab and click **CPU**.
3. Look for **Virtualization**. It must say **Enabled**.

If it says **Disabled**, you have to enable it in the BIOS/UEFI of your computer. The option is usually called *Intel VT-x*, *Intel Virtualization Technology*, *AMD-V* or *SVM Mode*. Search for "enable virtualization" plus your computer model for the exact steps.

### 2. Install WSL 2

Docker Desktop uses WSL 2 (Windows Subsystem for Linux) to run Linux containers. In PowerShell **as administrator**:

```powershell
wsl --install
```

**Restart your computer** when it finishes. Then check it, in a normal PowerShell:

```powershell
wsl --status
```

It should say `Default Version: 2`. If WSL was already installed, update it with `wsl --update`.

### 3. Install Docker Desktop

```powershell
winget install -e --id Docker.DockerDesktop
```

Or download it from <https://www.docker.com/products/docker-desktop/>.

Then:

1. **Restart your computer** if the installer asks you to.
2. Open **Docker Desktop** from the Start menu and accept the terms. You can skip the sign-in.
3. Make sure **Use the WSL 2 based engine** is checked in *Settings → General*. It is the default.
4. Wait until the bottom-left corner of Docker Desktop says **Engine running**.

Check it in PowerShell:

```powershell
docker --version
docker compose version
docker run --rm hello-world
```

The last command should print `Hello from Docker!`.

> **Docker Desktop must be open every time you work on the project.** If it is closed, Docker commands fail with errors like `error during connect` or `cannot find the file specified ... dockerDesktopLinuxEngine`.

### 4. Install Git

Skip this step if `git --version` already works.

```powershell
winget install -e --id Git.Git
```

Or download it from <https://git-scm.com/download/win>. Git for Windows also installs **Git Bash**, a terminal you will use in step 6.

### 5. Install make (optional)

```powershell
winget install -e --id ezwinports.make
```

**Close and reopen the terminal**, then check it:

```powershell
make --version
```

If you prefer not to install make, you can use the `docker compose` commands instead. Every `make` command has its equivalent in the [commands table](#commands).

### 6. Use Git Bash for the make commands

The `Makefile` is written for a Linux-style terminal. In PowerShell, `make up` and `make down` work, but `make` (the help) prints extra quotes and `make clean` fails.

**Use Git Bash to run the `make` commands.** Open it from the Start menu (search "Git Bash"), or in VS Code open the terminal dropdown and choose **Git Bash**.

In PowerShell, use the `docker compose` commands from the [commands table](#commands) instead.

### 7. Install MongoDB Compass

```powershell
winget install -e --id MongoDB.Compass.Full
```

Or download it from <https://www.mongodb.com/try/download/compass>.

### 8. If you installed MongoDB Server for class, stop it

When MongoDB Server is installed on Windows, it runs as a **Windows service that starts automatically** with the computer, and it uses port **27017**, the same port as the project's database. If both run at the same time:

- `make up` fails with `port is already allocated`, or
- MongoDB Compass connects to the **wrong** database (the one installed on Windows instead of the project's).

Check if it's installed and running, in PowerShell:

```powershell
Get-Service MongoDB
```

If it says `Running`, stop it and keep it from starting automatically. In PowerShell **as administrator**:

```powershell
Stop-Service MongoDB
Set-Service -Name MongoDB -StartupType Manual
```

This doesn't uninstall anything. When you need it again for another class, start it with `Start-Service MongoDB`, and stop it again before running this project.

If `Get-Service MongoDB` says it can't find the service, MongoDB Server is not installed and there is nothing to do.

Now continue with [Running the project](#running-the-project).

---

## macOS

1. **Docker Desktop.** Download it from <https://www.docker.com/products/docker-desktop/> (choose Apple Silicon or Intel depending on your Mac), or with [Homebrew](https://brew.sh/):
   ```bash
   brew install --cask docker
   ```
   Open Docker Desktop and wait until it says **Engine running**. It must be open every time you work on the project.
2. **Git and make.** Both come with the Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. **MongoDB Compass:**
   ```bash
   brew install --cask mongodb-compass
   ```
   Or download it from <https://www.mongodb.com/try/download/compass>.
4. **If you installed MongoDB with Homebrew**, stop it so it doesn't use port 27017:
   ```bash
   brew services stop mongodb-community
   ```

Check everything with:

```bash
docker --version
docker compose version
make --version
```

---

## Linux

1. **Docker Engine and the Compose plugin.** Follow the official guide for your distribution: <https://docs.docker.com/engine/install/>. Then allow your user to run Docker without `sudo`, and log out and back in:
   ```bash
   sudo usermod -aG docker $USER
   ```
2. **Git and make.** Install them with your package manager, for example `sudo apt install git make` on Ubuntu or Debian.
3. **MongoDB Compass.** Download the `.deb` or `.rpm` package from <https://www.mongodb.com/try/download/compass>.
4. **If MongoDB Server is installed and running**, stop it so it doesn't use port 27017:
   ```bash
   sudo systemctl stop mongod
   sudo systemctl disable mongod   # optional: don't start it with the computer
   ```

---

## Running the project

### First time

```bash
git clone <repository URL>
cd real_state_management
make up
```

The first `make up` takes a few minutes, because Docker downloads the base images and installs the dependencies. The next times it starts in seconds.

When it finishes, check that everything is up:

```bash
make ps
```

All three services must appear as `Up`, and `gup-mongo` as `(healthy)`:

| Service | Open | What you should see |
|---|---|---|
| Frontend | <http://localhost:5173> | The landing page |
| Backend | <http://localhost:4000/api/health> | `{"status":"ok"}` |
| MongoDB | MongoDB Compass at `mongodb://localhost:27017` | See [the next section](#connecting-with-mongodb-compass) |

### Every day

1. Open **Docker Desktop** (Windows and macOS).
2. `make up` to start everything.
3. Work as usual in VS Code. When you save a file, **Vite reloads the browser** and **nodemon restarts the backend** by themselves.
4. `make down` when you finish.

### After pulling changes

If the changes you pulled include a modified `package.json` (someone installed or removed a dependency), run:

```bash
make build
```

Dependencies live inside the Docker images, so the images have to be rebuilt. For changes in the code only, you don't need to do anything.

### Commands

| make | docker compose | What it does |
|---|---|---|
| `make up` | `docker compose up -d` | Starts the whole stack in the background |
| `make build` | `docker compose up -d --build --renew-anon-volumes` | Rebuilds the images and starts. Use it after a dependency changes |
| `make down` | `docker compose down` | Stops and removes the containers. **Database data is kept** |
| `make restart` | `docker compose restart` | Restarts the services |
| `make ps` | `docker compose ps` | Shows the status and ports of each service |
| `make logs` | `docker compose logs -f --tail=100` | Live logs of all services |
| `make logs-front` | `docker compose logs -f --tail=100 frontend` | Live logs of the frontend |
| `make logs-back` | `docker compose logs -f --tail=100 backend` | Live logs of the backend |
| `make logs-db` | `docker compose logs -f --tail=100 mongo` | Live logs of MongoDB |
| `make db-shell` | `docker compose exec mongo mongosh real_estate` | Opens the MongoDB shell on the `real_estate` database |
| `make clean` | `docker compose down -v` | Stops everything and **deletes all database data** (asks for confirmation) |

Press `Ctrl + C` to leave the logs. make then prints something like `make: *** [Makefile:48: logs-back] Error 130`. **That is normal:** 130 is the exit code for "interrupted with Ctrl + C", not an error.

---

## Connecting with MongoDB Compass

The project's MongoDB runs inside Docker, but its port is published on your computer, so Compass connects to it as if it were installed locally.

1. Start the project with `make up`.
2. Open **MongoDB Compass**.
3. Click **Add new connection** (or **New connection**).
4. In **URI**, write:
   ```
   mongodb://localhost:27017
   ```
5. Click **Save & Connect** (or **Connect**).

You don't need a username or password. The database has no authentication because it is only for local development, and Docker only publishes its port to your own computer (`127.0.0.1`), so nobody else on your network can reach it.

### Where is the project's database?

The backend uses a database called **`real_estate`**. You won't see it in Compass until it has data, because **MongoDB only creates a database when the first document is saved**. That is normal. If you want to see it right away, create it from Compass: click **+** next to *Databases*, write `real_estate` as the database name and any collection name.

### Is my data kept?

Yes. The data is stored in a Docker volume (`gup_mongo-data`) and survives `make down`, restarting the computer and rebuilding the images. It is **only deleted with `make clean`** (`docker compose down -v`).

Each computer has its own database: what you save is not shared with your teammates.

### Compass shows other databases, or not the ones I expect

You are probably connected to a MongoDB installed on your computer instead of the project's. Stop it as explained in the section for your operating system, then run `make up` again and reconnect Compass.

---

## Troubleshooting

**`error during connect`, `Cannot connect to the Docker daemon` or `dockerDesktopLinuxEngine: The system cannot find the file specified`.**
Docker Desktop is not running. Open it and wait for **Engine running**.

**`port is already allocated` or `address already in use`.**
Something is already using port 5173, 4000 or 27017:
- `npm run dev` running in another terminal: stop it with `Ctrl + C`.
- MongoDB installed on your computer: stop it (see your operating system's section).
- Another Docker container: list them with `docker ps` and stop it with `docker stop <name>`.

**`make: command not found` or `'make' is not recognized`.**
Close and reopen the terminal after installing make. If it still fails, use the `docker compose` commands from the [commands table](#commands).

**`make` shows strange quotes, or `make clean` fails (Windows).**
You are running make in PowerShell or CMD. Use **Git Bash** (see [step 6](#6-use-git-bash-for-the-make-commands)).

**`WSL 2 installation is incomplete` or Docker Desktop doesn't start (Windows).**
Run `wsl --update` in PowerShell as administrator and restart your computer.

**My changes don't show up.**
Check the logs of the service (`make logs-front` or `make logs-back`) for errors. If nothing helps, run `make restart`. If you installed a new dependency, run `make build`.

**Something broke and nothing helps.**
`make down` and then `make build` rebuilds everything from scratch, without deleting your database.
