Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "c:\Antigravity Projects\Wealth Strategist Pro"
WshShell.Run """c:\Antigravity Projects\Wealth Strategist Pro\Launch-FinFlow-Pro.bat""", 1, False
