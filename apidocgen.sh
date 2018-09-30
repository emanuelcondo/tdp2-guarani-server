#Script to call the apidoc command on the project
apidoc -i ./src -o ./docs
if [ "$(uname)" == "Darwin" ]; then
	open ./docs/index.html
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
	xdg-open ./docs/index.html
fi
