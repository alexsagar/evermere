# Samples browser and Node.js load for this machine during a local test run.
# Usage: powershell -File scripts/measure-resources.ps1 [-Seconds 60]
# Reports average/peak CPU (% of all cores), peak RAM and peak process counts.
param([int]$Seconds = 60, [int]$Interval = 3)
$names = 'chrome-headless-shell', 'node'
$cores = [Environment]::ProcessorCount
$stats = @{}
foreach ($n in $names) { $stats[$n] = @{ cpu = @(); ram = 0; count = 0 } }
$prev = Get-Process -Name $names -ErrorAction SilentlyContinue | Select-Object Id, Name, CPU
for ($t = 0; $t -lt $Seconds; $t += $Interval) {
  Start-Sleep $Interval
  $now = Get-Process -Name $names -ErrorAction SilentlyContinue
  foreach ($n in $names) {
    $p = @($now | Where-Object { $_.Name -eq $n })
    $delta = 0
    foreach ($x in $p) { $o = $prev | Where-Object { $_.Id -eq $x.Id }; if ($o -and $x.CPU) { $delta += ($x.CPU - $o.CPU) } }
    $stats[$n].cpu += ($delta / $Interval / $cores * 100)
    $ram = ($p | Measure-Object WorkingSet64 -Sum).Sum / 1MB
    if ($ram -gt $stats[$n].ram) { $stats[$n].ram = $ram }
    if ($p.Count -gt $stats[$n].count) { $stats[$n].count = $p.Count }
  }
  $prev = $now | Select-Object Id, Name, CPU
}
foreach ($n in $names) {
  $c = $stats[$n].cpu
  "{0}: avg CPU {1:N1}% peak CPU {2:N1}% peak RAM {3:N0} MB peak processes {4}" -f $n, ($c | Measure-Object -Average).Average, ($c | Measure-Object -Maximum).Maximum, $stats[$n].ram, $stats[$n].count
}
