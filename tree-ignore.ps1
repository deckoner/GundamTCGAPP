# tree-ignore.ps1
# Muestra árbol de directorios /F ignorando ciertas carpetas

param (
    [string]$Path = ".",
    [string[]]$Ignore = @(".astro", ".vscode", "node_modules"),
    [string]$Prefix = ""
)

function Show-Tree {
    param (
        [string]$Folder,
        [string]$Prefix
    )

    # Obtener carpetas filtradas
    $dirs = Get-ChildItem -LiteralPath $Folder -Directory | Where-Object { $Ignore -notcontains $_.Name } | Sort-Object Name
    $files = Get-ChildItem -LiteralPath $Folder -File | Sort-Object Name

    $count = $dirs.Count + $files.Count
    $i = 0

    foreach ($dir in $dirs) {
        $i++
        $isLast = ($i -eq $count)
        Write-Host "$Prefix├─[$($dir.Name)]"
        Show-Tree -Folder $dir.FullName -Prefix "$Prefix│   "
    }

    foreach ($file in $files) {
        $i++
        $isLast = ($i -eq $count)
        Write-Host "$Prefix├─$($file.Name)"
    }
}

Show-Tree -Folder $Path -Prefix ""
