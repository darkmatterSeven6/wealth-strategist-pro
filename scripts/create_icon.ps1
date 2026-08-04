Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\danie\.gemini\antigravity\brain\a4db90ab-ce45-4d92-8248-690825c64fad\finflow_icon_1785820088071.jpg"
$dstDir = "c:\Antigravity Projects\Wealth Strategist Pro"
$dstPng = Join-Path $dstDir "app_icon.png"
$dstIco = Join-Path $dstDir "app.ico"

# Load source image
$img = [System.Drawing.Image]::FromFile($srcPath)

# Save as PNG
$img.Save($dstPng, [System.Drawing.Imaging.ImageFormat]::Png)

# Create 256x256 resized bitmap
$bmp256 = New-Object System.Drawing.Bitmap(256, 256)
$g = [System.Drawing.Graphics]::FromImage($bmp256)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($img, 0, 0, 256, 256)
$g.Dispose()

# Create multi-res ICO file using .NET Icon FromHandle or Binary ICO Writer
$hIcon = $bmp256.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fileStream = New-Object System.IO.FileStream($dstIco, [System.IO.FileMode]::Create)
$icon.Save($fileStream)
$fileStream.Close()
$icon.Dispose()
$bmp256.Dispose()
$img.Dispose()

Write-Output "SUCCESS: Icon created at $dstIco and $dstPng"
