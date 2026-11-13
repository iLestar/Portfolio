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

Write-Output 'Exportando MySQL sin modificar la base de datos...'
$sqlPath = Join-Path $staging 'database.sql'
$info = [Diagnostics.ProcessStartInfo]::new('docker.exe')
$info.UseShellExecute = $false
$info.RedirectStandardOutput = $true
$info.RedirectStandardError = $true
$info.CreateNoWindow = $true
foreach ($argument in @('exec', 'lestar-mysql', 'sh', '-c', 'MYSQL_PWD="$MYSQL_PASSWORD" exec mysqldump --user="$MYSQL_USER" --single-transaction --quick --no-tablespaces --set-gtid-purged=OFF --hex-blob --default-character-set=utf8mb4 "$MYSQL_DATABASE"')) {
    $info.ArgumentList.Add($argument)
}
$process = [Diagnostics.Process]::Start($info)
$errorsTask = $process.StandardError.ReadToEndAsync()
$sqlStream = [IO.File]::Create($sqlPath)
try { $process.StandardOutput.BaseStream.CopyTo($sqlStream) } finally { $sqlStream.Dispose() }
$process.WaitForExit()
$dumpErrors = $errorsTask.GetAwaiter().GetResult()
if ($process.ExitCode -ne 0) { throw "MySQL no se pudo exportar. No se creó un ZIP: $dumpErrors" }
$sql = [IO.File]::ReadAllText($sqlPath)
if ($sql -notmatch 'CREATE TABLE `projects`' -or $sql -notmatch 'INSERT INTO `projects`') { throw 'El volcado no contiene la estructura y los proyectos esperados.' }

Write-Output 'Copiando imágenes y documentos...'
[IO.Directory]::CreateDirectory((Join-Path $staging 'uploads')) | Out-Null
Get-ChildItem -LiteralPath $uploads -File | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $staging 'uploads') }

$instructions = @'
RESPALDO LOCAL DEL PORTAFOLIO

Contenido: database.sql, uploads/, manifest.json.
No incluye .env ni el código fuente: conserva el código en Git y la configuración de forma privada.

Restauración (con el código del proyecto y Docker Desktop disponibles):
1. Detén la API para evitar escrituras durante la restauración.
2. Descomprime este ZIP y comprueba manifest.json si quieres verificar sus hashes SHA-256.
3. Desde la carpeta del proyecto: docker compose up -d
4. Espera a que MySQL esté listo. Antes de sobrescribir datos existentes, haz otro respaldo.
5. Desde la carpeta descomprimida: docker cp database.sql lestar-mysql:/tmp/portfolio-restore.sql
6. Importa con:
   docker exec lestar-mysql sh -c 'MYSQL_PWD="$MYSQL_PASSWORD" mysql --user="$MYSQL_USER" --default-character-set=utf8mb4 "$MYSQL_DATABASE" < /tmp/portfolio-restore.sql'
7. Copia el contenido de uploads/ a server/uploads/ del proyecto, conservando los nombres.
8. Inicia la API y el frontend. Revisa las fichas, imágenes y descargas.

El SQL incluye DROP TABLE: la importación reemplaza las tablas de la base configurada.
Este ZIP puede contener mensajes privados del formulario; guárdalo en un lugar privado.
'@
[IO.File]::WriteAllText((Join-Path $staging 'RESTAURAR.txt'), $instructions, [Text.UTF8Encoding]::new($false))

$records = @(Get-ChildItem -LiteralPath $staging -File -Recurse | ForEach-Object {
    [ordered]@{
        path = [IO.Path]::GetRelativePath($staging, $_.FullName).Replace('\', '/')
        bytes = $_.Length
        sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
    }
})
$manifest = [ordered]@{ createdAt = [DateTimeOffset]::UtcNow.ToString('o'); timezone = 'America/Bogota'; database = 'portfolio'; uploadedFiles = @($records | Where-Object { $_.path.StartsWith('uploads/') }).Count; files = $records }
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
[IO.Directory]::Delete($staging)
$checksum = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
[IO.File]::WriteAllText("$archivePath.sha256", "$checksum  $backupName.zip`n")
Write-Output "Respaldo verificado: $archivePath"
Write-Output "Archivos subidos: $($manifest.uploadedFiles)"
Write-Output "Tamaño: $([Math]::Round((Get-Item -LiteralPath $archivePath).Length / 1MB, 1)) MiB"
