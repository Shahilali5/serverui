# Manual QA checklist (Phase 5)

Use this list for human verification of ServerUI product flows. Check items only
when actually exercised. Mark **N/A** when the environment cannot run the case
(for example Windows packaging on a Mac-only machine).

Runtime under test: ☐ Web  ☐ Desktop  
OS / browser: _______________  
Build / version: _______________  
Date: _______________

## First run

- [ ] Launch with zero servers
- [ ] Welcome / empty state explains SSH desktop control panel
- [ ] Add your first server opens the form
- [ ] Save Server persists the server
- [ ] Save & Connect boots into the desktop
- [ ] Test Connection on a card shows Connecting → success or friendly failure
- [ ] Errors never show passwords, private keys, or tokens

## Server management

- [ ] Add additional server
- [ ] Edit server (leave password blank keeps existing)
- [ ] Delete server requires confirmation; remote host untouched
- [ ] Connect opens boot screen then desktop
- [ ] Top bar shows current server name + status
- [ ] Top bar → Switch to another server remounts desktop for that host
- [ ] Top bar → All servers returns to selection
- [ ] Top bar → Leave server shows logout animation then selection
- [ ] After switch, Dashboard/Files/Terminal reflect the new server only

## Terminal

- [ ] Open Terminal from dock
- [ ] Run a simple command
- [ ] Rapid window resize; terminal refits cleanly without 0x0 exceptions
- [ ] Multi-server tabs: switch between tabs repeatedly without blank screen or crash
- [ ] Close window; reconnect from a new Terminal window
- [ ] Disconnect / offline server shows reconnect affordance and floating toast
- [ ] Typing in terminal is not stolen by ⌘/Ctrl+W

## Code Editor (px0)

- [ ] Open Editor from Dock, Desktop context menu, or Files (Right-click → Edit)
- [ ] px0 branding badge visible with link to `github.com/px0-ai/px0`
- [ ] Open new scratch buffer tab (`+`)
- [ ] Quick Open (`Cmd/Ctrl+O`) loads remote file by path (e.g. `~/.bashrc` or `/etc/hosts`)
- [ ] Edit content; tab displays amber dirty dot (`●`)
- [ ] Save (`Cmd/Ctrl+S`) saves to remote host with green confirmation toast
- [ ] Find & Replace (`Cmd/Ctrl+F`) highlights matches and supports Replace All
- [ ] Line numbers gutter syncs scroll with code textarea and highlights active line
- [ ] Close tab or window with unsaved edits prompts confirmation guard
- [ ] Language badge updates dynamically based on file extension

## Files

- [ ] Browse directories
- [ ] Empty folder message
- [ ] Upload a small file
- [ ] Download a file
- [ ] Rename
- [ ] Delete shows confirmation naming the file/folder
- [ ] Permission / list errors show inline alert
- [ ] Right-click a `.zip` / `.tar.gz` / `.7z`: **Extract Here** and **Extract To…** appear (not on other files)
- [ ] Extract Here with one top-level folder extracts it next to the archive
- [ ] Extract Here with several top-level items extracts into a folder named after the archive
- [ ] Extract To… creates the destination folder when missing
- [ ] Progress shows while extracting; Cancel leaves nothing behind (no `.serverui-extract.*` folder)
- [ ] Existing item with the same name prompts Cancel / Keep both / Replace; Keep both creates `name (1)`
- [ ] Corrupted archive, read-only folder, and missing `unzip` / `7z` show a clear error
- [ ] Archive with `../` or absolute paths is refused and writes nothing
- [ ] Icon / list view switch works and is remembered after reopening Files
- [ ] Sidebar **Home** opens the SSH user's real home (e.g. `/root` for root)
- [ ] Right-click menu and the toolbar ⋯ menu open at the cursor / button, fully on screen
- [ ] Toolbar buttons show tooltips on hover; the window drags from the toolbar

## Metrics (Dashboard)

- [ ] CPU / RAM / Disk / Uptime when online
- [ ] Offline / connecting states
- [ ] Last updated timestamp changes on refresh/poll
- [ ] Unavailable label when offline

## Desktop chrome

- [ ] Open multiple apps
- [ ] Move / resize windows
- [ ] Maximize / restore / minimize / close
- [ ] Dock indicators for open / focused apps
- [ ] Context menu: Terminal, Files, Dashboard, Settings, Leave server
- [ ] ⌘/Ctrl+K opens server menu
- [ ] ⌘/Ctrl+, opens Settings
- [ ] Esc closes menus

## Coming soon modules

- [ ] Editor / Applications / Domains / Databases clearly Coming soon
- [ ] Trash dock item shows Coming soon toast

## Settings

- [ ] About shows application name + version (desktop) or web
- [ ] Runtime shows web vs desktop without secrets
- [ ] Desktop: Check for updates UI present (network may fail unsigned)
- [ ] Web: no updater install controls; web deployment note visible
- [ ] Shortcuts listed

## Failure cases

- [ ] Wrong password → authentication failed (boot or test)
- [ ] Bad host → unreachable / unavailable copy
- [ ] Backend down → server list error + Retry
- [ ] Network interruption while on desktop → metrics offline; terminal reconnect

## Security smoke

- [ ] Local auth token never shown in UI
- [ ] Credentials never shown after save
- [ ] No secrets in visible error banners
- [ ] Desktop: backend remains on 127.0.0.1 (spot-check via `lsof` / Activity)

## Responsive (web)

- [ ] Desktop browser (~1440px) usable
- [ ] Laptop (~1280px) usable
- [ ] Narrow (~900px) still operable (windows may be tight)
- [ ] Mobile not claimed as supported

## Notes

Record bugs / follow-ups below:

```
(none yet)
```
