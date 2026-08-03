# generate_eula_rtf.ps1 - v2
# Generates a multilingual RTF EULA for NSIS installer from individual language files
# Proper \uNNNN? encoding for Unicode characters

$publicDir = "public"

function ConvertTo-RtfText {
    param([string]$text)
    $sb = New-Object System.Text.StringBuilder
    foreach ($char in $text.ToCharArray()) {
        $code = [int]$char
        if ($char -eq '\')       { [void]$sb.Append('\\') }
        elseif ($char -eq '{')   { [void]$sb.Append('\{') }
        elseif ($char -eq '}')   { [void]$sb.Append('\}') }
        elseif ($code -lt 128)   { [void]$sb.Append($char) }
        elseif ($code -le 255)   {
            # Latin-1 range: use \'xx hex encoding
            [void]$sb.Append("\'" + $code.ToString("x2"))
        } else {
            # Unicode: use \uNNNN? (signed 16-bit decimal)
            $rtfCode = if ($code -gt 32767) { $code - 65536 } else { $code }
            # The ? is the fallback character for ANSI renderers
            [void]$sb.Append("\u$rtfCode`?")
        }
    }
    return $sb.ToString()
}

$rtf = New-Object System.Text.StringBuilder
[void]$rtf.Append('{\rtf1\ansi\ansicpg1252\deff0\deflang1033' + [char]13 + [char]10)
[void]$rtf.Append('{\fonttbl{\f0\fswiss\fcharset0 Arial;}{\f1\fnil\fcharset134 Arial Unicode MS;}}' + [char]13 + [char]10)
[void]$rtf.Append('{\colortbl;\red0\green0\blue0;}' + [char]13 + [char]10)
[void]$rtf.Append('\viewkind4\uc1\pard\f0\fs18' + [char]13 + [char]10)

# Intro header
[void]$rtf.Append('\b\fs22 NetMajik v1.0.8 - End User License Agreement / Acuerdo de Licencia\b0\fs18\par' + [char]13 + [char]10)
[void]$rtf.Append('\par' + [char]13 + [char]10)
[void]$rtf.Append('Scroll to find your language. / Despl' + (ConvertTo-RtfText 'á') + 'zate para encontrar tu idioma.\par' + [char]13 + [char]10)
[void]$rtf.Append('\par' + [char]13 + [char]10)
[void]$rtf.Append('==================================================================\par' + [char]13 + [char]10)
[void]$rtf.Append('\par' + [char]13 + [char]10)

$languages = @(
    @{Label="ENGLISH";       File="eula_en.txt"},
    @{Label="ESPANOL";       File="eula_es.txt"},
    @{Label="PORTUGUES";     File="eula_pt.txt"},
    @{Label="DEUTSCH";       File="eula_de.txt"},
    @{Label="FRANCAIS";      File="eula_fr.txt"},
    @{Label="CHINESE";       File="eula_zh.txt"},
    @{Label="JAPANESE";      File="eula_ja.txt"}
)

foreach ($lang in $languages) {
    $label = ConvertTo-RtfText $lang.Label
    [void]$rtf.Append("\b\fs20 === $label ===\b0\fs18\par" + [char]13 + [char]10)
    [void]$rtf.Append('\par' + [char]13 + [char]10)

    $filepath = Join-Path $publicDir $lang.File
    if (Test-Path $filepath) {
        $content = [System.IO.File]::ReadAllText((Join-Path (Get-Location) $filepath), [System.Text.Encoding]::UTF8)
        $lines = $content -split "`r?`n"
        foreach ($line in $lines) {
            $encoded = ConvertTo-RtfText $line
            [void]$rtf.Append("$encoded\par" + [char]13 + [char]10)
        }
    } else {
        [void]$rtf.Append("[File not found: $($lang.File)]\par" + [char]13 + [char]10)
    }

    [void]$rtf.Append('\par' + [char]13 + [char]10)
    [void]$rtf.Append('------------------------------------------------------------------\par' + [char]13 + [char]10)
    [void]$rtf.Append('\par' + [char]13 + [char]10)
}

[void]$rtf.Append('}' + [char]13 + [char]10)

$outPath = (Join-Path (Get-Location) $publicDir) + "\eula.rtf"

# Write as ASCII (all non-ASCII is encoded as \uNNNN? or \'xx so output is safe ASCII)
[System.IO.File]::WriteAllText($outPath, $rtf.ToString(), [System.Text.Encoding]::ASCII)

Write-Host "RTF EULA generated: $outPath"
$item = Get-Item $outPath
Write-Host "File size: $($item.Length) bytes"

# Quick verification - check for Chinese chars
$sample = $rtf.ToString() | Select-String -Pattern "\\u26368" # 最
if ($sample) {
    Write-Host "CJK encoding verified OK (found Chinese character codes)"
} else {
    Write-Host "WARNING: CJK encoding may be missing - check eula_zh.txt"
}
