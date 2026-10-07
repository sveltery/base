#!/usr/bin/env bash
# Launch, check, drive, and stop one Sveltery docs preview.
# Never signals a process by name. Evidence under $SVELTERY_DOCS_STATE/evidence survives cleanup.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
STATE="${SVELTERY_DOCS_STATE:-/tmp/sveltery-docs-verify}"
SESSION="$STATE/session"
EVIDENCE="$STATE/evidence"
PORT="${PORT:-5173}"

usage() {
  echo "usage: session.sh launch|doctor|drive|cleanup" >&2
  exit 2
}

ensure_node24() {
  local major candidate
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [[ "$major" == 24 ]]; then
    return
  fi
  candidate="$(find "$HOME/.nvm/versions/node" -maxdepth 1 -type d -name 'v24.*' 2>/dev/null | sort -V | tail -1 || true)"
  if [[ -n "$candidate" && -x "$candidate/bin/node" ]]; then
    export PATH="$candidate/bin:$PATH"
    hash -r
  fi
  major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [[ "$major" != 24 ]]; then
    echo "Node 24.x is required (package.json engines; scripts/toolchain.sh). Current: $(node -v 2>/dev/null || echo missing)." >&2
    exit 1
  fi
}

source_toolchain() {
  ensure_node24
  # shellcheck disable=SC1091
  source "$ROOT/scripts/toolchain.sh"
}

port_hex() {
  printf '%04X' "$1"
}

listener_pids() {
  local hex="$1" inode pid fd target
  local -a inodes=()
  while read -r inode; do
    [[ -n "$inode" ]] && inodes+=("$inode")
  done < <(awk -v hex="$hex" 'NR>1 { addr=$2; sub(/.*:/, "", addr); if (addr==hex && $4=="0A") print $10 }' /proc/net/tcp /proc/net/tcp6 2>/dev/null || true)
  if [[ ${#inodes[@]} -eq 0 ]]; then
    return
  fi
  shopt -s nullglob
  for pid_path in /proc/[0-9]*; do
    pid="${pid_path#/proc/}"
    for fd in "$pid_path"/fd/*; do
      target="$(readlink "$fd" 2>/dev/null || true)"
      for inode in "${inodes[@]}"; do
        if [[ "$target" == "socket:[$inode]" ]]; then
          echo "$pid"
        fi
      done
    done
  done | sort -u
}

descendants_of() {
  local parent="$1" pid ppid
  shopt -s nullglob
  for pid_path in /proc/[0-9]*; do
    pid="${pid_path#/proc/}"
    ppid="$(awk '/^PPid:/ { print $2 }' "$pid_path/status" 2>/dev/null || true)"
    if [[ "$ppid" == "$parent" ]]; then
      echo "$pid"
      descendants_of "$pid"
    fi
  done
}

pid_in_tree() {
  local root="$1" needle="$2" pid
  [[ "$needle" == "$root" ]] && return 0
  while read -r pid; do
    [[ "$pid" == "$needle" ]] && return 0
  done < <(descendants_of "$root")
  return 1
}

read_pid_file() {
  local pid
  pid="$(tr -d '[:space:]' < "$SESSION/pid")"
  if [[ ! "$pid" =~ ^[0-9]+$ ]]; then
    echo "session pid file is not a pid: $SESSION/pid" >&2
    exit 1
  fi
  echo "$pid"
}

recorded_port() {
  if [[ ! -f "$SESSION/port" ]]; then
    echo "no recorded port at $SESSION/port. launch first." >&2
    exit 1
  fi
  tr -d '[:space:]' < "$SESSION/port"
}

cmd_of() {
  tr '\0' ' ' < "/proc/$1/cmdline" 2>/dev/null || true
}

pgrp_of() {
  # /proc/pid/stat: pid (comm) state ppid pgrp ...
  awk -F')' '{ split($2, a, " "); print a[3] }' "/proc/$1/stat"
}

launch() {
  local hex listeners pid
  source_toolchain
  mkdir -p "$SESSION" "$EVIDENCE"
  if [[ -f "$SESSION/pid" ]]; then
    pid="$(tr -d '[:space:]' < "$SESSION/pid" || true)"
    if [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null; then
      echo "tracked session already live (pid $pid, state $STATE)." >&2
      echo "Refusing to start another. Use a different SVELTERY_DOCS_STATE and a free PORT for a second instance." >&2
      exit 1
    fi
  fi
  hex="$(port_hex "$PORT")"
  listeners="$(listener_pids "$hex" | tr '\n' ' ')"
  if [[ -n "${listeners// /}" ]]; then
    echo "port $PORT is already owned by pid(s): $listeners" >&2
    echo "Refusing to take a listener this session did not start." >&2
    exit 1
  fi
  : > "$SESSION/server.log"
  echo "$PORT" > "$SESSION/port"
  (
    cd "$ROOT"
    set -m
    nohup pnpm --filter @sveltery/fixtures dev --port "$PORT" --strictPort \
      >"$SESSION/server.log" 2>&1 < /dev/null &
    echo $! > "$SESSION/pid"
    disown "$!" 2>/dev/null || true
  )
  pid="$(read_pid_file)"
  local i
  for i in $(seq 1 50); do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "docs server exited before it was ready. log:" >&2
      cat "$SESSION/server.log" >&2
      exit 1
    fi
    if grep -q "Local:" "$SESSION/server.log" &&
      curl -fsS "http://127.0.0.1:$PORT/docs" | grep -q "Sveltery Base"; then
      echo "ready http://127.0.0.1:$PORT/docs"
      echo "pid $pid"
      echo "log $SESSION/server.log"
      echo "evidence $EVIDENCE"
      return 0
    fi
    sleep 0.2
  done
  echo "timed out waiting for http://127.0.0.1:$PORT/docs. log:" >&2
  cat "$SESSION/server.log" >&2
  exit 1
}

doctor() {
  local pid port hex listener exe node_version body dialog_body cmdline ok=0
  [[ -f "$SESSION/pid" ]] || { echo "no session pid. launch first." >&2; exit 1; }
  pid="$(read_pid_file)"
  port="$(recorded_port)"
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "recorded pid $pid is not running" >&2
    exit 1
  fi
  hex="$(port_hex "$port")"
  listener=""
  while read -r candidate; do
    [[ -z "$candidate" ]] && continue
    if pid_in_tree "$pid" "$candidate"; then
      listener="$candidate"
      break
    fi
  done < <(listener_pids "$hex")
  if [[ -z "$listener" ]]; then
    echo "port $port is not owned by pid $pid or a descendant" >&2
    exit 1
  fi
  cmdline="$(cmd_of "$listener")"
  if [[ "$cmdline" != *vite* || "$cmdline" != *dev* ]]; then
    echo "listener $listener command is not vite dev: $cmdline" >&2
    exit 1
  fi
  exe="$(readlink -f "/proc/$listener/exe")"
  node_version="$("$exe" -p 'process.versions.node')"
  if [[ "$node_version" != 24.* ]]; then
    echo "listener node is $node_version, want 24.x ($exe)" >&2
    exit 1
  fi
  body="$(curl -fsS "http://127.0.0.1:$port/docs")"
  dialog_body="$(curl -fsS "http://127.0.0.1:$port/docs/components/dialog")"
  grep -q "Sveltery Base" <<<"$body" || { echo "GET /docs missing Sveltery Base" >&2; ok=1; }
  grep -q "Experimental" <<<"$body" || { echo "GET /docs missing Experimental" >&2; ok=1; }
  grep -q 'data-hydrated="false"' <<<"$body" || { echo "GET /docs missing SSR data-hydrated=false" >&2; ok=1; }
  if grep -q 'role="dialog"' <<<"$body"; then
    echo "GET /docs SSR unexpectedly contains role=dialog" >&2
    ok=1
  fi
  grep -q "Explore a dialog" <<<"$dialog_body" || { echo "GET /docs/components/dialog missing Explore a dialog" >&2; ok=1; }
  if [[ "$ok" != 0 ]]; then
    exit 1
  fi
  echo "doctor ok"
  echo "pid $pid listener $listener port $port node $node_version"
  echo "auth none (anonymous GET)"
  echo "cmdline $cmdline"
}

drive() {
  source_toolchain
  [[ -f "$SESSION/port" ]] || { echo "no session. launch first." >&2; exit 1; }
  node "$ROOT/.cursor/skills/verify-sveltery-docs/scripts/drive-live-dialog.mjs"
}

cleanup() {
  local pid pgrp
  if [[ ! -f "$SESSION/pid" ]]; then
    echo "no tracked session at $SESSION"
    return 0
  fi
  pid="$(tr -d '[:space:]' < "$SESSION/pid" || true)"
  if [[ "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null; then
    pgrp="$(pgrp_of "$pid")"
    if [[ "$pgrp" != "$pid" ]]; then
      echo "recorded pid $pid is not its process-group leader (pgrp $pgrp); refusing to signal the group" >&2
      exit 1
    fi
    kill -TERM -- "-$pid" 2>/dev/null || true
    local i
    for i in $(seq 1 25); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.2
    done
    if kill -0 "$pid" 2>/dev/null; then
      kill -KILL -- "-$pid" 2>/dev/null || true
    fi
  fi
  rm -rf "$SESSION"
  echo "cleaned session $STATE (evidence kept at $EVIDENCE)"
}

[[ $# -eq 1 ]] || usage
case "$1" in
  launch) launch ;;
  doctor) doctor ;;
  drive) drive ;;
  cleanup) cleanup ;;
  *) usage ;;
esac
