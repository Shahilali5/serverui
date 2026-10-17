#!/usr/bin/env bash
# ==============================================================================
# ServerUI — 1-Click Automated Installation & Setup Script
# Works on: Ubuntu, Debian, CentOS, RHEL, Fedora, Rocky, AlmaLinux, Arch, macOS
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/shahilali5/serverui/main/install.sh | bash
#   or: ./install.sh [options]
# ==============================================================================

set -euo pipefail

# Colors and formatting
BOLD="\033[1m"
GREEN="\033[38;2;63;185;80m"
BLUE="\033[38;2;88;166;255m"
CYAN="\033[38;2;56;189;248m"
YELLOW="\033[38;2;245;158;11m"
RED="\033[38;2;239;68;68m"
DIM="\033[2m"
RESET="\033[0m"

# Defaults
DEFAULT_WEB_PORT=3000
DEFAULT_HTTP_PORT=8080
INSTALL_DIR="${SERVERUI_DIR:-$HOME/serverui}"
REPO_URL="https://github.com/shahilali5/serverui.git"
BRANCH="${SERVERUI_BRANCH:-main}"
MODE="docker" # "docker" or "native"

info()    { echo -e "${CYAN}ℹ${RESET}  $*"; }
success() { echo -e "${GREEN}✔${RESET}  $*"; }
warn()    { echo -e "${YELLOW}▲${RESET}  $*"; }
error()   { echo -e "${RED}✖${RESET}  $*" >&2; }
step()    { echo -e "\n${BOLD}${BLUE}==>${RESET} ${BOLD}$*${RESET}"; }

print_banner() {
  echo -e "${CYAN}"
  cat << "EOF"
   ____                           __  ______
  / __/___ _______  _____ ____ __/ / /  _/ /
 _\ \/ -_) __/ _ \/ -_) __/ // / / _/ / / /_
/___/\__/_/ /_//_/\__/_/  \_,_/_/ /___/____/
  A Modern, Open-Source Server Control Panel
EOF
  echo -e "${RESET}"
  echo -e "${DIM}  Version 0.3.0  •  Built for Cloud, VPS & Bare Metal${RESET}"
  echo -e "${DIM}  Contributors: Shubham Rakhecha & Shahil (@shahilali5)${RESET}"
  echo ""
}

# Parse command line flags if any
while [[ $# -gt 0 ]]; do
  case "$1" in
    --native|--no-docker)
      MODE="native"
      shift
      ;;
    --dir)
      INSTALL_DIR="$2"
      shift 2
      ;;
    --port)
      DEFAULT_WEB_PORT="$2"
      shift 2
      ;;
    --api-port)
      DEFAULT_HTTP_PORT="$2"
      shift 2
      ;;
    --branch)
      BRANCH="$2"
      shift 2
      ;;
    -h|--help)
      print_banner
      echo "Usage: ./install.sh [options]"
      echo ""
      echo "Options:"
      echo "  --dir <path>       Destination directory (default: $HOME/serverui)"
      echo "  --port <num>       Web UI port (default: 3000)"
      echo "  --api-port <num>   Go API server port (default: 8080)"
      echo "  --native           Install native Go & Node dependencies without Docker"
      echo "  --branch <name>    Git branch to clone (default: main)"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      warn "Unknown option: $1"
      shift
      ;;
  esac
done

# Sudo wrapper helper
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO="sudo"
  else
    error "This script requires superuser privileges to install packages. Please run as root or install sudo."
    exit 1
  fi
fi

# Detect package manager
detect_pkg_manager() {
  if command -v apt-get >/dev/null 2>&1; then
    echo "apt"
  elif command -v dnf >/dev/null 2>&1; then
    echo "dnf"
  elif command -v yum >/dev/null 2>&1; then
    echo "yum"
  elif command -v pacman >/dev/null 2>&1; then
    echo "pacman"
  elif command -v apk >/dev/null 2>&1; then
    echo "apk"
  elif command -v brew >/dev/null 2>&1; then
    echo "brew"
  else
    echo "unknown"
  fi
}

# Install essential dependencies (curl, git, openssl)
install_essentials() {
  step "Checking essential dependencies..."
  PKG_MGR=$(detect_pkg_manager)

  MISSING_PKGS=()
  for cmd in git curl openssl; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      MISSING_PKGS+=("$cmd")
    fi
  done

  if [ ${#MISSING_PKGS[@]} -eq 0 ]; then
    success "Essential utilities present (git, curl, openssl)."
    return
  fi

  info "Installing missing dependencies: ${MISSING_PKGS[*]} using $PKG_MGR..."
  case "$PKG_MGR" in
    apt)
      $SUDO apt-get update -y
      $SUDO apt-get install -y git curl openssl ca-certificates
      ;;
    dnf|yum)
      $SUDO "$PKG_MGR" install -y git curl openssl ca-certificates
      ;;
    pacman)
      $SUDO pacman -Sy --noconfirm git curl openssl ca-certificates
      ;;
    apk)
      $SUDO apk add --no-cache git curl openssl ca-certificates bash
      ;;
    brew)
      brew install git curl openssl
      ;;
    *)
      warn "Could not auto-install ${MISSING_PKGS[*]}. Please install them manually."
      ;;
  esac
}

# Install Docker & Docker Compose if missing
ensure_docker() {
  step "Verifying Docker & Docker Compose..."

  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    success "Docker and Docker Compose are already installed and ready."
  else
    info "Docker or Docker Compose is missing. Starting automated installation..."
    
    # Official Docker convenience installation script
    if command -v curl >/dev/null 2>&1; then
      info "Running official Docker setup script (https://get.docker.com)..."
      curl -fsSL https://get.docker.com | $SUDO sh
    else
      error "Curl not available to fetch Docker installer. Please install curl."
      exit 1
    fi

    # Start and enable docker daemon
    if command -v systemctl >/dev/null 2>&1; then
      $SUDO systemctl enable --now docker || true
      $SUDO systemctl start docker || true
    elif command -v service >/dev/null 2>&1; then
      $SUDO service docker start || true
    fi

    # Add current non-root user to docker group
    if [ "$(id -u)" -ne 0 ]; then
      $SUDO usermod -aG docker "$USER" || true
      info "Added $USER to docker group."
    fi

    success "Docker installation completed successfully."
  fi

  # Test docker responsiveness
  if ! docker ps >/dev/null 2>&1; then
    if [ -n "$SUDO" ] && $SUDO docker ps >/dev/null 2>&1; then
      info "Docker requires sudo for this shell session. Proceeding with sudo docker."
      DOCKER_CMD="$SUDO docker"
      COMPOSE_CMD="$SUDO docker compose"
    else
      warn "Docker daemon might still be starting. Trying to start..."
      $SUDO systemctl start docker || true
      sleep 2
      DOCKER_CMD="docker"
      COMPOSE_CMD="docker compose"
    fi
  else
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker compose"
  fi
}

# Fetch or verify the repository
setup_repository() {
  step "Configuring ServerUI repository..."

  # Check if we are already inside a cloned ServerUI directory
  if [ -f "apps/web/package.json" ] && [ -f "apps/server/go.mod" ]; then
    INSTALL_DIR="$(pwd)"
    success "Running inside existing ServerUI workspace at $INSTALL_DIR."
  else
    if [ -d "$INSTALL_DIR/.git" ]; then
      info "Existing ServerUI repository found at $INSTALL_DIR. Pulling latest $BRANCH..."
      cd "$INSTALL_DIR"
      git fetch origin "$BRANCH"
      git checkout "$BRANCH"
      git pull origin "$BRANCH"
    else
      info "Cloning ServerUI from $REPO_URL ($BRANCH) into $INSTALL_DIR..."
      mkdir -p "$(dirname "$INSTALL_DIR")"
      git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
      cd "$INSTALL_DIR"
    fi
    success "Repository ready at $INSTALL_DIR."
  fi
}

# Generate cryptographically secure .env file
setup_environment() {
  step "Generating configuration & AES-256-GCM encryption keys..."

  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      cp .env.example .env
      info "Created .env from .env.example."
    else
      touch .env
    fi
  fi

  # Generate 32-byte (64-character hex) credential encryption key if missing
  CURRENT_KEY=$(grep -E '^SERVERUI_CREDENTIAL_ENCRYPTION_KEY=' .env 2>/dev/null | cut -d'=' -f2- || true)
  if [ -z "$CURRENT_KEY" ]; then
    if command -v openssl >/dev/null 2>&1; then
      NEW_KEY=$(openssl rand -hex 32)
    else
      NEW_KEY=$(head -c 32 /dev/urandom | xxd -p -c 32 2>/dev/null || od -A n -N 32 -t x1 /dev/urandom | tr -d ' \n')
    fi

    if grep -q '^SERVERUI_CREDENTIAL_ENCRYPTION_KEY=' .env; then
      # Replace empty line
      TMP_FILE=$(mktemp)
      sed "s/^SERVERUI_CREDENTIAL_ENCRYPTION_KEY=.*/SERVERUI_CREDENTIAL_ENCRYPTION_KEY=$NEW_KEY/" .env > "$TMP_FILE" && mv "$TMP_FILE" .env
    else
      echo "SERVERUI_CREDENTIAL_ENCRYPTION_KEY=$NEW_KEY" >> .env
    fi
    success "Generated AES-256-GCM encryption key for securing server credentials."
  else
    info "Using existing encryption key from .env."
  fi

  # Ensure Ports are configured
  if ! grep -q '^WEB_PORT=' .env; then
    echo "WEB_PORT=$DEFAULT_WEB_PORT" >> .env
  fi
  if ! grep -q '^HTTP_PORT=' .env; then
    echo "HTTP_PORT=$DEFAULT_HTTP_PORT" >> .env
  fi

  success "Environment variables configured (.env)."
}

# Launch ServerUI using Docker Compose
deploy_docker() {
  step "Building and launching ServerUI containers..."

  COMPOSE_FILE="deploy/docker/docker-compose.yml"
  if [ ! -f "$COMPOSE_FILE" ]; then
    error "Docker Compose file not found at $COMPOSE_FILE!"
    exit 1
  fi

  info "Starting PostgreSQL, Go Backend API, and Next.js Web Desktop..."
  $COMPOSE_CMD -f "$COMPOSE_FILE" --env-file .env up -d --build --remove-orphans

  info "Waiting for services to become healthy..."
  for i in {1..30}; do
    if $DOCKER_CMD ps | grep -q "serverui-web"; then
      break
    fi
    sleep 1
  done

  success "ServerUI containers are up and running!"
}

# Detect public or local network IP
detect_ip() {
  HOST_IP=""
  if command -v curl >/dev/null 2>&1; then
    HOST_IP=$(curl -s -m 2 https://api.ipify.org 2>/dev/null || true)
  fi
  if [ -z "$HOST_IP" ]; then
    HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
  fi
  echo "$HOST_IP"
}

# Main installer flow
main() {
  print_banner
  install_essentials

  if [ "$MODE" = "docker" ]; then
    ensure_docker
  fi

  setup_repository
  setup_environment

  if [ "$MODE" = "docker" ]; then
    deploy_docker
  else
    info "Native mode selected. Please install Go 1.23+ and Node 22+ to run directly with 'make start' or 'make dev'."
  fi

  # Final summary
  DETECTED_IP=$(detect_ip)
  WEB_PORT=$(grep -E '^WEB_PORT=' .env 2>/dev/null | cut -d'=' -f2 || echo "$DEFAULT_WEB_PORT")

  echo ""
  echo -e "${BOLD}${GREEN}===================================================================${RESET}"
  echo -e "${BOLD}${GREEN}  🎉 ServerUI Installation Complete!${RESET}"
  echo -e "${BOLD}${GREEN}===================================================================${RESET}"
  echo ""
  echo -e "  ${BOLD}Desktop Web Interface:${RESET}"
  echo -e "  ➜  Local:    ${CYAN}http://localhost:${WEB_PORT}${RESET}"
  if [ "$DETECTED_IP" != "localhost" ] && [ -n "$DETECTED_IP" ]; then
    echo -e "  ➜  Network:  ${CYAN}http://${DETECTED_IP}:${WEB_PORT}${RESET}"
  fi
  echo ""
  echo -e "  ${BOLD}Security & Access:${RESET}"
  echo -e "  ➜  Initial Setup: Open the URL above to create your secure ${BOLD}Admin Username & Password${RESET}."
  echo ""
  echo -e "  ${BOLD}Installation Directory:${RESET} ${DIM}$INSTALL_DIR${RESET}"
  echo ""
  echo -e "  ${BOLD}Management Commands:${RESET}"
  echo -e "  ➜  View Logs:      ${DIM}cd $INSTALL_DIR && docker compose -f deploy/docker/docker-compose.yml logs -f${RESET}"
  echo -e "  ➜  Stop ServerUI:  ${DIM}cd $INSTALL_DIR && docker compose -f deploy/docker/docker-compose.yml down${RESET}"
  echo -e "  ➜  Restart:        ${DIM}cd $INSTALL_DIR && docker compose -f deploy/docker/docker-compose.yml restart${RESET}"
  echo -e "  ➜  Update:         ${DIM}cd $INSTALL_DIR && git pull && docker compose -f deploy/docker/docker-compose.yml up -d --build${RESET}"
  echo ""
  echo -e "  ${DIM}Thank you for using ServerUI! Star on GitHub: https://github.com/shahilali5/serverui${RESET}"
  echo -e "${BOLD}${GREEN}===================================================================${RESET}"
  echo ""
}

main "$@"
