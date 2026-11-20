param(
    [string]$Destination = 'D:\Descargas\Documents\RespaldosPortfolio'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$uploads = Join-Path $projectRoot 'server\uploads'
$timestamp = [TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTimeOffset]::UtcNow, 'SA Pacific Standard Time').ToString('yyyy-MM-dd-HHmmss')
$backupName = "portfolio-respaldo-$timestamp"
$destinationRoot = [IO.Path]::GetFullPath($Destination)
[IO.Directory]::CreateDirectory($destinationRoot) | Out-Null
$staging = Join-Path $destinationRoot "$backupName-files"
$archivePath = Join-Path $destinationRoot "$backupName.zip"
if ((Test-Path -LiteralPath $staging) -or (Test-Path -LiteralPath $archivePath)) { throw 'Ya existe un respaldo con esta fecha. Reintenta en unos segundos.' }
[IO.Directory]::CreateDirectory($staging) | Out-Null

Write-Output 'Copiando los archivos JSON...'
[IO.Directory]::CreateDirectory((Join-Path $staging 'data')) | Out-Null
foreach ($name in @('projects.json', 'messages.json')) {
    $source = Join-Path $projectRoot "server\data\$name"
    $content = Get-Content -LiteralPath $source -Raw | ConvertFrom-Json
    if ($null -eq $content.items -or $content.nextId -lt 1) { throw "JSON inválido: $name" }
    Copy-Item -LiteralPath $source -Destination (Join-Path $staging 'data')
}
Write-Output 'Copiando imágenes y documentos...'
if (Test-Path -LiteralPath (Join-Path $projectRoot 'server\data\publication.json')) { Copy-Item -LiteralPath (Join-Path $projectRoot 'server\data\publication.json') -Destination (Join-Path $staging 'data') }
[IO.Directory]::CreateDirectory((Join-Path $staging 'uploads')) | Out-Null
Get-ChildItem -LiteralPath $uploads -File | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $staging 'uploads') }

$instructions = @'
RESPALDO LOCAL DEL PORTAFOLIO — ALMACENAMIENTO JSON

Contenido: data/projects.json, data/messages.json, uploads/, manifest.json.
No incluye .env ni el código fuente: conserva el código en Git y la configuración de forma privada.

Restauración (con el código del proyecto disponible):
1. Detén la API para evitar escrituras durante la restauración.
2. Descomprime este ZIP y comprueba los hashes SHA-256 de manifest.json.
3. Haz un respaldo de los datos actuales antes de reemplazar archivos.
4. Copia data/projects.json y data/messages.json a server/data/ del proyecto.
5. Copia uploads/ a server/uploads/, conservando todos los nombres.
6. Inicia la API y guarda un proyecto existente desde el panel para actualizar la copia pública.
7. Compila el frontend para preparar la versión pública. Revisa fichas, imágenes y descargas.

Los JSON contienen borradores y mensajes privados. Conserva este ZIP en un lugar privado.
Utiliza respaldos que contengan data/projects.json y data/messages.json.
'@
[IO.File]::WriteAllText((Join-Path $staging 'RESTAURAR.txt'), $instructions, [Text.UTF8Encoding]::new($false))

$records = @(Get-ChildItem -LiteralPath $staging -File -Recurse | ForEach-Object {
    [ordered]@{
        path = [IO.Path]::GetRelativePath($staging, $_.FullName).Replace('\', '/')
        bytes = $_.Length
        sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
    }
})
$manifest = [ordered]@{ createdAt = [DateTimeOffset]::UtcNow.ToString('o'); timezone = 'America/Bogota'; storage = 'json'; uploadedFiles = @($records | Where-Object { $_.path.StartsWith('uploads/') }).Count; files = $records }
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $staging 'manifest.json') -Encoding utf8

Write-Output 'Creando ZIP y verificando cada archivo con SHA-256...'
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($staging, $archivePath, [IO.Compression.CompressionLevel]::Fastest, $false)
$zip = [IO.Compression.ZipFile]::OpenRead($archivePath)
try {
    foreach ($record in $records) {
        $entry = $zip.GetEntry($record.path)
        if (-not $entry -or $entry.Length -ne $record.bytes) { throw "Archivo ausente o incompleto: $($record.path)" }
        $stream = $entry.Open()
        $hash = [Security.Cryptography.SHA256]::Create()
        try { $actual = [Convert]::ToHexString($hash.ComputeHash($stream)) } finally { $stream.Dispose(); $hash.Dispose() }
        if ($actual -ne $record.sha256) { throw "Error de integridad: $($record.path)" }
    }
    if (-not $zip.GetEntry('manifest.json')) { throw 'Falta el manifiesto.' }
} finally { $zip.Dispose() }

# Delete only the files this run created, after verifying the archive.
foreach ($record in $records) { Remove-Item -LiteralPath (Join-Path $staging $record.path) }
Remove-Item -LiteralPath (Join-Path $staging 'manifest.json')
[IO.Directory]::Delete((Join-Path $staging 'uploads'))
[IO.Directory]::Delete((Join-Path $staging 'data'))
[IO.Directory]::Delete($staging)
$checksum = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
[IO.File]::WriteAllText("$archivePath.sha256", "$checksum  $backupName.zip`n")
Write-Output "Respaldo verificado: $archivePath"
Write-Output "Archivos subidos: $($manifest.uploadedFiles)"
Write-Output "Tamaño: $([Math]::Round((Get-Item -LiteralPath $archivePath).Length / 1MB, 1)) MiB"
