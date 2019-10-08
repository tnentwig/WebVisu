$env:FLASK_ENV="development"
$env:FLASK_APP="localhost.py"
Write-Output "Hallo"
python -m flask run
