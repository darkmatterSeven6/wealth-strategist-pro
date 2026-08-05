$WshShell = New-Object -ComObject WScript.Shell

$appDir = "c:\Antigravity Projects\Wealth Strategist Pro"
$targetBatch = Join-Path $appDir "Launch-DV-Financials.bat"
$iconPath = Join-Path $appDir "app.ico"

$destinations = @(
    (Join-Path $appDir "DV Financials.lnk"),
    (Join-Path ([System.Environment]::GetFolderPath('Desktop')) "DV Financials.lnk"),
    "C:\Users\danie\OneDrive\Desktop\DV Financials.lnk",
    (Join-Path ([System.Environment]::GetFolderPath('Programs')) "DV Financials.lnk"),
    "C:\Users\danie\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\DV Financials.lnk",
    "C:\Users\danie\AppData\Roaming\Microsoft\Windows\Start Menu\DV Financials.lnk"
)

$oldShortcuts = @(
    (Join-Path $appDir "FinFlow Pro.lnk"),
    (Join-Path ([System.Environment]::GetFolderPath('Desktop')) "FinFlow Pro.lnk"),
    "C:\Users\danie\OneDrive\Desktop\FinFlow Pro.lnk",
    (Join-Path ([System.Environment]::GetFolderPath('Programs')) "FinFlow Pro.lnk"),
    "C:\Users\danie\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\FinFlow Pro.lnk",
    "C:\Users\danie\AppData\Roaming\Microsoft\Windows\Start Menu\FinFlow Pro.lnk"
)

foreach ($old in $oldShortcuts) {
    if (Test-Path $old) {
        Remove-Item -Path $old -Force -ErrorAction SilentlyContinue
    }
}

$createdCount = 0

foreach ($dest in ($destinations | Select-Object -Unique)) {
    if ($dest) {
        $parentDir = Split-Path -Path $dest -Parent
        if (Test-Path $parentDir) {
            $shortcut = $WshShell.CreateShortcut($dest)
            $shortcut.TargetPath = $targetBatch
            $shortcut.WorkingDirectory = $appDir
            if (Test-Path $iconPath) {
                $shortcut.IconLocation = "$iconPath, 0"
            }
            $shortcut.Description = "DV Financials - Local Wealth and Quantitative Hub"
            $shortcut.Save()
            Write-Output "Created shortcut: $dest"
            $createdCount++
        }
    }
}

Write-Output "TOTAL_CREATED: $createdCount"
