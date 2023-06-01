version=$(cat ../package.json | jq -r ".version")
image="ghcr.io/slotify/games/dreamspin:v"$version

exists=$(docker pull "$image" >/dev/null 2>&1 && echo 1 || echo 0)
if [ "$exists" -eq 0 ]; then
  echo "$image" to be deployed
  echo "Building & pushing"
  DOCKER_BUILDKIT=1 docker buildx build --platform linux/amd64 --push -t "$image" ..
else
  echo "$image" alread exists
fi
